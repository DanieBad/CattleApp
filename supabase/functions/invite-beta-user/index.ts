import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    // 1. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // 2. Validate the requester is an Admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Missing auth header' }), { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    if (user.email !== 'djb.rsa@gmail.com') {
         return new Response(JSON.stringify({ error: 'Forbidden: Admins only' }), { status: 403 })
    }

    // 3. Parse Request
    const { email, waitlistId } = await req.json()

    if (!email || !waitlistId) {
      return new Response(
        JSON.stringify({ error: 'Email and waitlistId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Inviting user: ${email}`)

    // 4. Generate the invite link programmatically (Bypasses Supabase SMTP rate limits)
    let linkDataRes, linkErrorRes;
    
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email: email,
        data: { invited_from_waitlist: true }
    });

    if (inviteError && inviteError.message.includes('already')) {
        console.log('User already exists, generating magic link instead.');
        const fallback = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email
        });
        linkDataRes = fallback.data;
        linkErrorRes = fallback.error;
    } else {
        linkDataRes = inviteData;
        linkErrorRes = inviteError;
    }

    if (linkErrorRes) {
        throw linkErrorRes;
    }

    const inviteLink = linkDataRes?.properties?.action_link;
    if (!inviteLink) {
        throw new Error('Failed to generate invite link from Supabase Auth');
    }

    // 5. Send the email using Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not set')
    }

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #059669;">Welcome to the HealthyHerd Beta!</h1>
        <p>You have been officially approved to join the HealthyHerd platform.</p>
        <p>Click the secure link below to set up your account and get started. This link can only be used once.</p>
        <div style="margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Activate Your Account
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 0.9em;">
          <a href="${inviteLink}">${inviteLink}</a>
        </p>
        <p>Looking forward to having you on board!</p>
        <p>— The HealthyHerd Team</p>
      </div>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'HealthyHerd Beta <onboarding@resend.dev>',
        to: email,
        subject: 'You have been invited to the HealthyHerd Beta!',
        html: emailHtml
      })
    });

    if (!resendRes.ok) {
        const errorText = await resendRes.text();
        throw new Error(`Resend API Error: ${errorText}`);
    }

    // 6. Update Waitlist Status
    const { error: updateError } = await supabaseAdmin
      .from('waitlist')
      .update({ status: 'invited' })
      .eq('id', waitlistId)

    if (updateError) {
        console.error("Failed to update waitlist status:", updateError)
        // We continue because the invite still sent
    }

    return new Response(
      JSON.stringify({ success: true, message: `Invite sent to ${email}` }),
      { 
        headers: { 
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
        } 
      }
    )

  } catch (error) {
    console.error("Error inviting user:", error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : JSON.stringify(error),
        full_error: Object.getOwnPropertyNames(error).reduce((acc, key) => { acc[key] = error[key]; return acc; }, {})
      }),
      { 
          status: 500, 
          headers: { 
              "Content-Type": "application/json",
              'Access-Control-Allow-Origin': '*',
          } 
       }
    )
  }
})
