Deno.serve(async (req) => {
  try {
    // 1. Parse the incoming webhook data from Supabase
    const { record } = await req.json()
    const email = record.email

    if (!email) {
      return new Response("No email provided", { status: 400 })
    }

    console.log(`Sending Resend confirmation to: ${email}`)

    // 2. Get Resend API Key from secrets
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY secret")
    }

    // 3. Send the Email via Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "The HealthyHerd Team <beta@healthyherd.app>",
        to: email,
        subject: "Welcome to the HealthyHerd Beta Waitlist!",
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <p>Hello,</p>
            <p>Thank you for your interest in <strong>HealthyHerd</strong>! We've received your request to join our priority beta waitlist.</p>
            <p>Our team is currently reviewing applications to ensure we provide the best possible experience for our early adopters. You will receive an email from us with your unique login details and onboarding instructions as soon as a spot becomes available.</p>
            <p>We are excited to have you on board!</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.8em; color: #777;">
              Best regards,<br>
              <strong>The HealthyHerd Team</strong><br>
              <a href="mailto:beta@healthyherd.app">beta@healthyherd.app</a>
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`)
    }

    const data = await res.json();

    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("Error sending email:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})

