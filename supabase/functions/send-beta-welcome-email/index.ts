import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { record } = payload
    const email = record?.email

    console.log(`[BetaWelcome] Received webhook. Payload:`, JSON.stringify(payload))

    if (!email) {
      console.error("[BetaWelcome] No email found in record:", record)
      return new Response(JSON.stringify({ error: "No email provided" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      })
    }

    console.log(`[BetaWelcome] Sending email to: ${email}`)

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "The HealthyHerd Team <beta@healthyherd.app>",
        to: email,
        cc: ["info@healthyherd.app"],
        subject: "Welcome to the HealthyHerd Beta! 🐄",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4f7f6; }
                .container { max-width: 600px; margin: 20px auto; padding: 30px; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .header { text-align: center; margin-bottom: 30px; }
                .title { color: #10b981; font-size: 28px; margin-bottom: 10px; }
                .subtitle { color: #6b7280; font-size: 16px; }
                .highlight-box { background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 30px; border-radius: 0 8px 8px 0; }
                .section-title { color: #111827; margin-top: 25px; font-size: 1.2rem; }
                .list { padding-left: 20px; }
                .list-item { margin-bottom: 12px; }
                .pwa-box { background-color: #f8fafc; border: 1px dashed #3b82f6; padding: 20px; border-radius: 10px; margin-top: 30px; }
                .pwa-title { color: #1e3a8a; font-weight: 700; margin-top: 0; margin-bottom: 10px; }
                .cta-box { margin-top: 30px; padding: 25px; background-color: #f9fafb; border-radius: 12px; text-align: center; }
                .btn { background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; transition: background-color 0.2s; }
                .footer { margin-top: 40px; border-top: 1px solid #edf2f7; padding-top: 25px; text-align: center; font-size: 0.85rem; color: #9ca3af; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 class="title">Welcome to HealthyHerd!</h1>
                  <p class="subtitle">Smart herd management for the modern farmer.</p>
                </div>

                <div class="highlight-box">
                  <p style="margin: 0; color: #065f46; font-weight: 600;">
                    Beta Benefit: Your account is completely free until our official commercial release!
                  </p>
                </div>

                <p>Hi there,</p>
                <p>Thank you for choosing HealthyHerd. You've taken a significant step toward smarter, more profitable, and stress-free herd management.</p>

                <h3 class="section-title">Getting Started:</h3>
                <ul class="list">
                  <li class="list-item"><strong>Easy Import:</strong> Move your existing records in seconds via CSV import.</li>
                  <li class="list-item"><strong>Traceability:</strong> Automatically maintain state-vet compliant ledgers.</li>
                  <li class="list-item"><strong>Smart Health:</strong> Auto-calculate medication dosages based on animal weight.</li>
                  <li class="list-item"><strong>Offline Ready:</strong> Record field notes anywhere; we sync when you're back in range.</li>
                </ul>

                <div class="pwa-box">
                  <h3 class="pwa-title">📲 Add HealthyHerd to your Home Screen</h3>
                  <p style="font-size: 0.95rem; color: #334155; margin-bottom: 10px;">For the best experience in the field, install HealthyHerd on your phone:</p>
                  <ul style="font-size: 0.9rem; color: #475569; padding-left: 20px;">
                    <li style="margin-bottom: 8px;"><strong>iPhone (Safari):</strong> Tap the <strong>Share icon</strong> (square with arrow) at the bottom, then scroll down and select <strong>"Add to Home Screen"</strong>.</li>
                    <li><strong>Android (Chrome):</strong> Tap the <strong>three dots menu</strong> (⋮) in the top right corner, then select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  </ul>
                </div>

                <div class="cta-box">
                  <p style="margin-bottom: 20px; font-weight: 600; color: #374151;">Ready to record your first animal?</p>
                  <a href="https://app.healthyherd.app/dashboard" class="btn">Go to Dashboard</a>
                </div>

                <p style="margin-top: 30px; font-size: 0.9rem; color: #64748b;">
                  Need help? Reach out any time at <a href="mailto:info@healthyherd.app" style="color: #10b981; text-decoration: none; font-weight: 500;">info@healthyherd.app</a>.
                </p>

                <div class="footer">
                  <p>
                    Best regards,<br>
                    <strong>The HealthyHerd Team</strong><br>
                    🇿🇦 Proudly developed in South Africa
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const resData = await res.json();
    console.log(`[BetaWelcome] Resend response status: ${res.status}`);
    console.log(`[BetaWelcome] Resend response body:`, JSON.stringify(resData));

    if (!res.ok) {
      throw new Error(`Resend API error (${res.status}): ${JSON.stringify(resData)}`)
    }

    return new Response(JSON.stringify({ success: true, res: resData }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })

  } catch (error) {
    console.error("Error sending Beta Welcome email:", error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  }
})
