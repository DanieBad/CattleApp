SELECT pg_get_function_arguments(p.oid) 
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE p.proname = 'http_post' AND n.nspname = 'extensions';
