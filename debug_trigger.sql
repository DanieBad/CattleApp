SELECT net.http_post(
        url:='https://hpddjhajklbgxcqgbvzc.supabase.co/functions/v1/send-beta-welcome-email',
        headers:='{"Content-Type": "application/json"}'::jsonb,
        body:=jsonb_build_object('record', jsonb_build_object('email', 'info@healthyherd.app')),
        timeout_ms:=5000
      );
