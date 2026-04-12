import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Missing auth header' }), { status: 401, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } })
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token)
    
    if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized', details: authError }), { status: 401, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } })
    }

    if (user.email !== 'djb.rsa@gmail.com') {
         return new Response(JSON.stringify({ error: 'Forbidden: Admins only' }), { status: 403, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } })
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
      JSON.stringify({ success: true, message: `Invite link generated successfully`, inviteLink: inviteLink }),
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
