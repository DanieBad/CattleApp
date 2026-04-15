import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const payload = await req.json()
    const { record } = payload

    if (!record) {
      throw new Error("No record provided in payload")
    }

    // Fetch user email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(record.user_id)
    const userEmail = user?.email || 'Unknown User'

    console.log(`[SupportRequest] Processing ${record.type} from ${userEmail}`)

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "HealthyHerd Support <beta@healthyherd.app>",
        to: "beta@healthyherd.app",
        reply_to: userEmail,
        subject: `[${record.type}] ${record.subject}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">New Support Request</h2>
            
            <p><strong>Type:</strong> ${record.type}</p>
            <p><strong>Priority:</strong> ${record.priority}</p>
            <p><strong>From:</strong> ${userEmail} (User ID: ${record.user_id})</p>
            <p><strong>Subject:</strong> ${record.subject}</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #e5e7eb;">
              <p style="margin-top: 0;"><strong>Description:</strong></p>
              <p style="white-space: pre-wrap;">${record.description}</p>
            </div>
            
            <p style="margin-top: 30px; font-size: 0.8rem; color: #666;">
              This request was submitted via the HealthyHerd Support page and logged as ID: ${record.id}
            </p>
          </div>
        `,
      }),
    });

    const resData = await res.json();
    if (!res.ok) throw new Error(`Resend error: ${JSON.stringify(resData)}`)

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })

  } catch (error) {
    console.error("Error processing support request:", error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  }
})
