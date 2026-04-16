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
    const authHeader = req.headers.get('Authorization')
    const customSecretHeader = req.headers.get('x-support-db-secret')
    const DB_SECRET = "7f5e8a3d-9b4c-4e8a-9f2d-6b1a2c3d4e5f" // Shared secret with DB trigger
    
    // Verify either the service role key OR our shared DB secret
    // This allows the DB trigger on remote to talk to the function without needing the service role secret in the DB settings
    if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` && customSecretHeader !== DB_SECRET) {
      console.error("[SupportRequest] Unauthorized call attempt")
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      })
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const payload = await req.json()
    const { record } = payload

    if (!record) {
      throw new Error("No record provided in payload")
    }

    // Fetch user email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(record.user_id)
    if (userError) throw userError;
    const userEmail = user?.email || 'Unknown User'

    console.log(`[SupportRequest] Processing ${record.type} from ${userEmail}`)

    if (!RESEND_API_KEY) {
      console.error("[SupportRequest] RESEND_API_KEY is not set in environment variables")
      throw new Error("Email service not configured")
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "HealthyHerd Support <beta@healthyherd.app>",
        to: "support@healthyherd.app",
        cc: "djb.rsa@gmail.com",
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
    if (!res.ok) {
      console.error("[SupportRequest] Resend API Error:", resData)
      throw new Error(`Resend error: ${JSON.stringify(resData)}`)
    }

    console.log(`[SupportRequest] Email sent successfully for request ${record.id}`)

    return new Response(JSON.stringify({ success: true, message_id: resData.id }), { 
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
