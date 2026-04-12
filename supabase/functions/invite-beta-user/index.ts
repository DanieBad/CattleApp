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

    // 4. Invite user via Supabase Admin API
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { invited_from_waitlist: true }
    })

    if (inviteError) {
        // If the user already exists, we can just send them a password reset link instead
        if (inviteError.message.includes('already exists')) {
             console.log('User already exists, sending password recovery instead.')
             const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: email
             })
             // Send recovery link via Resend API (we'd have to intercept the link)
             // Instead, let's just let it fail or use resetPasswordForEmail
             const { error: resetEmailError } = await supabaseAdmin.auth.resetPasswordForEmail(email)
             if (resetEmailError) throw resetEmailError;
        } else {
             throw inviteError
        }
    }

    // 5. Update Waitlist Status
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
      JSON.stringify({ error: error.message }),
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
