import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

serve(async (req) => {
  try {
    const { record } = await req.json()
    const email = record.email

    if (!email) {
      return new Response(JSON.stringify({ error: "No email provided" }), { status: 400 })
    }

    console.log(`Sending Beta Welcome email to: ${email}`)

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "The HealthyHerd Team <beta@healthyherd.app>",
        to: email,
        subject: "Welcome to the HealthyHerd Beta! 🐄",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; font-size: 28px; margin-bottom: 10px;">Welcome to HealthyHerd!</h1>
              <p style="color: #6b7280; font-size: 16px;">We're thrilled to have you in our Beta Program.</p>
            </div>

            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 30px;">
              <p style="margin: 0; color: #065f46; font-weight: 600;">
                Beta Benefit: Your account is completely free until our official commercial release!
              </p>
            </div>

            <p>Hi there,</p>
            <p>Thank you for choosing HealthyHerd to digitise your farm operations. You've taken the first step towards smarter, more profitable herd management.</p>

            <h3 style="color: #111827; margin-top: 25px;">Getting Started with HealthyHerd:</h3>
            <ul style="padding-left: 20px;">
              <li style="margin-bottom: 12px;">
                <strong>Log Your First Animal:</strong> Head to the "Add Animal" section to start building your digital herd.
              </li>
              <li style="margin-bottom: 12px;">
                <strong>Track Health & Weights:</strong> Use our smart analytics to monitor growth and manage vaccinations with ease.
              </li>
              <li style="margin-bottom: 12px;">
                <strong>Work Anywhere:</strong> Don't forget, HealthyHerd works offline! Your data syncs automatically once you're back in range.
              </li>
              <li style="margin-bottom: 12px;">
                <strong>FMD Compliance:</strong> Maintain accurate, state-vet compliant ledgers effortlessly.
              </li>
            </ul>

            <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
              <p style="margin-bottom: 20px; font-weight: 500;">Ready to start your first record?</p>
              <a href="https://app.healthyherd.app/dashboard" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Go to Dashboard</a>
            </div>

            <p style="margin-top: 30px; font-size: 0.9rem; color: #4b5563;">
              As a Beta tester, your feedback is invaluable to us. If you encounter any bugs or have suggestions for improvements, please reach out to us at <a href="mailto:beta@healthyherd.app" style="color: #10b981;">beta@healthyherd.app</a>.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 0.8rem; color: #9ca3af; text-align: center;">
              Best regards,<br>
              <strong>The HealthyHerd Team</strong><br>
              🇿🇦 Proudly developed in South Africa
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`)
    }

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } })

  } catch (error) {
    console.error("Error sending Beta Welcome email:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
})
