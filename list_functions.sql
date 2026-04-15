SELECT n.nspname as schema_name, p.proname as function_name
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'extensions'
LIMIT 100;
