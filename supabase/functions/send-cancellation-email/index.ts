import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY        = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg',
  })

const emailStyles = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4f7f6; }
  .container { max-width: 600px; margin: 20px auto; padding: 30px; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { text-align: center; margin-bottom: 28px; }
  .title { font-size: 24px; margin-bottom: 6px; }
  .alert-box { padding: 16px 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid; }
  .alert-warning { background: #FFFBEB; border-color: #F59E0B; color: #92400E; }
  .alert-danger  { background: #FEF2F2; border-color: #EF4444; color: #991B1B; }
  .alert-info    { background: #F0F9FF; border-color: #3B82F6; color: #1E40AF; }
  .btn { display: inline-block; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px; }
  .btn-primary { background-color: #10b981; color: #ffffff; }
  .btn-danger  { background-color: #EF4444; color: #ffffff; }
  .footer { margin-top: 40px; border-top: 1px solid #edf2f7; padding-top: 20px; text-align: center; font-size: 0.82rem; color: #9ca3af; }
`

// ─── Email builders ────────────────────────────────────────────────────────────

type EmailType = 'cancellation_initiated' | 'reminder_7' | 'reminder_1' | 'deactivated'

interface EmailPayload {
  type: EmailType
  userId: string
  userEmail: string
  cancellationEndsAt: string
}

function buildEmail(payload: EmailPayload): { subject: string; html: string } {
  const endDate = formatDate(payload.cancellationEndsAt)

  switch (payload.type) {
    case 'cancellation_initiated':
      return {
        subject: 'Your HealthyHerd subscription has been cancelled',
        html: `<!DOCTYPE html><html><head><style>${emailStyles}</style></head><body>
          <div class="container">
            <div class="header">
              <div style="font-size:48px;margin-bottom:8px;">🐄</div>
              <h1 class="title" style="color:#EF4444;">Subscription Cancelled</h1>
            </div>
            <p>Hi there,</p>
            <p>We've received your cancellation request. Your account will remain fully active until:</p>
            <div class="alert-box alert-warning">
              <strong style="font-size:1.1rem;">📅 Access ends: ${endDate}</strong>
            </div>
            <p>During this period you can continue using all HealthyHerd features as normal.</p>
            <h3 style="color:#111827;">Important — before your access ends:</h3>
            <ul style="padding-left:20px;line-height:2;">
              <li>📥 <strong>Export all your data</strong> using the Export CSV tool on the Billing page</li>
              <li>🗑️ All your data will be <strong>permanently destroyed</strong> after your access ends</li>
              <li>↩️ You can <strong>resume your subscription</strong> at any time before the access-end date</li>
            </ul>
            <div style="text-align:center;margin-top:28px;">
              <a href="https://app.healthyherd.app/billing" class="btn btn-primary">Go to Billing Page</a>
            </div>
            <p style="margin-top:24px;font-size:0.85rem;color:#6B7280;">
              User ID (for reference): <code>${payload.userId}</code>
            </p>
            <div class="footer">
              <p>The HealthyHerd Team · 🇿🇦 Proudly developed in South Africa<br>
              Questions? <a href="mailto:info@healthyherd.app" style="color:#10b981;">info@healthyherd.app</a></p>
            </div>
          </div>
        </body></html>`,
      }

    case 'reminder_7':
      return {
        subject: '⚠️ Your HealthyHerd account expires in 7 days — export your data',
        html: `<!DOCTYPE html><html><head><style>${emailStyles}</style></head><body>
          <div class="container">
            <div class="header">
              <div style="font-size:48px;margin-bottom:8px;">⚠️</div>
              <h1 class="title" style="color:#D97706;">7-Day Reminder</h1>
            </div>
            <p>Hi there,</p>
            <p>This is a reminder that your HealthyHerd account will be <strong>permanently deactivated</strong> in approximately 7 days:</p>
            <div class="alert-box alert-warning">
              <strong style="font-size:1.1rem;">📅 Access ends: ${endDate}</strong>
            </div>
            <p>After this date, all your data will be permanently destroyed and cannot be recovered.</p>
            <h3 style="color:#111827;">Act now — export your data or resume your subscription:</h3>
            <div style="text-align:center;margin-top:20px;display:flex;flex-direction:column;gap:10px;">
              <a href="https://app.healthyherd.app/billing" class="btn btn-primary" style="margin-bottom:10px;">Export My Data</a>
              <a href="https://app.healthyherd.app/billing" class="btn" style="background:#F3F4F6;color:#374151;border:1px solid #D1D5DB;">Resume My Subscription</a>
            </div>
            <div class="footer">
              <p>The HealthyHerd Team · <a href="mailto:info@healthyherd.app" style="color:#10b981;">info@healthyherd.app</a></p>
            </div>
          </div>
        </body></html>`,
      }

    case 'reminder_1':
      return {
        subject: '🚨 Final warning: HealthyHerd account expires tomorrow',
        html: `<!DOCTYPE html><html><head><style>${emailStyles}</style></head><body>
          <div class="container">
            <div class="header">
              <div style="font-size:48px;margin-bottom:8px;">🚨</div>
              <h1 class="title" style="color:#EF4444;">Final Warning</h1>
            </div>
            <p>Hi there,</p>
            <p>Your HealthyHerd account will be permanently deactivated very soon:</p>
            <div class="alert-box alert-danger">
              <strong style="font-size:1.1rem;">📅 Access ends: ${endDate}</strong>
            </div>
            <p>This is your <strong>last chance</strong> to export your data or resume your subscription. After this date, all data will be permanently destroyed and cannot be recovered.</p>
            <div style="text-align:center;margin-top:20px;">
              <a href="https://app.healthyherd.app/billing" class="btn btn-danger" style="margin-bottom:10px;display:block;">⚡ Take Action Now</a>
            </div>
            <div class="footer">
              <p>The HealthyHerd Team · <a href="mailto:info@healthyherd.app" style="color:#10b981;">info@healthyherd.app</a></p>
            </div>
          </div>
        </body></html>`,
      }

    case 'deactivated':
      return {
        subject: 'Your HealthyHerd account has been deactivated',
        html: `<!DOCTYPE html><html><head><style>${emailStyles}</style></head><body>
          <div class="container">
            <div class="header">
              <div style="font-size:48px;margin-bottom:8px;">🔒</div>
              <h1 class="title" style="color:#374151;">Account Deactivated</h1>
            </div>
            <p>Hi there,</p>
            <p>Your HealthyHerd subscription has ended and your account has been deactivated. All data associated with your account will be permanently deleted.</p>
            <div class="alert-box alert-info">
              <p style="margin:0;">If you'd like to start using HealthyHerd again in the future, you're always welcome back. 
              Contact us at <a href="mailto:info@healthyherd.app" style="color:#1D4ED8;">info@healthyherd.app</a> and we'll help you get set up.</p>
            </div>
            <p>Thank you for being part of the HealthyHerd community.</p>
            <div class="footer">
              <p>The HealthyHerd Team · 🇿🇦 Proudly developed in South Africa</p>
            </div>
          </div>
        </body></html>`,
      }
  }
}

// ─── Main handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Accept calls from authenticated users (JWT) OR the cron worker (service role)
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE!)

    const payload: EmailPayload = await req.json()
    const { type, userId, userEmail, cancellationEndsAt } = payload

    if (!type || !userId || !userEmail || !cancellationEndsAt) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`[CancellationEmail] Sending type="${type}" to ${userEmail}`)

    const { subject, html } = buildEmail(payload)

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "The HealthyHerd Team <beta@healthyherd.app>",
        to: userEmail,
        cc: ["info@healthyherd.app"],   // CC admin on all cancellation emails
        subject,
        html,
      }),
    })

    const resData = await res.json()
    if (!res.ok) throw new Error(`Resend error (${res.status}): ${JSON.stringify(resData)}`)

    console.log(`[CancellationEmail] Sent successfully — type="${type}", id=${resData.id}`)
    return new Response(JSON.stringify({ success: true, id: resData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    console.error('[CancellationEmail] Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
