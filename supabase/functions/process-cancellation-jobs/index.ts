import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const FUNCTION_BASE_URL     = `${SUPABASE_URL.replace('supabase.co', 'supabase.co')}/functions/v1`

// ─── TESTING_MODE timing windows ──────────────────────────────────────────────
// These define the ±window around each reminder point.
// TESTING_MODE: windows are in seconds/minutes.
// Production: change to days (see comments on each interval).

// 7-minute reminder window: fires when cancellation_ends_at is 6m30s–7m30s away
const WINDOW_7_LOWER = `6 minutes 30 seconds`   // TESTING_MODE: change to '6 days 12 hours'
const WINDOW_7_UPPER = `7 minutes 30 seconds`   // TESTING_MODE: change to '7 days 12 hours'

// 1-minute reminder window: fires when cancellation_ends_at is 30s–1m30s away
const WINDOW_1_LOWER = `30 seconds`             // TESTING_MODE: change to '12 hours'
const WINDOW_1_UPPER = `1 minute 30 seconds`    // TESTING_MODE: change to '36 hours'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Send an email via the send-cancellation-email function ───────────────────

async function sendCancellationEmail(
  type: string,
  userId: string,
  userEmail: string,
  cancellationEndsAt: string,
) {
  const res = await fetch(`${FUNCTION_BASE_URL}/send-cancellation-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
    },
    body: JSON.stringify({ type, userId, userEmail, cancellationEndsAt }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error(`[CronJobs] Failed to send ${type} email to ${userEmail}: ${err}`)
  } else {
    console.log(`[CronJobs] Sent ${type} email to ${userEmail}`)
  }
}

// ─── Main handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Auth: must be called with service role key (from cron-job.org)
  const authHeader = req.headers.get('Authorization') ?? ''
  if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE}`) {
    console.error('[CronJobs] Unauthorized attempt')
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
  const results = { reminders_7: 0, reminders_1: 0, deactivated: 0, errors: [] as string[] }

  // ── Step 1: 7-minute reminders ──────────────────────────────────────────────

  try {
    const { data: users7 } = await supabase
      .from('subscriptions')
      .select('user_id, cancellation_ends_at')
      .is('reminder_7_sent_at', null)
      .not('cancellation_ends_at', 'is', null)
      .gte('cancellation_ends_at', new Date(Date.now() + ms(WINDOW_7_LOWER)).toISOString())
      .lte('cancellation_ends_at', new Date(Date.now() + ms(WINDOW_7_UPPER)).toISOString())
      .not('status', 'in', '("cancelled","grace_period")')

    for (const row of users7 ?? []) {
      const { data: authUser } = await supabase.auth.admin.getUserById(row.user_id)
      if (!authUser?.user?.email) continue

      await sendCancellationEmail('reminder_7', row.user_id, authUser.user.email, row.cancellation_ends_at)

      // Stamp reminder sent
      await supabase
        .from('subscriptions')
        .update({ reminder_7_sent_at: new Date().toISOString() })
        .eq('user_id', row.user_id)

      results.reminders_7++
    }
  } catch (err: any) {
    results.errors.push(`7-min check: ${err.message}`)
    console.error('[CronJobs] 7-min reminder error:', err)
  }

  // ── Step 2: 1-minute reminders ──────────────────────────────────────────────

  try {
    const { data: users1 } = await supabase
      .from('subscriptions')
      .select('user_id, cancellation_ends_at')
      .is('reminder_1_sent_at', null)
      .not('cancellation_ends_at', 'is', null)
      .gte('cancellation_ends_at', new Date(Date.now() + ms(WINDOW_1_LOWER)).toISOString())
      .lte('cancellation_ends_at', new Date(Date.now() + ms(WINDOW_1_UPPER)).toISOString())
      .not('status', 'in', '("cancelled","grace_period")')

    for (const row of users1 ?? []) {
      const { data: authUser } = await supabase.auth.admin.getUserById(row.user_id)
      if (!authUser?.user?.email) continue

      await sendCancellationEmail('reminder_1', row.user_id, authUser.user.email, row.cancellation_ends_at)

      await supabase
        .from('subscriptions')
        .update({ reminder_1_sent_at: new Date().toISOString() })
        .eq('user_id', row.user_id)

      results.reminders_1++
    }
  } catch (err: any) {
    results.errors.push(`1-min check: ${err.message}`)
    console.error('[CronJobs] 1-min reminder error:', err)
  }

  // ── Step 3: Process expired cancellations (belt-and-suspenders) ─────────────

  try {
    const { data: expired } = await supabase.rpc('process_expired_cancellations')

    for (const row of expired ?? []) {
      const { data: authUser } = await supabase.auth.admin.getUserById(row.deactivated_user_id)
      if (!authUser?.user?.email) continue

      // Fetch the stored cancellation_ends_at for the email
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('cancellation_ends_at')
        .eq('user_id', row.deactivated_user_id)
        .single()

      await sendCancellationEmail(
        'deactivated',
        row.deactivated_user_id,
        authUser.user.email,
        sub?.cancellation_ends_at ?? new Date().toISOString(),
      )

      results.deactivated++
    }
  } catch (err: any) {
    results.errors.push(`expiry check: ${err.message}`)
    console.error('[CronJobs] Expiry check error:', err)
  }

  console.log('[CronJobs] Run complete:', results)
  return new Response(JSON.stringify({ success: true, ...results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

// ─── Utility: parse interval string to milliseconds ───────────────────────────

function ms(interval: string): number {
  let total = 0
  const dayMatch    = interval.match(/(\d+)\s*day/)
  const hourMatch   = interval.match(/(\d+)\s*hour/)
  const minMatch    = interval.match(/(\d+)\s*minute/)
  const secMatch    = interval.match(/(\d+)\s*second/)
  if (dayMatch)  total += parseInt(dayMatch[1])  * 86400000
  if (hourMatch) total += parseInt(hourMatch[1]) * 3600000
  if (minMatch)  total += parseInt(minMatch[1])  * 60000
  if (secMatch)  total += parseInt(secMatch[1])  * 1000
  return total
}
