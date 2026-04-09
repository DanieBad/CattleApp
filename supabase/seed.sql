SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict IKEDouv9Nptd6cXTw7X8L3Ipi7Do0Dt3eKbOOmOMLzmUtHaGsGGazuXgZVADRb2

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '7c05cce8-2ced-4f45-bdd0-2880ba741652', 'authenticated', 'authenticated', 'test@test.com', '$2a$10$.XKB9eVe346LiaRm26zTyu5ESk4FY15BgMnTxt9T5Y7SrbHYPIxDK', '2026-03-31 18:14:54.249395+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-31 18:14:54.2711+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "7c05cce8-2ced-4f45-bdd0-2880ba741652", "email": "test@test.com", "email_verified": true, "phone_verified": false}', NULL, '2026-03-31 18:14:54.204251+00', '2026-03-31 20:11:38.735927+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '72cdef59-4719-419c-a362-8c54fdc7df15', 'authenticated', 'authenticated', 'wilhelmwart@gmail.com', '$2a$10$BFL0N5NaeM5Mj8Rb3eNeweR/wswlSloreHlHb0RZj8XiF5kE2tHSe', '2026-03-20 05:58:12.044838+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-20 05:58:12.058856+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "72cdef59-4719-419c-a362-8c54fdc7df15", "email": "wilhelmwart@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2026-03-20 05:58:11.99262+00', '2026-03-20 15:08:02.333162+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c1a250c9-5c6f-43fe-bcd3-44a9ba445c91', 'authenticated', 'authenticated', 'test@example.com', '$2a$10$O27ZLlmwfFcOW3IgIsNOneExU7dk0vFD1w88xa8w7WtAkoMcLeHna', '2026-03-19 19:01:36.456169+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-19 19:01:36.465338+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "c1a250c9-5c6f-43fe-bcd3-44a9ba445c91", "email": "test@example.com", "email_verified": true, "phone_verified": false}', NULL, '2026-03-19 19:01:36.420382+00', '2026-03-19 19:01:36.473399+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b800f1eb-f7e2-4f4b-bf40-8a3a7dccdab3', 'authenticated', 'authenticated', 'sebasti.badenhorst@gmail.com', '$2a$10$/cyh81CvS4N4dHNzAVIRQeDBCp/fSm6Hw0/tkLF0QvdbFE3ico8/e', '2026-03-19 03:51:54.403103+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-19 03:51:54.440059+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "b800f1eb-f7e2-4f4b-bf40-8a3a7dccdab3", "email": "sebasti.badenhorst@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2026-03-19 03:51:54.315045+00', '2026-03-19 19:11:57.098173+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', 'authenticated', 'authenticated', 'djb.rsa@gmail.com', '$2a$10$w1GetVXO.ZrLYu65mPgqZeiwfsGPvNZoi3CDzKaZSavxLA8/mlYXu', '2026-03-18 20:39:45.083+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-02 19:11:18.736988+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "f5f7c3eb-a624-41b4-89f6-1852dddb304a", "email": "djb.rsa@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2026-03-18 20:39:45.054596+00', '2026-04-02 19:28:10.021332+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '29a110f7-cdcf-4b5c-a66d-459122911da1', 'authenticated', 'authenticated', 'rykwater.za@gmail.com', '$2a$10$Z1.oJEDeV.4oX5shM3EGvub3phkoPeiKbl6C6F/xjTTwlotYu9GQW', '2026-03-18 19:18:51.587645+00', NULL, '', '2026-03-18 19:18:28.134648+00', '', NULL, '', '', NULL, '2026-04-05 07:26:43.347374+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "29a110f7-cdcf-4b5c-a66d-459122911da1", "email": "rykwater.za@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2026-03-18 19:18:28.088013+00', '2026-04-05 19:35:24.248087+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('29a110f7-cdcf-4b5c-a66d-459122911da1', '29a110f7-cdcf-4b5c-a66d-459122911da1', '{"sub": "29a110f7-cdcf-4b5c-a66d-459122911da1", "email": "rykwater.za@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2026-03-18 19:18:28.118889+00', '2026-03-18 19:18:28.11956+00', '2026-03-18 19:18:28.11956+00', '0b5c42d6-7444-47d5-9591-a538470fa617'),
	('f5f7c3eb-a624-41b4-89f6-1852dddb304a', 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', '{"sub": "f5f7c3eb-a624-41b4-89f6-1852dddb304a", "email": "djb.rsa@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-03-18 20:39:45.073993+00', '2026-03-18 20:39:45.074461+00', '2026-03-18 20:39:45.074461+00', '92b297e7-600f-49c9-a440-88dddad0e002'),
	('b800f1eb-f7e2-4f4b-bf40-8a3a7dccdab3', 'b800f1eb-f7e2-4f4b-bf40-8a3a7dccdab3', '{"sub": "b800f1eb-f7e2-4f4b-bf40-8a3a7dccdab3", "email": "sebasti.badenhorst@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-03-19 03:51:54.379069+00', '2026-03-19 03:51:54.379459+00', '2026-03-19 03:51:54.379459+00', '634f1517-22c6-4ab9-b293-929758243c71'),
	('c1a250c9-5c6f-43fe-bcd3-44a9ba445c91', 'c1a250c9-5c6f-43fe-bcd3-44a9ba445c91', '{"sub": "c1a250c9-5c6f-43fe-bcd3-44a9ba445c91", "email": "test@example.com", "email_verified": false, "phone_verified": false}', 'email', '2026-03-19 19:01:36.448192+00', '2026-03-19 19:01:36.448244+00', '2026-03-19 19:01:36.448244+00', '02de680b-0cb7-4532-9c8a-d4ae72503a7e'),
	('72cdef59-4719-419c-a362-8c54fdc7df15', '72cdef59-4719-419c-a362-8c54fdc7df15', '{"sub": "72cdef59-4719-419c-a362-8c54fdc7df15", "email": "wilhelmwart@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-03-20 05:58:12.024977+00', '2026-03-20 05:58:12.02608+00', '2026-03-20 05:58:12.02608+00', '212bd47f-460e-44ed-9995-09ff062f75a1'),
	('7c05cce8-2ced-4f45-bdd0-2880ba741652', '7c05cce8-2ced-4f45-bdd0-2880ba741652', '{"sub": "7c05cce8-2ced-4f45-bdd0-2880ba741652", "email": "test@test.com", "email_verified": false, "phone_verified": false}', 'email', '2026-03-31 18:14:54.234885+00', '2026-03-31 18:14:54.234938+00', '2026-03-31 18:14:54.234938+00', '2ed53c62-3e9b-410b-ad24-c0afbb575403');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('acbb12a8-4b34-488b-8e40-33e83dd9302f', '29a110f7-cdcf-4b5c-a66d-459122911da1', '2026-04-05 07:26:43.347813+00', '2026-04-05 15:52:57.215037+00', NULL, 'aal1', NULL, '2026-04-05 15:52:57.214926', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '196.192.49.186', NULL, NULL, NULL, NULL, NULL),
	('da3a6d29-b048-4526-91e5-bdd741db2bd0', '29a110f7-cdcf-4b5c-a66d-459122911da1', '2026-04-05 05:40:16.979243+00', '2026-04-05 19:35:24.252633+00', NULL, 'aal1', NULL, '2026-04-05 19:35:24.252535', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/145.0.7632.108 Mobile/15E148 Safari/604.1', '196.192.49.186', NULL, NULL, NULL, NULL, NULL),
	('3a91c9f6-b173-4c5c-a535-786e96963aae', 'c1a250c9-5c6f-43fe-bcd3-44a9ba445c91', '2026-03-19 19:01:36.465428+00', '2026-03-19 19:01:36.465428+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '105.224.163.104', NULL, NULL, NULL, NULL, NULL),
	('3cfab812-f37d-464b-aaf7-570ce95d46ce', 'b800f1eb-f7e2-4f4b-bf40-8a3a7dccdab3', '2026-03-19 03:51:54.441281+00', '2026-03-19 19:11:57.100366+00', NULL, 'aal1', NULL, '2026-03-19 19:11:57.100275', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', '105.224.163.104', NULL, NULL, NULL, NULL, NULL),
	('6a978f63-a466-4ffd-b118-4c53b269ba57', '72cdef59-4719-419c-a362-8c54fdc7df15', '2026-03-20 05:58:12.058979+00', '2026-03-20 15:08:02.337599+00', NULL, 'aal1', NULL, '2026-03-20 15:08:02.337501', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '154.117.162.170', NULL, NULL, NULL, NULL, NULL),
	('19fdb90d-8e39-47d3-8204-ff66a96e4795', 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', '2026-04-02 19:11:18.738404+00', '2026-04-02 19:11:18.738404+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '105.224.163.104', NULL, NULL, NULL, NULL, NULL),
	('d2633585-e1be-47b8-bd97-5d09a5db6bf7', '7c05cce8-2ced-4f45-bdd0-2880ba741652', '2026-03-31 18:14:54.271193+00', '2026-03-31 20:11:38.740484+00', NULL, 'aal1', NULL, '2026-03-31 20:11:38.740378', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '105.224.163.104', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('3cfab812-f37d-464b-aaf7-570ce95d46ce', '2026-03-19 03:51:54.465505+00', '2026-03-19 03:51:54.465505+00', 'password', '42dc5ba7-b40a-48a3-b0a1-e3498eea6f7d'),
	('3a91c9f6-b173-4c5c-a535-786e96963aae', '2026-03-19 19:01:36.473927+00', '2026-03-19 19:01:36.473927+00', 'password', 'fd9b4c65-b5d2-47e9-9e63-3a2c35c59b1b'),
	('6a978f63-a466-4ffd-b118-4c53b269ba57', '2026-03-20 05:58:12.089727+00', '2026-03-20 05:58:12.089727+00', 'password', '3184ed4a-a2e5-4cd3-966e-887decb4e4ae'),
	('d2633585-e1be-47b8-bd97-5d09a5db6bf7', '2026-03-31 18:14:54.294668+00', '2026-03-31 18:14:54.294668+00', 'password', '2fa90c33-1c0e-4dca-a103-c8a2e63aba04'),
	('19fdb90d-8e39-47d3-8204-ff66a96e4795', '2026-04-02 19:11:18.761402+00', '2026-04-02 19:11:18.761402+00', 'otp', '84e66067-6d80-4257-8f72-5a779f62c039'),
	('da3a6d29-b048-4526-91e5-bdd741db2bd0', '2026-04-05 05:40:17.012884+00', '2026-04-05 05:40:17.012884+00', 'password', '76cf3493-2f74-4b53-8b4d-b6b57660c9f4'),
	('acbb12a8-4b34-488b-8e40-33e83dd9302f', '2026-04-05 07:26:43.4016+00', '2026-04-05 07:26:43.4016+00', 'password', '3a334c53-53e2-48a2-a388-252f676f32eb');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 92, 'qavwkahmhhq3', '29a110f7-cdcf-4b5c-a66d-459122911da1', true, '2026-04-05 05:40:16.998766+00', '2026-04-05 07:26:57.891681+00', NULL, 'da3a6d29-b048-4526-91e5-bdd741db2bd0'),
	('00000000-0000-0000-0000-000000000000', 93, 'ef6njs7etcud', '29a110f7-cdcf-4b5c-a66d-459122911da1', true, '2026-04-05 07:26:43.373341+00', '2026-04-05 10:32:57.653896+00', NULL, 'acbb12a8-4b34-488b-8e40-33e83dd9302f'),
	('00000000-0000-0000-0000-000000000000', 95, 'kxb3t2onj6xj', '29a110f7-cdcf-4b5c-a66d-459122911da1', true, '2026-04-05 10:32:57.714902+00', '2026-04-05 15:52:57.179071+00', 'ef6njs7etcud', 'acbb12a8-4b34-488b-8e40-33e83dd9302f'),
	('00000000-0000-0000-0000-000000000000', 96, 'n55mrsd2c2ie', '29a110f7-cdcf-4b5c-a66d-459122911da1', false, '2026-04-05 15:52:57.199592+00', '2026-04-05 15:52:57.199592+00', 'kxb3t2onj6xj', 'acbb12a8-4b34-488b-8e40-33e83dd9302f'),
	('00000000-0000-0000-0000-000000000000', 94, 'i4lpm255lxmv', '29a110f7-cdcf-4b5c-a66d-459122911da1', true, '2026-04-05 07:26:57.911483+00', '2026-04-05 15:54:46.868355+00', 'qavwkahmhhq3', 'da3a6d29-b048-4526-91e5-bdd741db2bd0'),
	('00000000-0000-0000-0000-000000000000', 97, '5kbhiah5zcq7', '29a110f7-cdcf-4b5c-a66d-459122911da1', true, '2026-04-05 15:54:46.887468+00', '2026-04-05 19:35:24.221253+00', 'i4lpm255lxmv', 'da3a6d29-b048-4526-91e5-bdd741db2bd0'),
	('00000000-0000-0000-0000-000000000000', 98, 'jzsyrczfd7wa', '29a110f7-cdcf-4b5c-a66d-459122911da1', false, '2026-04-05 19:35:24.239469+00', '2026-04-05 19:35:24.239469+00', '5kbhiah5zcq7', 'da3a6d29-b048-4526-91e5-bdd741db2bd0'),
	('00000000-0000-0000-0000-000000000000', 18, 'zj4hdioojx76', 'c1a250c9-5c6f-43fe-bcd3-44a9ba445c91', false, '2026-03-19 19:01:36.469334+00', '2026-03-19 19:01:36.469334+00', NULL, '3a91c9f6-b173-4c5c-a535-786e96963aae'),
	('00000000-0000-0000-0000-000000000000', 6, 'nxbwafkwxeoz', 'b800f1eb-f7e2-4f4b-bf40-8a3a7dccdab3', true, '2026-03-19 03:51:54.45455+00', '2026-03-19 19:11:57.086808+00', NULL, '3cfab812-f37d-464b-aaf7-570ce95d46ce'),
	('00000000-0000-0000-0000-000000000000', 19, '6tnatq7x4p43', 'b800f1eb-f7e2-4f4b-bf40-8a3a7dccdab3', false, '2026-03-19 19:11:57.092656+00', '2026-03-19 19:11:57.092656+00', 'nxbwafkwxeoz', '3cfab812-f37d-464b-aaf7-570ce95d46ce'),
	('00000000-0000-0000-0000-000000000000', 22, 'i7l7uq25n6bz', '72cdef59-4719-419c-a362-8c54fdc7df15', true, '2026-03-20 05:58:12.073594+00', '2026-03-20 12:52:00.832832+00', NULL, '6a978f63-a466-4ffd-b118-4c53b269ba57'),
	('00000000-0000-0000-0000-000000000000', 23, 'g7y2nnl5w6te', '72cdef59-4719-419c-a362-8c54fdc7df15', true, '2026-03-20 12:52:00.860181+00', '2026-03-20 15:08:02.313371+00', 'i7l7uq25n6bz', '6a978f63-a466-4ffd-b118-4c53b269ba57'),
	('00000000-0000-0000-0000-000000000000', 24, 'el4ufaugabt3', '72cdef59-4719-419c-a362-8c54fdc7df15', false, '2026-03-20 15:08:02.326177+00', '2026-03-20 15:08:02.326177+00', 'g7y2nnl5w6te', '6a978f63-a466-4ffd-b118-4c53b269ba57'),
	('00000000-0000-0000-0000-000000000000', 70, 'xsmxfrxwvwsq', '7c05cce8-2ced-4f45-bdd0-2880ba741652', true, '2026-03-31 18:14:54.282761+00', '2026-03-31 19:13:08.962122+00', NULL, 'd2633585-e1be-47b8-bd97-5d09a5db6bf7'),
	('00000000-0000-0000-0000-000000000000', 71, 'ijbfubkdortl', '7c05cce8-2ced-4f45-bdd0-2880ba741652', true, '2026-03-31 19:13:08.981522+00', '2026-03-31 20:11:38.704976+00', 'xsmxfrxwvwsq', 'd2633585-e1be-47b8-bd97-5d09a5db6bf7'),
	('00000000-0000-0000-0000-000000000000', 74, 'wc5pho4cewl2', '7c05cce8-2ced-4f45-bdd0-2880ba741652', false, '2026-03-31 20:11:38.726357+00', '2026-03-31 20:11:38.726357+00', 'ijbfubkdortl', 'd2633585-e1be-47b8-bd97-5d09a5db6bf7'),
	('00000000-0000-0000-0000-000000000000', 86, 'a23riuunqbki', 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', false, '2026-04-02 19:11:18.747319+00', '2026-04-02 19:11:18.747319+00', NULL, '19fdb90d-8e39-47d3-8204-ff66a96e4795');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: camps; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."camps" ("id", "user_id", "name", "size_hectares", "notes", "created_at") VALUES
	('cfde2942-640d-406d-996b-2add7cab21e1', '29a110f7-cdcf-4b5c-a66d-459122911da1', 'North', 120, 'On House side of river', '2026-03-19 18:37:41.055178+00'),
	('73f7b0e5-fab9-4b08-b5e9-4277fccbcec5', '29a110f7-cdcf-4b5c-a66d-459122911da1', 'River Camp', 50, 'Camp around Sand River', '2026-03-19 18:38:08.222488+00'),
	('5d92a3fd-a924-446e-a46d-117f5345feb6', '29a110f7-cdcf-4b5c-a66d-459122911da1', 'South Camp', 180, '', '2026-03-19 18:38:30.442853+00'),
	('fc97c3d3-bfa8-4e4b-968b-1213b871c6a5', '7c05cce8-2ced-4f45-bdd0-2880ba741652', 'North Winter Camp', NULL, '', '2026-03-31 18:15:47.448197+00');


--
-- Data for Name: animals; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."animals" ("id", "tag_number", "name", "breed", "sex", "date_of_birth", "status", "sire_id", "dam_id", "weight", "created_at", "eid_number", "is_quarantined", "user_id", "current_camp_id", "horn_status", "species", "brand", "origin_gln", "previous_owner_tag", "previous_owner_brand", "arrival_date", "purchase_price", "sold_price", "quarantine_start_date", "quarantine_end_date") VALUES
	('aaf7330a-e453-4a88-b90d-aa8ea11db1ec', 'C-1001', 'Animal_1', 'Nguni', 'Male', '2024-06-13', 'Active', NULL, NULL, 762, '2026-03-23 19:06:48.945732+00', '982000438160082', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 14331.00, NULL, NULL, NULL),
	('c96d8630-da20-4e94-8f72-d6bd1da0a015', 'C-1002', 'Animal_2', 'Hereford', 'Male', '2024-01-29', 'Active', NULL, NULL, 284, '2026-03-23 19:06:48.945732+00', '982000934129196', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 10643.00, NULL, NULL, NULL),
	('c6b6724c-b019-44f1-bad7-cabb63a407e4', 'C-1003', 'Animal_3', 'Boran', 'Male', '2024-05-06', 'Active', NULL, NULL, 872, '2026-03-23 19:06:48.945732+00', '982000961962192', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 21928.00, NULL, NULL, NULL),
	('8397c09c-0e8e-4ea3-ae14-25d5f71b8246', 'Ryk-001', NULL, 'Tuli', 'Male', '2022-01-17', 'Active', NULL, NULL, 500, '2026-03-17 18:16:33.443241+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', NULL, 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('102f78b4-1419-4284-9e96-bb28eae64295', 'C-1004', 'Animal_4', 'Hereford', 'Male', '2022-10-07', 'Active', NULL, NULL, 213, '2026-03-23 19:06:48.945732+00', '982000445795892', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 15472.00, NULL, NULL, NULL),
	('0f949509-e434-44ab-830d-04522965b74a', 'C-1005', 'Animal_5', 'Simmentaler', 'Male', '2023-11-08', 'Active', NULL, NULL, 375, '2026-03-23 19:06:48.945732+00', '982000944940845', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 22473.00, NULL, NULL, NULL),
	('e223d1aa-c1a7-4248-9524-b2b8e5fb2b4e', 'C-1007', 'Animal_7', 'Angus', 'Female', '2024-09-29', 'Active', NULL, NULL, 342, '2026-03-23 19:06:48.945732+00', '982000466031891', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 16176.00, NULL, NULL, NULL),
	('89e46e6e-a337-436f-b7c3-337dd83ef15b', 'C-1008', 'Animal_8', 'Brahman', 'Female', '2023-08-01', 'Active', NULL, NULL, 780, '2026-03-23 19:06:48.945732+00', '982000252869714', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 21039.00, NULL, NULL, NULL),
	('8be4d91f-7c51-4581-ad50-d84b44733991', 'C-1009', 'Animal_9', 'Nguni', 'Female', '2025-05-24', 'Active', NULL, NULL, 479, '2026-03-23 19:06:48.945732+00', '982000618231314', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 18552.00, NULL, NULL, NULL),
	('4609596b-495a-4ed3-b656-72cdeff423b0', 'C-1010', 'Animal_10', 'Angus', 'Female', '2024-10-17', 'Active', NULL, NULL, 672, '2026-03-23 19:06:48.945732+00', '982000494392284', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 19998.00, NULL, NULL, NULL),
	('d2173acc-05e6-4f78-9d9d-e43a21b48b9d', 'C-1011', 'Animal_11', 'Brahman', 'Female', '2025-11-07', 'Active', NULL, NULL, 463, '2026-03-23 19:06:48.945732+00', '982000232681327', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 21217.00, NULL, NULL, NULL),
	('3c34ff08-edb9-4baf-a615-622cc5686e35', 'C-1012', 'Animal_12', 'Angus', 'Female', '2022-04-10', 'Active', NULL, NULL, 626, '2026-03-23 19:06:48.945732+00', '982000551687722', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 11889.00, NULL, NULL, NULL),
	('1cdbfa6d-3ff9-479b-b518-a250040e7eb0', 'C-1013', 'Animal_13', 'Bonsmara', 'Female', '2023-04-19', 'Active', NULL, NULL, 788, '2026-03-23 19:06:48.945732+00', '982000902565680', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 10755.00, NULL, NULL, NULL),
	('2e972e56-06ed-4b48-8a42-3f0c114788cb', 'C-1014', 'Animal_14', 'Angus', 'Female', '2025-01-05', 'Active', NULL, NULL, 695, '2026-03-23 19:06:48.945732+00', '982000962400813', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 14078.00, NULL, NULL, NULL),
	('ee61f978-1f40-4877-9be4-a6deb3bf593a', 'C-1015', 'Animal_15', 'Nguni', 'Female', '2024-06-21', 'Active', NULL, NULL, 395, '2026-03-23 19:06:48.945732+00', '982000318212203', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 9309.00, NULL, NULL, NULL),
	('6e467181-1574-480e-92b3-4d2b763b3121', 'C-1016', 'Animal_16', 'Angus', 'Female', '2023-04-09', 'Active', NULL, NULL, 432, '2026-03-23 19:06:48.945732+00', '982000767147660', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 19313.00, NULL, NULL, NULL),
	('880b91da-303c-4c37-bf16-ce05267d63c9', 'C-1017', 'Animal_17', 'Brahman', 'Female', '2022-08-25', 'Active', NULL, NULL, 286, '2026-03-23 19:06:48.945732+00', '982000838133780', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 11615.00, NULL, NULL, NULL),
	('14b1e9f4-11ec-41ef-a98a-f4acb8a66eb9', 'C-1018', 'Animal_18', 'Afrikaner', 'Female', '2024-09-19', 'Active', NULL, NULL, 152, '2026-03-23 19:06:48.945732+00', '982000698828786', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 13211.00, NULL, NULL, NULL),
	('8f9e623b-3c45-4e0d-a9f7-5b8dd7065ad6', 'C-1019', 'Animal_19', 'Simmentaler', 'Female', '2026-02-14', 'Active', NULL, NULL, 335, '2026-03-23 19:06:48.945732+00', '982000357578348', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 9541.00, NULL, NULL, NULL),
	('b7097d91-b185-42cf-acda-5b4d84e1a105', 'C-1020', 'Animal_20', 'Brahman', 'Female', '2024-04-22', 'Active', NULL, NULL, 316, '2026-03-23 19:06:48.945732+00', '982000318123575', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 19894.00, NULL, NULL, NULL),
	('282a3034-d952-4139-b2d3-68bb3638e3ed', 'C-1021', 'Animal_21', 'Bonsmara', 'Female', '2024-10-25', 'Active', NULL, NULL, 703, '2026-03-23 19:06:48.945732+00', '982000876225603', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 18782.00, NULL, NULL, NULL),
	('c6226697-6add-4f27-aaca-fd10be1ec3cf', 'C-1022', 'Animal_22', 'Simmentaler', 'Female', '2024-09-28', 'Active', NULL, NULL, 602, '2026-03-23 19:06:48.945732+00', '982000589435339', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 21382.00, NULL, NULL, NULL),
	('c948edb0-171c-4c2a-8636-87168a1bab83', 'C-1023', 'Animal_23', 'Simmentaler', 'Female', '2022-03-29', 'Active', NULL, NULL, 351, '2026-03-23 19:06:48.945732+00', '982000125956960', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 17220.00, NULL, NULL, NULL),
	('710b3681-1149-44a6-99d0-53b831042833', 'C-1024', 'Animal_24', 'Hereford', 'Female', '2023-03-02', 'Active', NULL, NULL, 697, '2026-03-23 19:06:48.945732+00', '982000952221729', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 14151.00, NULL, NULL, NULL),
	('3f062d17-9920-452e-aca5-fb11f78dfdf1', 'C-1025', 'Animal_25', 'Simmentaler', 'Female', '2025-01-24', 'Active', NULL, NULL, 359, '2026-03-23 19:06:48.945732+00', '982000253832592', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 18974.00, NULL, NULL, NULL),
	('424514a4-da02-42aa-9f26-2a982a71e1c5', 'C-1026', 'Animal_26', 'Afrikaner', 'Female', '2023-10-27', 'Active', NULL, NULL, 484, '2026-03-23 19:06:48.945732+00', '982000509177565', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 15319.00, NULL, NULL, NULL),
	('847df806-1511-4e0e-be85-7131cc12cb96', 'C-1027', 'Animal_27', 'Afrikaner', 'Female', '2022-10-10', 'Active', NULL, NULL, 691, '2026-03-23 19:06:48.945732+00', '982000992935114', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 10574.00, NULL, NULL, NULL),
	('63b45dea-e672-4a8c-8478-dc637134f233', 'C-1028', 'Animal_28', 'Boran', 'Female', '2022-04-08', 'Active', NULL, NULL, 686, '2026-03-23 19:06:48.945732+00', '982000560532288', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 8427.00, NULL, NULL, NULL),
	('2538bcdd-e992-4dc1-8bdb-cc1f8e4b6e6f', 'C-1029', 'Animal_29', 'Brahman', 'Female', '2023-10-28', 'Active', NULL, NULL, 775, '2026-03-23 19:06:48.945732+00', '982000423745611', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 18747.00, NULL, NULL, NULL),
	('3e825b93-60cf-44a9-aadb-3a229531f680', 'C-1030', 'Animal_30', 'Brahman', 'Female', '2023-09-05', 'Active', NULL, NULL, 841, '2026-03-23 19:06:48.945732+00', '982000451660473', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 20321.00, NULL, NULL, NULL),
	('d01dafdf-c398-44fe-a33b-b17328696bda', 'C-1031', 'Animal_31', 'Boran', 'Female', '2025-02-11', 'Active', NULL, NULL, 601, '2026-03-23 19:06:48.945732+00', '982000124993492', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 23333.00, NULL, NULL, NULL),
	('9d8ffae9-b47b-4598-8064-d881ee42b7e3', 'C-1032', 'Animal_32', 'Simmentaler', 'Female', '2024-04-07', 'Active', NULL, NULL, 266, '2026-03-23 19:06:48.945732+00', '982000209511090', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 20324.00, NULL, NULL, NULL),
	('d71d997a-0646-4e5e-90ff-25c7bbc9fec9', 'C-1033', 'Animal_33', 'Boran', 'Male', '2024-09-18', 'Active', NULL, NULL, 672, '2026-03-23 19:06:48.945732+00', '982000924083448', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 18509.00, NULL, NULL, NULL),
	('f87b7276-a7be-4b28-9a31-edf533ba5406', 'C-1034', 'Animal_34', 'Brahman', 'Female', '2024-12-07', 'Active', NULL, NULL, 575, '2026-03-23 19:06:48.945732+00', '982000394134792', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 15037.00, NULL, NULL, NULL),
	('fd3d6a1c-56fd-487c-aff6-19ab78e4eee9', 'C-1035', 'Animal_35', 'Hereford', 'Female', '2024-09-08', 'Active', NULL, NULL, 504, '2026-03-23 19:06:48.945732+00', '982000802183471', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 23957.00, NULL, NULL, NULL),
	('6698baa4-a5b4-49a1-988b-dc6113440014', 'C-1036', 'Animal_36', 'Angus', 'Male', '2025-03-28', 'Active', NULL, NULL, 171, '2026-03-23 19:06:48.945732+00', '982000973175155', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 19901.00, NULL, NULL, NULL),
	('8d9fb193-45a3-497e-aeff-d5cb55ebf01f', 'C-1037', 'Animal_37', 'Hereford', 'Male', '2024-11-22', 'Active', NULL, NULL, 643, '2026-03-23 19:06:48.945732+00', '982000498214600', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 9840.00, NULL, NULL, NULL),
	('54804651-202a-4430-84af-214837e464d9', 'C-1038', 'Animal_38', 'Nguni', 'Female', '2025-11-18', 'Active', NULL, NULL, 533, '2026-03-23 19:06:48.945732+00', '982000255998051', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 8204.00, NULL, NULL, NULL),
	('dcc5d94f-16d6-4965-8573-735d2614a0fb', 'C-1039', 'Animal_39', 'Simmentaler', 'Female', '2026-03-13', 'Active', NULL, NULL, 528, '2026-03-23 19:06:48.945732+00', '982000546356801', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 19585.00, NULL, NULL, NULL),
	('6b785005-7a1e-40e2-96e2-502603b57a19', 'C-1040', 'Animal_40', 'Boran', 'Female', '2025-10-26', 'Active', NULL, NULL, 172, '2026-03-23 19:06:48.945732+00', '982000892214678', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 13710.00, NULL, NULL, NULL),
	('c5812ff1-f3fc-4c4d-b644-9717638565d3', 'C-1041', 'Animal_41', 'Boran', 'Male', '2026-01-15', 'Active', NULL, NULL, 610, '2026-03-23 19:06:48.945732+00', '982000271985934', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 12211.00, NULL, NULL, NULL),
	('d8eae0d1-e079-42a4-baed-d6acc5fd99ca', '102', NULL, 'Dorper', 'Female', '2022-03-19', 'Sold', NULL, NULL, NULL, '2026-03-19 18:40:51.63448+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', 'cfde2942-640d-406d-996b-2add7cab21e1', NULL, 'Sheep', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('a79a7f9f-cd4f-4d20-8810-12d1866cef88', '101', NULL, 'Dorper', 'Female', '2021-03-19', 'Active', NULL, NULL, NULL, '2026-03-19 18:40:35.139029+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', 'cfde2942-640d-406d-996b-2add7cab21e1', NULL, 'Sheep', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('f6a6bebf-45c6-4620-bb21-56471fddd0a7', '100', NULL, 'Dorper', 'Female', '2020-03-19', 'Active', NULL, NULL, NULL, '2026-03-19 18:40:13.482835+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', 'cfde2942-640d-406d-996b-2add7cab21e1', NULL, 'Sheep', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('08479d26-ff9f-4b41-a55c-2bd143dc51a1', '01', NULL, 'Tuli', 'Female', '2010-09-08', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', 'cfde2942-640d-406d-996b-2add7cab21e1', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('0e71cf10-5fa6-45e6-9565-07d379301cb8', '02', NULL, 'Tuli', 'Female', '2013-09-01', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', 'cfde2942-640d-406d-996b-2add7cab21e1', 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('b384491e-7b7e-4959-bd28-573d274c166f', 'C-1042', 'Animal_42', 'Simmentaler', 'Female', '2024-12-02', 'Active', NULL, NULL, 249, '2026-03-23 19:06:48.945732+00', '982000689569598', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 17895.00, NULL, NULL, NULL),
	('9614d425-0556-493b-8262-805dc95ba9c7', 'C-1043', 'Animal_43', 'Boran', 'Female', '2025-05-16', 'Active', NULL, NULL, 277, '2026-03-23 19:06:48.945732+00', '982000612040617', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 21364.00, NULL, NULL, NULL),
	('876ba485-b7f2-4fbf-a0ef-1318b0a514aa', 'C-1044', 'Animal_44', 'Hereford', 'Male', '2025-10-15', 'Active', NULL, NULL, 442, '2026-03-23 19:06:48.945732+00', '982000347689144', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 10620.00, NULL, NULL, NULL),
	('c0bafccf-a17f-4f30-9606-c00a42ce02f8', 'C-1045', 'Animal_45', 'Bonsmara', 'Female', '2024-11-10', 'Active', NULL, NULL, 209, '2026-03-23 19:06:48.945732+00', '982000347028511', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 11692.00, NULL, NULL, NULL),
	('31f5cd1d-b357-4302-af8d-dc64549570af', 'C-1046', 'Animal_46', 'Nguni', 'Male', '2024-11-08', 'Active', NULL, NULL, 497, '2026-03-23 19:06:48.945732+00', '982000893178864', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 22655.00, NULL, NULL, NULL),
	('f5785ed9-ac3c-4ba1-b912-27c8d3f40071', 'C-1047', 'Animal_47', 'Nguni', 'Female', '2025-05-20', 'Active', NULL, NULL, 417, '2026-03-23 19:06:48.945732+00', '982000549669423', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 22481.00, NULL, NULL, NULL),
	('223b97de-0be1-4311-aabf-ba534008d30f', 'C-1048', 'Animal_48', 'Afrikaner', 'Female', '2024-05-12', 'Active', NULL, NULL, 761, '2026-03-23 19:06:48.945732+00', '982000829814053', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 12913.00, NULL, NULL, NULL),
	('cb01b640-abe0-4051-8852-00cb522715a4', 'C-1049', 'Animal_49', 'Bonsmara', 'Male', '2025-05-11', 'Active', NULL, NULL, 840, '2026-03-23 19:06:48.945732+00', '982000203634866', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 12786.00, NULL, NULL, NULL),
	('972eeb10-52be-4982-a902-a7a942ee11f3', 'C-1050', 'Animal_50', 'Brahman', 'Male', '2025-04-21', 'Active', NULL, NULL, 748, '2026-03-23 19:06:48.945732+00', '982000547373102', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 11401.00, NULL, NULL, NULL),
	('f0b066dc-6aa6-4d32-9fea-d2152c542d8c', 'C-1051', 'Animal_51', 'Nguni', 'Male', '2024-05-21', 'Sold', NULL, NULL, 816, '2026-03-23 19:06:48.945732+00', '982000198646709', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 11623.00, 16662.00, NULL, NULL),
	('b202bffa-1c7c-4a7f-9740-9204445d3916', 'C-1052', 'Animal_52', 'Afrikaner', 'Female', '2025-02-16', 'Active', NULL, NULL, 773, '2026-03-23 19:06:48.945732+00', '982000792210018', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 23278.00, NULL, NULL, NULL),
	('cf3921f9-29b8-424e-9803-3669dec54e1f', 'C-1053', 'Animal_53', 'Boran', 'Male', '2025-08-01', 'Active', NULL, NULL, 216, '2026-03-23 19:06:48.945732+00', '982000175053926', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 20252.00, NULL, NULL, NULL),
	('26423158-1b22-4d9d-a866-0f1ca7ba1717', 'C-1054', 'Animal_54', 'Simmentaler', 'Male', '2025-01-03', 'Active', NULL, NULL, 191, '2026-03-23 19:06:48.945732+00', '982000668429270', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 14427.00, NULL, NULL, NULL),
	('3ecc522d-a6aa-4594-80c8-04e273e4106d', 'C-1055', 'Animal_55', 'Boran', 'Female', '2024-09-14', 'Active', NULL, NULL, 844, '2026-03-23 19:06:48.945732+00', '982000409429102', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 24501.00, NULL, NULL, NULL),
	('f1a55981-6ccb-423c-aeb4-daac075a73db', 'C-1056', 'Animal_56', 'Angus', 'Female', '2026-03-05', 'Active', NULL, NULL, 765, '2026-03-23 19:06:48.945732+00', '982000921571595', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 24368.00, NULL, NULL, NULL),
	('d5a9f27a-2de3-4693-a5c6-ab3a52304d15', 'C-1057', 'Animal_57', 'Angus', 'Male', '2025-07-21', 'Active', NULL, NULL, 827, '2026-03-23 19:06:48.945732+00', '982000596779647', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 20491.00, NULL, NULL, NULL),
	('a550a3f7-4e35-400f-b135-60af69f10be4', 'C-1058', 'Animal_58', 'Boran', 'Male', '2025-05-18', 'Sold', NULL, NULL, 247, '2026-03-23 19:06:48.945732+00', '982000952800435', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 15747.00, 18570.00, NULL, NULL),
	('659e9a86-ff8a-4374-86ed-c745ad621e07', 'C-1059', 'Animal_59', 'Boran', 'Male', '2025-10-25', 'Active', NULL, NULL, 414, '2026-03-23 19:06:48.945732+00', '982000374091126', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 14731.00, NULL, NULL, NULL),
	('cb0cb038-5b24-452b-abd5-024a1665174a', 'C-1060', 'Animal_60', 'Hereford', 'Female', '2024-05-07', 'Active', NULL, NULL, 419, '2026-03-23 19:06:48.945732+00', '982000411623464', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 13343.00, NULL, NULL, NULL),
	('007fa5a0-91fc-4936-aa82-74e49c4eaf8f', '105', NULL, 'Tuli', 'Female', '2021-11-18', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('e6242fb6-6749-44eb-b678-d7c492035f67', 'C-1061', 'Animal_61', 'Bonsmara', 'Female', '2025-05-08', 'Sold', NULL, NULL, 254, '2026-03-23 19:06:48.945732+00', '982000340501369', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 17855.00, 22715.00, NULL, NULL),
	('9f0b47fb-be2a-43e8-934b-d7ea662d66b5', 'C-1062', 'Animal_62', 'Afrikaner', 'Female', '2025-06-20', 'Active', NULL, NULL, 157, '2026-03-23 19:06:48.945732+00', '982000173667961', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 15858.00, NULL, NULL, NULL),
	('102637f8-a0e7-4a5d-9db7-8f21423d2c68', '315', NULL, 'Tuli', 'Female', '2023-11-06', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('18ec7b0b-92ca-4b5d-ba9d-fe6a2ec48dcd', '16', NULL, 'Tuli', 'Female', '2020-10-20', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('1ab92fc2-4ca7-4bdb-9860-7c3f57a0345f', '21', NULL, 'Tuli', 'Female', '2020-09-14', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('24047048-d36e-4941-b03f-febdc51557c7', '15', NULL, 'Other', 'Female', '2018-09-01', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', NULL, 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('242d61fa-9cbf-4faf-835c-1f441c933b66', '413', NULL, 'Tuli', 'Female', '2024-10-16', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('2ae753b2-cabf-4188-b2fc-20b4a2051574', '14', NULL, 'Tuli', 'Female', '2018-09-01', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('3c648c6c-5333-4bc6-b1eb-7e16aca6312f', '07', NULL, 'Tuli', 'Female', '2012-09-01', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('3c9da456-9eee-45e4-a8b0-f2fe3f020cf5', '09', NULL, 'Tuli', 'Female', '2013-09-01', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('3f168a84-e998-402f-a2c8-df67b074e9b2', '313', NULL, 'Tuli', 'Female', '2023-10-18', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('42550202-d374-45ea-9bcf-cf59dbd49608', '102', NULL, 'Tuli', 'Female', '2021-11-10', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('4509061a-0c90-4f62-8d4c-ce3930418340', '27', NULL, 'Tuli', 'Female', '2020-12-09', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('5135a657-08e6-42a7-ba72-8d950ebb5a38', '501', NULL, 'Tuli', 'Male', '2025-04-29', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('6e40b618-9037-4b00-bc4f-1e6ca5e3a281', '109', NULL, 'Tuli', 'Female', '2021-12-10', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('85b370f7-01f7-4e5d-b4dd-acc986ec2a8a', 'C-1063', 'Animal_63', 'Angus', 'Female', '2024-07-26', 'Active', NULL, NULL, 330, '2026-03-23 19:06:48.945732+00', '982000516867108', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 21961.00, NULL, NULL, NULL),
	('f0beba68-e6b8-47d2-980c-866b1d84d9a3', 'C-1064', 'Animal_64', 'Nguni', 'Male', '2026-01-04', 'Active', NULL, NULL, 693, '2026-03-23 19:06:48.945732+00', '982000983980475', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 21640.00, NULL, NULL, NULL),
	('bda975d6-d886-40e1-840f-5eb84981ee8a', 'C-1065', 'Animal_65', 'Simmentaler', 'Male', '2024-09-01', 'Active', NULL, NULL, 773, '2026-03-23 19:06:48.945732+00', '982000969154799', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 19641.00, NULL, NULL, NULL),
	('104ed23e-d70b-457c-ac1d-ed96698de3e1', 'C-1066', 'Animal_66', 'Boran', 'Male', '2024-07-29', 'Active', NULL, NULL, 698, '2026-03-23 19:06:48.945732+00', '982000605751962', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 23073.00, NULL, NULL, NULL),
	('acd45ea5-7aef-4ca2-b1be-9202f44e5378', 'C-1067', 'Animal_67', 'Angus', 'Male', '2025-04-10', 'Active', NULL, NULL, 612, '2026-03-23 19:06:48.945732+00', '982000916762873', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 15952.00, NULL, NULL, NULL),
	('293f4045-f83a-4ec0-b988-a1505e67bbfb', 'C-1068', 'Animal_68', 'Brahman', 'Female', '2024-08-06', 'Active', NULL, NULL, 791, '2026-03-23 19:06:48.945732+00', '982000707696193', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 19861.00, NULL, NULL, NULL),
	('3265b61b-551f-48d0-a4af-d4445179d07b', 'C-1069', 'Animal_69', 'Brahman', 'Female', '2025-07-25', 'Active', NULL, NULL, 488, '2026-03-23 19:06:48.945732+00', '982000113854936', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 18585.00, NULL, NULL, NULL),
	('deee8b45-c208-4e3a-8443-9d78a22bcfb1', 'C-1070', 'Animal_70', 'Bonsmara', 'Male', '2025-04-29', 'Active', NULL, NULL, 668, '2026-03-23 19:06:48.945732+00', '982000790735900', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 8201.00, NULL, NULL, NULL),
	('80a8c52f-f370-434b-ae84-f184dc12125b', 'C-1071', 'Animal_71', 'Nguni', 'Male', '2024-09-20', 'Active', NULL, NULL, 256, '2026-03-23 19:06:48.945732+00', '982000876714197', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 12158.00, NULL, NULL, NULL),
	('3eb79934-b6b8-4ce7-b052-c2e8aaabbada', 'C-1072', 'Animal_72', 'Hereford', 'Female', '2025-12-31', 'Active', NULL, NULL, 289, '2026-03-23 19:06:48.945732+00', '982000632459456', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 13936.00, NULL, NULL, NULL),
	('829df69e-fbf9-4321-b899-bd3e56885c13', '13', NULL, 'Tuli', 'Female', '2018-09-01', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('87bfa905-7862-485a-b9a0-d314c03d9ad1', '110', NULL, 'Tuli', 'Female', '2021-12-27', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('9552cb8c-5917-4a16-8225-8ed94e713a0c', '12', NULL, 'Tuli', 'Female', '2018-09-01', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('957507f5-7b51-46af-a7a8-c2f2b2d1cb3c', '22', NULL, 'Tuli', 'Female', '2020-11-26', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('a8ed6b23-0e35-4169-8640-bb8b64f89134', '314', NULL, 'Tuli', 'Female', '2023-11-02', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('ab07cbf0-d0c3-4859-8e9e-41ed50166812', '104', NULL, 'Tuli', 'Female', '2021-11-17', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('abb301a0-6710-462c-b7d5-c4f8ca194fce', '20', NULL, 'Tuli', 'Female', '2020-10-24', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('b86bac8f-f5eb-4f2b-a4fb-82ea000a7261', '106', NULL, 'Tuli', 'Female', '2021-11-20', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('b9325c07-b690-4c63-bde8-16841a925543', '503', NULL, 'Tuli', 'Female', '2025-10-30', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('c1375065-6d88-4a4a-8c48-26f79f2888ae', '08', NULL, 'Tuli', 'Female', '2012-09-01', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('ca3fd2e5-8b2c-469d-a771-f1908be76c56', '10', NULL, 'Tuli', 'Female', '2016-09-01', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('d0399960-50a3-44b5-a903-89d1a439b2a6', '05', NULL, 'Tuli', 'Female', '2018-08-30', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('dd582ba5-61d3-4d71-b338-18d67ac12b65', '504', NULL, 'Tuli', 'Female', '2025-11-05', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('e21f5eee-8978-49db-8bce-a74eb7ea9a63', '420', NULL, 'Tuli', 'Female', '2024-10-20', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('e9976883-e32b-4004-90ea-a97555251db8', '11', NULL, 'Tuli', 'Female', '2017-09-01', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('f0e3e403-9806-4da8-87f6-ca2ccd19afb0', '17', NULL, 'Tuli', 'Female', '2020-10-28', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('fd91747b-2004-408b-adef-422c5b9ecffa', '502', NULL, 'Tuli', 'Male', '2025-10-29', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('ff9ee68f-1729-4522-9745-62625a34e238', '06', NULL, 'Tuli', 'Female', '2011-09-01', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '5d92a3fd-a924-446e-a46d-117f5345feb6', 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('b8aa144c-2c00-43e4-8662-7e469b02e23f', '04', NULL, 'Tuli', 'Female', '2015-10-01', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', '73f7b0e5-fab9-4b08-b5e9-4277fccbcec5', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('e8100216-7f78-4d5d-bb63-fb2102e8e312', '03', NULL, 'Tuli', 'Female', '2014-08-31', 'Active', NULL, NULL, NULL, '2026-03-18 20:38:20.393203+00', NULL, false, '29a110f7-cdcf-4b5c-a66d-459122911da1', 'cfde2942-640d-406d-996b-2add7cab21e1', 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('e3d17bbe-afb3-4bd9-8862-70aad2647fd3', 'C-1073', 'Animal_73', 'Afrikaner', 'Female', '2025-09-26', 'Active', NULL, NULL, 371, '2026-03-23 19:06:48.945732+00', '982000823850044', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 24913.00, NULL, NULL, NULL),
	('c3476656-f669-4539-a178-fdc33dedd73f', 'C-1074', 'Animal_74', 'Angus', 'Male', '2025-09-30', 'Active', NULL, NULL, 731, '2026-03-23 19:06:48.945732+00', '982000341562545', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 18916.00, NULL, NULL, NULL),
	('8293580c-ad0c-482e-add8-5afe2d819884', 'C-1075', 'Animal_75', 'Hereford', 'Female', '2024-06-06', 'Sold', NULL, NULL, 349, '2026-03-23 19:06:48.945732+00', '982000999241098', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 23651.00, 32863.00, NULL, NULL),
	('6ef468a7-bbee-4caf-8c54-5b20eea31e4a', 'C-1076', 'Animal_76', 'Bonsmara', 'Female', '2024-11-14', 'Active', NULL, NULL, 460, '2026-03-23 19:06:48.945732+00', '982000414877431', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 13491.00, NULL, NULL, NULL),
	('a29f131a-1f78-4783-ac7d-331112f524d7', 'C-1077', 'Animal_77', 'Afrikaner', 'Female', '2026-03-11', 'Active', NULL, NULL, 602, '2026-03-23 19:06:48.945732+00', '982000456416374', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 23366.00, NULL, NULL, NULL),
	('3c57f125-5682-4e0d-bad5-8ee25c96deb9', 'C-1078', 'Animal_78', 'Brahman', 'Male', '2025-11-08', 'Active', NULL, NULL, 687, '2026-03-23 19:06:48.945732+00', '982000836343936', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 24268.00, NULL, NULL, NULL),
	('3d795b66-85d2-4cc4-99f7-af65e72ca412', 'C-1079', 'Animal_79', 'Simmentaler', 'Male', '2025-08-25', 'Sold', NULL, NULL, 674, '2026-03-23 19:06:48.945732+00', '982000984497887', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 10924.00, 13556.00, NULL, NULL),
	('494d99a7-9d9e-4346-9bc6-5208d394ec4c', 'C-1080', 'Animal_80', 'Boran', 'Male', '2025-02-01', 'Active', NULL, NULL, 840, '2026-03-23 19:06:48.945732+00', '982000162205934', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 16204.00, NULL, NULL, NULL),
	('98393fc0-a652-4b24-979e-39c29941dc56', 'C-1081', 'Animal_81', 'Brahman', 'Male', '2025-06-19', 'Active', NULL, NULL, 328, '2026-03-23 19:06:48.945732+00', '982000367786001', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 19093.00, NULL, NULL, NULL),
	('227658ec-a793-4112-91fb-99e7886381ec', 'C-1082', 'Animal_82', 'Angus', 'Female', '2026-02-23', 'Active', NULL, NULL, 875, '2026-03-23 19:06:48.945732+00', '982000161860638', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 13257.00, NULL, NULL, NULL),
	('3fc44ad2-8443-4e11-b545-278b594dd00d', 'C-1083', 'Animal_83', 'Nguni', 'Male', '2025-09-10', 'Active', NULL, NULL, 562, '2026-03-23 19:06:48.945732+00', '982000742276288', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 15977.00, NULL, NULL, NULL),
	('ee2bce4d-c39e-44b8-81eb-54a5afdc5668', 'C-1084', 'Animal_84', 'Afrikaner', 'Male', '2024-06-03', 'Active', NULL, NULL, 454, '2026-03-23 19:06:48.945732+00', '982000691819163', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 10057.00, NULL, NULL, NULL),
	('5565ea05-07f1-4062-8139-43247aeb5f49', 'C-1085', 'Animal_85', 'Simmentaler', 'Female', '2025-03-12', 'Active', NULL, NULL, 470, '2026-03-23 19:06:48.945732+00', '982000155818732', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 18805.00, NULL, NULL, NULL),
	('78273bbc-2200-4e90-b934-5580090d6e6d', 'C-1086', 'Animal_86', 'Nguni', 'Male', '2024-07-07', 'Active', NULL, NULL, 676, '2026-03-23 19:06:48.945732+00', '982000811440913', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 19385.00, NULL, NULL, NULL),
	('12936219-643c-453d-95e7-05bec807f64d', 'C-1087', 'Animal_87', 'Bonsmara', 'Male', '2024-05-14', 'Active', NULL, NULL, 708, '2026-03-23 19:06:48.945732+00', '982000843074172', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 12760.00, NULL, NULL, NULL),
	('fa51e076-d0d8-4e91-bc79-27151a1584a1', 'C-1088', 'Animal_88', 'Bonsmara', 'Male', '2025-02-06', 'Active', NULL, NULL, 742, '2026-03-23 19:06:48.945732+00', '982000387705677', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 8601.00, NULL, NULL, NULL),
	('6630b6db-ae71-4720-a811-4691a8673f6a', 'C-1089', 'Animal_89', 'Angus', 'Female', '2025-10-21', 'Sold', NULL, NULL, 377, '2026-03-23 19:06:48.945732+00', '982000911565272', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 15951.00, 20008.00, NULL, NULL),
	('5de1d8f1-4efb-40f6-9eea-d7b7d8c07b78', 'C-1090', 'Animal_90', 'Bonsmara', 'Female', '2025-03-07', 'Active', NULL, NULL, 604, '2026-03-23 19:06:48.945732+00', '982000842472470', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 12186.00, NULL, NULL, NULL),
	('8489e165-b18b-43b0-b84e-a49669e904a8', 'C-1091', 'Animal_91', 'Angus', 'Female', '2025-04-12', 'Active', NULL, NULL, 248, '2026-03-23 19:06:48.945732+00', '982000298666912', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 11456.00, NULL, NULL, NULL),
	('f5582310-2e91-4d8d-a8e2-b31265cc9f9b', 'C-1092', 'Animal_92', 'Bonsmara', 'Male', '2025-12-15', 'Active', NULL, NULL, 689, '2026-03-23 19:06:48.945732+00', '982000571259068', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 18561.00, NULL, NULL, NULL),
	('03206a4f-2b4e-4114-b9f1-f32be4235c1f', 'C-1093', 'Animal_93', 'Boran', 'Male', '2024-03-31', 'Active', NULL, NULL, 440, '2026-03-23 19:06:48.945732+00', '982000815200921', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 15722.00, NULL, NULL, NULL),
	('a21f8a90-4e7b-4da7-b038-c78d1648b1cb', 'C-1094', 'Animal_94', 'Simmentaler', 'Male', '2024-05-19', 'Active', NULL, NULL, 526, '2026-03-23 19:06:48.945732+00', '982000531071587', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 14539.00, NULL, NULL, NULL),
	('d0591897-dd6c-4030-8108-aea36f9e0087', 'C-1095', 'Animal_95', 'Brahman', 'Male', '2024-08-02', 'Active', NULL, NULL, 433, '2026-03-23 19:06:48.945732+00', '982000531643350', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 11511.00, NULL, NULL, NULL),
	('ebd1e623-45f5-49e1-a3fe-38e3a443ef65', 'C-1096', 'Animal_96', 'Nguni', 'Female', '2025-07-01', 'Active', NULL, NULL, 535, '2026-03-23 19:06:48.945732+00', '982000654624260', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 22974.00, NULL, NULL, NULL),
	('b4ff5350-9f52-4344-a7bb-34efdaf643a5', 'C-1097', 'Animal_97', 'Brahman', 'Female', '2025-03-11', 'Sold', NULL, NULL, 556, '2026-03-23 19:06:48.945732+00', '982000817504056', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Cattle', NULL, NULL, NULL, NULL, NULL, 23241.00, 32113.00, NULL, NULL),
	('d45f9842-42fe-4d34-98e7-eb0eaa8205bf', 'C-1098', 'Animal_98', 'Angus', 'Female', '2026-03-21', 'Active', NULL, NULL, 263, '2026-03-23 19:06:48.945732+00', '982000369315145', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 9726.00, NULL, NULL, NULL),
	('21503bae-d207-4082-8842-34f8c2729899', 'C-1099', 'Animal_99', 'Angus', 'Female', '2025-09-27', 'Active', NULL, NULL, 560, '2026-03-23 19:06:48.945732+00', '982000415775524', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 16751.00, NULL, NULL, NULL),
	('af1c42a7-1564-4ba4-8470-d8bd8e0af3bd', 'C-1100', 'Animal_100', 'Angus', 'Female', '2024-06-20', 'Active', NULL, NULL, 820, '2026-03-23 19:06:48.945732+00', '982000567740587', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Scurred', 'Cattle', NULL, NULL, NULL, NULL, NULL, 20717.00, NULL, NULL, NULL),
	('8283a70f-5e2b-4844-b626-b9c8fdeb42de', 'S-2001', 'Sheep_1', 'Van Rooy', 'Male', '2022-05-22', 'Active', NULL, NULL, 85, '2026-03-23 19:06:48.945732+00', '982111310871547', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2980.00, NULL, NULL, NULL),
	('79dd27e1-8fbb-49fe-b949-46bfc24bdaf8', 'S-2002', 'Sheep_2', 'Dorper', 'Male', '2022-07-13', 'Active', NULL, NULL, 99, '2026-03-23 19:06:48.945732+00', '982111434992808', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2852.00, NULL, NULL, NULL),
	('b11eb1f8-e804-45f6-af1c-981f9d362a63', 'S-2003', 'Sheep_3', 'Suffolk', 'Female', '2025-12-01', 'Active', NULL, NULL, 109, '2026-03-23 19:06:48.945732+00', '982111946992164', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2570.00, NULL, NULL, NULL),
	('0ffa8e3a-711b-4aa2-a784-7474185b26e6', 'S-2004', 'Sheep_4', 'Texel', 'Female', '2025-03-27', 'Sold', NULL, NULL, 39, '2026-03-23 19:06:48.945732+00', '982111912390714', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4783.00, 5759.00, NULL, NULL),
	('e5cc6eda-5dd7-43e1-879e-f8d6d5bc16ad', 'S-2005', 'Sheep_5', 'Meatmaster', 'Female', '2025-05-13', 'Active', NULL, NULL, 32, '2026-03-23 19:06:48.945732+00', '982111450167384', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 3748.00, NULL, NULL, NULL),
	('d458dc76-dca2-4cc8-9ff3-077a96eeda3e', 'S-2006', 'Sheep_6', 'Merino', 'Female', '2023-07-19', 'Active', NULL, NULL, 53, '2026-03-23 19:06:48.945732+00', '982111451462878', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 1568.00, NULL, NULL, NULL),
	('53ef4564-f42c-47de-8303-0401a120230c', 'S-2007', 'Sheep_7', 'Van Rooy', 'Female', '2024-04-08', 'Active', NULL, NULL, 38, '2026-03-23 19:06:48.945732+00', '982111150099630', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4730.00, NULL, NULL, NULL),
	('65078c4f-8dc2-41f9-aee5-cb490e1781e7', 'S-2008', 'Sheep_8', 'Suffolk', 'Female', '2024-09-07', 'Active', NULL, NULL, 82, '2026-03-23 19:06:48.945732+00', '982111742856335', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4237.00, NULL, NULL, NULL),
	('8aa6cff0-d44a-4ee7-b036-54b500f7feff', 'S-2009', 'Sheep_9', 'Suffolk', 'Female', '2023-05-13', 'Active', NULL, NULL, 32, '2026-03-23 19:06:48.945732+00', '982111897533249', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 3989.00, NULL, NULL, NULL),
	('ea3168d6-1b89-4c3f-9b52-9b7ab3a1d527', 'S-2010', 'Sheep_10', 'Van Rooy', 'Female', '2025-02-07', 'Active', NULL, NULL, 57, '2026-03-23 19:06:48.945732+00', '982111723636166', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 3598.00, NULL, NULL, NULL),
	('583603cd-d035-44c4-ba7a-c7859d1f6a49', 'S-2011', 'Sheep_11', 'Van Rooy', 'Female', '2023-05-14', 'Active', NULL, NULL, 105, '2026-03-23 19:06:48.945732+00', '982111311273761', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2285.00, NULL, NULL, NULL),
	('24d28210-733e-4e01-99f5-5ed0b0e31c1d', 'S-2012', 'Sheep_12', 'Van Rooy', 'Female', '2024-04-17', 'Active', NULL, NULL, 51, '2026-03-23 19:06:48.945732+00', '982111195093316', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4153.00, NULL, NULL, NULL),
	('0470fd10-7dc5-45c9-ac1c-79e03eb932aa', 'S-2013', 'Sheep_13', 'Texel', 'Female', '2023-08-23', 'Active', NULL, NULL, 59, '2026-03-23 19:06:48.945732+00', '982111190200704', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2177.00, NULL, NULL, NULL),
	('bbd572ce-786d-40a4-b556-d2896cbb9104', 'S-2014', 'Sheep_14', 'Texel', 'Female', '2023-04-09', 'Active', NULL, NULL, 105, '2026-03-23 19:06:48.945732+00', '982111756818096', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4299.00, NULL, NULL, NULL),
	('d8ae23a9-fe04-423c-84b8-d6bb2dbf6270', 'S-2015', 'Sheep_15', 'Dorper', 'Female', '2024-04-20', 'Active', NULL, NULL, 36, '2026-03-23 19:06:48.945732+00', '982111538931712', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4734.00, NULL, NULL, NULL),
	('30c161e8-d2e3-4796-bd34-7a345ea7654a', 'S-2016', 'Sheep_16', 'Dorper', 'Female', '2025-04-27', 'Active', NULL, NULL, 70, '2026-03-23 19:06:48.945732+00', '982111157522311', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4619.00, NULL, NULL, NULL),
	('b9b80c24-0976-4054-976a-fc60911c49ca', 'S-2017', 'Sheep_17', 'Meatmaster', 'Female', '2026-02-15', 'Active', NULL, NULL, 119, '2026-03-23 19:06:48.945732+00', '982111675177386', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4253.00, NULL, NULL, NULL),
	('d9cd9de8-a37e-450f-a82d-487005e3f52c', 'S-2018', 'Sheep_18', 'Suffolk', 'Female', '2025-12-11', 'Active', NULL, NULL, 100, '2026-03-23 19:06:48.945732+00', '982111389975197', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4895.00, NULL, NULL, NULL),
	('749303e6-ac4e-48ce-90c0-1c605b17d0f9', 'S-2019', 'Sheep_19', 'Merino', 'Male', '2025-07-23', 'Active', NULL, NULL, 68, '2026-03-23 19:06:48.945732+00', '982111985363542', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 3691.00, NULL, NULL, NULL),
	('ee280486-5456-430a-b1b6-a748d58b65b8', 'S-2020', 'Sheep_20', 'Van Rooy', 'Female', '2025-07-16', 'Active', NULL, NULL, 56, '2026-03-23 19:06:48.945732+00', '982111491658423', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2815.00, NULL, NULL, NULL),
	('d434150f-b198-4aa4-944a-9369df28c3f0', 'S-2021', 'Sheep_21', 'Van Rooy', 'Female', '2026-02-24', 'Active', NULL, NULL, 75, '2026-03-23 19:06:48.945732+00', '982111535860252', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2568.00, NULL, NULL, NULL),
	('f8454cc1-42ea-4589-91c8-fcb22fa665e8', 'S-2022', 'Sheep_22', 'Suffolk', 'Male', '2026-03-15', 'Active', NULL, NULL, 72, '2026-03-23 19:06:48.945732+00', '982111615580498', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 1772.00, NULL, NULL, NULL),
	('03b2d553-231d-418f-be51-400a383559db', 'S-2023', 'Sheep_23', 'Van Rooy', 'Female', '2025-04-24', 'Active', NULL, NULL, 120, '2026-03-23 19:06:48.945732+00', '982111691108923', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4129.00, NULL, NULL, NULL),
	('17e56bda-4729-4c70-9278-ed892b4cd91b', 'S-2024', 'Sheep_24', 'Merino', 'Female', '2025-04-18', 'Active', NULL, NULL, 84, '2026-03-23 19:06:48.945732+00', '982111663928426', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4242.00, NULL, NULL, NULL),
	('f3eac19d-82f3-4407-8f79-786b800967d1', 'S-2025', 'Sheep_25', 'Meatmaster', 'Male', '2025-07-20', 'Sold', NULL, NULL, 45, '2026-03-23 19:06:48.945732+00', '982111995211328', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 1782.00, 2451.00, NULL, NULL),
	('75e3b86b-b7da-4221-a9db-a423e3ef801f', 'S-2026', 'Sheep_26', 'Van Rooy', 'Female', '2025-07-03', 'Active', NULL, NULL, 75, '2026-03-23 19:06:48.945732+00', '982111801956001', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2859.00, NULL, NULL, NULL),
	('2cbed68d-3285-44d0-84b4-7cd7f4fbc6a0', 'S-2027', 'Sheep_27', 'Van Rooy', 'Male', '2025-10-24', 'Active', NULL, NULL, 101, '2026-03-23 19:06:48.945732+00', '982111659690432', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 3120.00, NULL, NULL, NULL),
	('d25ffaf8-e3f5-442e-ae72-3ea62bdd8223', 'S-2028', 'Sheep_28', 'Merino', 'Male', '2025-04-05', 'Active', NULL, NULL, 86, '2026-03-23 19:06:48.945732+00', '982111695787551', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2972.00, NULL, NULL, NULL),
	('a71401c6-7099-415a-a083-47eeca30d3ae', 'S-2029', 'Sheep_29', 'Texel', 'Male', '2025-09-15', 'Active', NULL, NULL, 88, '2026-03-23 19:06:48.945732+00', '982111357656520', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4821.00, NULL, NULL, NULL),
	('4275dc09-245e-411f-9db5-fdde5b9f4471', 'S-2030', 'Sheep_30', 'Texel', 'Male', '2025-11-05', 'Active', NULL, NULL, 97, '2026-03-23 19:06:48.945732+00', '982111711134507', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2582.00, NULL, NULL, NULL),
	('67eaf3fc-776d-40f0-bc09-e960472ba307', 'S-2031', 'Sheep_31', 'Merino', 'Female', '2025-12-21', 'Active', NULL, NULL, 98, '2026-03-23 19:06:48.945732+00', '982111331890001', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2880.00, NULL, NULL, NULL),
	('4a9e41cb-aa17-46ec-8863-8fa4e7cc3fcd', 'S-2032', 'Sheep_32', 'Suffolk', 'Female', '2025-08-10', 'Active', NULL, NULL, 52, '2026-03-23 19:06:48.945732+00', '982111795578063', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2469.00, NULL, NULL, NULL),
	('134a7b83-50f3-4037-9d4f-62fe0a4cdb33', 'S-2033', 'Sheep_33', 'Merino', 'Male', '2026-03-05', 'Active', NULL, NULL, 54, '2026-03-23 19:06:48.945732+00', '982111132788681', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 1972.00, NULL, NULL, NULL),
	('9b7b5ce8-3f93-40ee-be73-b32cd4349ec1', 'S-2034', 'Sheep_34', 'Dorper', 'Male', '2025-08-20', 'Sold', NULL, NULL, 98, '2026-03-23 19:06:48.945732+00', '982111878702972', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4525.00, 6109.00, NULL, NULL),
	('91df1544-7a57-4dc8-a105-cce4306f5a7d', 'S-2035', 'Sheep_35', 'Suffolk', 'Male', '2025-08-03', 'Active', NULL, NULL, 66, '2026-03-23 19:06:48.945732+00', '982111609020574', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 3473.00, NULL, NULL, NULL),
	('a6e679f4-4e79-4582-8dd9-4a09a7bfdf90', 'S-2036', 'Sheep_36', 'Merino', 'Male', '2025-10-10', 'Active', NULL, NULL, 98, '2026-03-23 19:06:48.945732+00', '982111121540396', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4043.00, NULL, NULL, NULL),
	('dc669c0d-b520-4a0d-a0db-a0b25a572e82', 'S-2037', 'Sheep_37', 'Van Rooy', 'Male', '2026-03-18', 'Active', NULL, NULL, 119, '2026-03-23 19:06:48.945732+00', '982111486036425', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 1906.00, NULL, NULL, NULL),
	('1133a4f4-1e16-4e85-af40-682ac1c615ea', 'S-2038', 'Sheep_38', 'Suffolk', 'Female', '2025-04-01', 'Active', NULL, NULL, 58, '2026-03-23 19:06:48.945732+00', '982111810904523', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2731.00, NULL, NULL, NULL),
	('17f732dd-921c-4b77-b672-48842fb2d237', 'S-2039', 'Sheep_39', 'Texel', 'Female', '2025-10-26', 'Active', NULL, NULL, 109, '2026-03-23 19:06:48.945732+00', '982111101529674', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2652.00, NULL, NULL, NULL),
	('b529296e-a728-4a0f-9eb0-aac94d6a45dd', 'S-2040', 'Sheep_40', 'Meatmaster', 'Male', '2026-03-09', 'Active', NULL, NULL, 39, '2026-03-23 19:06:48.945732+00', '982111958164597', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 1999.00, NULL, NULL, NULL),
	('c24d78e2-2835-4f17-86d8-20b58b865ace', 'S-2041', 'Sheep_41', 'Dorper', 'Male', '2025-08-09', 'Active', NULL, NULL, 44, '2026-03-23 19:06:48.945732+00', '982111894151248', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4706.00, NULL, NULL, NULL),
	('90800ce9-06f5-4672-895c-2a410f1c753b', 'S-2042', 'Sheep_42', 'Suffolk', 'Male', '2025-10-29', 'Active', NULL, NULL, 49, '2026-03-23 19:06:48.945732+00', '982111520000614', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 1754.00, NULL, NULL, NULL),
	('da2980a9-f329-42d0-8725-d3a733c82ce4', 'S-2043', 'Sheep_43', 'Meatmaster', 'Female', '2025-06-04', 'Sold', NULL, NULL, 119, '2026-03-23 19:06:48.945732+00', '982111926260238', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 3803.00, 5404.00, NULL, NULL),
	('da9db53c-eb88-413a-9259-338da91e2464', 'S-2044', 'Sheep_44', 'Van Rooy', 'Male', '2025-05-02', 'Active', NULL, NULL, 92, '2026-03-23 19:06:48.945732+00', '982111989764479', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 3652.00, NULL, NULL, NULL),
	('0326d8cc-0878-4ecb-9186-72a56838c497', 'S-2045', 'Sheep_45', 'Suffolk', 'Male', '2025-03-26', 'Active', NULL, NULL, 53, '2026-03-23 19:06:48.945732+00', '982111347772429', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 1666.00, NULL, NULL, NULL),
	('b9762696-24ed-4879-8853-33c6085258be', 'S-2046', 'Sheep_46', 'Texel', 'Female', '2026-01-12', 'Active', NULL, NULL, 55, '2026-03-23 19:06:48.945732+00', '982111973932887', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 3305.00, NULL, NULL, NULL),
	('8829dd9b-e252-4d39-a313-2402815b47ba', 'S-2047', 'Sheep_47', 'Van Rooy', 'Male', '2025-06-17', 'Active', NULL, NULL, 99, '2026-03-23 19:06:48.945732+00', '982111614139608', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4491.00, NULL, NULL, NULL),
	('b73dbd46-7c78-4fde-a96e-188d4fcc98c6', 'S-2048', 'Sheep_48', 'Suffolk', 'Female', '2025-07-16', 'Active', NULL, NULL, 66, '2026-03-23 19:06:48.945732+00', '982111190882821', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 2985.00, NULL, NULL, NULL),
	('4d346ff7-df07-4625-b7c0-915bc5c5a63a', 'S-2049', 'Sheep_49', 'Meatmaster', 'Male', '2025-06-09', 'Active', NULL, NULL, 53, '2026-03-23 19:06:48.945732+00', '982111537633046', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4354.00, NULL, NULL, NULL),
	('28e64a22-7e22-47fc-a6a7-37cca3e476d5', 'S-2050', 'Sheep_50', 'Meatmaster', 'Female', '2025-08-21', 'Sold', NULL, NULL, 92, '2026-03-23 19:06:48.945732+00', '982111388037256', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Polled', 'Sheep', NULL, NULL, NULL, NULL, NULL, 4552.00, 6415.00, NULL, NULL),
	('10329f06-9d4b-47cc-9bd1-60c2f439d511', 'C-1008-C1', NULL, 'Crossbreed', 'Male', '2026-03-23', 'Active', NULL, 'cdf32680-fe58-4d65-aa70-8ada687b0a61', NULL, '2026-03-24 20:06:08.035815+00', NULL, false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, NULL, 'Cattle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('cdf32680-fe58-4d65-aa70-8ada687b0a61', 'C-1006', 'Animal_6', 'Afrikaner', 'Female', '2023-02-08', 'Sold', NULL, NULL, 253, '2026-03-23 19:06:48.945732+00', '982000682540165', false, 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', NULL, 'Horned', 'Cattle', NULL, NULL, NULL, NULL, NULL, 15517.00, 12000.00, NULL, NULL),
	('4d1e230c-b22d-4f25-9777-a6dfeffeff26', 'TAG-001', NULL, 'Boran', 'Female', '2026-03-31', 'Active', NULL, NULL, NULL, '2026-03-31 18:17:08.565798+00', NULL, false, '7c05cce8-2ced-4f45-bdd0-2880ba741652', 'fc97c3d3-bfa8-4e4b-968b-1213b871c6a5', NULL, 'Cattle', NULL, NULL, NULL, NULL, '2026-03-31', NULL, NULL, NULL, NULL);


--
-- Data for Name: movement_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."movement_log" ("id", "animal_id", "movement_date", "origin", "destination", "permit_number", "vehicle_registration", "notes", "created_at", "user_id", "permit_issue_date", "permit_expiry_date", "permit_pdf_url", "origin_gps", "destination_gps", "origin_gln", "destination_gln", "gps_source") VALUES
	('e327e35d-6186-45e5-922d-d8e5a41b6cda', 'f6a6bebf-45c6-4620-bb21-56471fddd0a7', '2026-03-19', 'Unassigned / Different Pasture', 'North', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:10.448967+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('cb0bd85e-eacf-492a-b82c-de3a20bd244f', 'a79a7f9f-cd4f-4d20-8810-12d1866cef88', '2026-03-19', 'Unassigned / Different Pasture', 'North', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:10.448967+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('1d0d2e3a-2f90-427d-9499-fb3e57057e8c', 'd8eae0d1-e079-42a4-baed-d6acc5fd99ca', '2026-03-19', 'Unassigned / Different Pasture', 'North', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:10.448967+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('6ad924ff-bfc0-4583-a332-0126590160aa', '08479d26-ff9f-4b41-a55c-2bd143dc51a1', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('4d92d900-ea61-45d5-9f73-ad44a27c99a2', '0e71cf10-5fa6-45e6-9565-07d379301cb8', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('98eb10b8-cb41-4891-8014-62f4fb7a6270', 'e8100216-7f78-4d5d-bb63-fb2102e8e312', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('a18a83c0-b7d9-4411-b625-6e76d5bb349e', 'b8aa144c-2c00-43e4-8662-7e469b02e23f', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('0e0e75db-d8f4-4ade-be3b-3223865fed5e', 'd0399960-50a3-44b5-a903-89d1a439b2a6', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('4f90b84d-9777-45db-b023-efb395812e9c', 'ff9ee68f-1729-4522-9745-62625a34e238', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('280be167-2d69-470b-b5b5-3d1ae73ac80a', '3c648c6c-5333-4bc6-b1eb-7e16aca6312f', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('7f2fd3ca-3351-438b-b135-5ee3feab9bc2', 'c1375065-6d88-4a4a-8c48-26f79f2888ae', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('bff85f06-8e55-425f-adc0-5d2ec374a3b7', '3c9da456-9eee-45e4-a8b0-f2fe3f020cf5', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('7e10b96b-448c-49e0-b114-895a5da06cde', 'ca3fd2e5-8b2c-469d-a771-f1908be76c56', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('5b304e29-7d42-4395-bb36-734b565f8320', '42550202-d374-45ea-9bcf-cf59dbd49608', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('f5fe3352-677f-4508-a95f-a30b81ae93ed', 'ab07cbf0-d0c3-4859-8e9e-41ed50166812', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('89e721aa-6b76-453f-b473-0476112acae2', '007fa5a0-91fc-4936-aa82-74e49c4eaf8f', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('36330bf6-7499-4842-a0ca-1b5bc50ec119', 'b86bac8f-f5eb-4f2b-a4fb-82ea000a7261', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('bb23cc01-3d71-4624-ac4c-d3aa8da06621', '6e40b618-9037-4b00-bc4f-1e6ca5e3a281', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('8cf4ed3e-bc44-4eda-ae19-14f297793d0d', 'e9976883-e32b-4004-90ea-a97555251db8', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('df4499f8-ef4a-443f-b56e-211290cd895d', '87bfa905-7862-485a-b9a0-d314c03d9ad1', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('b2ecd65c-ed7f-48bf-bb50-df3d42165cf6', '9552cb8c-5917-4a16-8225-8ed94e713a0c', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('516e747e-4307-4f4f-9fca-e543750b03df', '829df69e-fbf9-4321-b899-bd3e56885c13', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('37025cd6-3423-4183-a609-ec83cdbc3770', '2ae753b2-cabf-4188-b2fc-20b4a2051574', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('76a638bc-d359-43a0-8125-b4e1c098c8fd', '24047048-d36e-4941-b03f-febdc51557c7', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('7b2ce133-bb14-437b-a42b-3395c3ce3145', '18ec7b0b-92ca-4b5d-ba9d-fe6a2ec48dcd', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('183520f3-dcb8-4cfb-924f-fd1437bc73c9', 'f0e3e403-9806-4da8-87f6-ca2ccd19afb0', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('55be4045-1773-4028-8811-7a57cc24017f', 'abb301a0-6710-462c-b7d5-c4f8ca194fce', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('68154717-b857-4394-b403-9ac52341b144', '1ab92fc2-4ca7-4bdb-9860-7c3f57a0345f', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('771bafee-146d-4c04-9f70-a34c32c8e28e', '957507f5-7b51-46af-a7a8-c2f2b2d1cb3c', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('e96093c7-e8d3-4bca-861e-08ff5a1d404e', '4509061a-0c90-4f62-8d4c-ce3930418340', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('7db2255e-1bf1-4ef5-89d2-f1fa5c978690', '3f168a84-e998-402f-a2c8-df67b074e9b2', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('54c9a871-d630-44ff-a15f-ea9dda19f14f', 'a8ed6b23-0e35-4169-8640-bb8b64f89134', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('23a3f2cf-5553-4533-a364-e4c3fdf2c088', '102637f8-a0e7-4a5d-9db7-8f21423d2c68', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('8955e2d2-6272-4a69-98a6-b9f937c7c320', '242d61fa-9cbf-4faf-835c-1f441c933b66', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('715c5d4c-1196-402b-a58e-37213906f0df', 'e21f5eee-8978-49db-8bce-a74eb7ea9a63', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('26880ea7-b478-475e-9776-dc995d5d765a', '5135a657-08e6-42a7-ba72-8d950ebb5a38', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('f6cd4ba5-93c5-4cc6-9609-ea2f65fd0f9e', 'fd91747b-2004-408b-adef-422c5b9ecffa', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('8ecac9a9-fbc6-4eba-95ea-68bc68ed0b09', 'b9325c07-b690-4c63-bde8-16841a925543', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('77a6f858-8126-45fc-bea9-a43c02dbeaa4', 'dd582ba5-61d3-4d71-b338-18d67ac12b65', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('9bbb7649-8a3c-4112-8483-6ecf8194b857', '8397c09c-0e8e-4ea3-ae14-25d5f71b8246', '2026-03-19', 'Unassigned / Different Pasture', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:21.949805+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('39d4338a-30ae-4c7a-a5d6-d077f9e4c2e9', '08479d26-ff9f-4b41-a55c-2bd143dc51a1', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('d53a967d-0a43-44f5-aa7c-10f14590870f', '0e71cf10-5fa6-45e6-9565-07d379301cb8', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('f23465ed-2c94-49ec-88d1-7d98622a557d', 'e8100216-7f78-4d5d-bb63-fb2102e8e312', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('1b800661-cb99-4b28-95ec-7619313e5499', 'b8aa144c-2c00-43e4-8662-7e469b02e23f', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('82f8d0e9-cc3e-4154-bb7a-dbad64c2d78a', 'd0399960-50a3-44b5-a903-89d1a439b2a6', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('986c4916-e2f1-4ccf-946f-50dd7be365dc', 'ff9ee68f-1729-4522-9745-62625a34e238', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('23118bf3-2132-4160-acc3-a5933f26ec4a', '3c648c6c-5333-4bc6-b1eb-7e16aca6312f', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('87396d94-9033-4950-a48f-22e3f63943c6', 'c1375065-6d88-4a4a-8c48-26f79f2888ae', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('f4030a76-b8ae-412f-b745-a6bd5970e9f6', '3c9da456-9eee-45e4-a8b0-f2fe3f020cf5', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('88499b86-c257-4b73-96be-0dc437aefc0d', 'ca3fd2e5-8b2c-469d-a771-f1908be76c56', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('4d45a6be-6e01-4ad3-a772-314344dd1a10', '42550202-d374-45ea-9bcf-cf59dbd49608', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('316e0e29-9520-44fa-89f7-c3c2200c4358', 'ab07cbf0-d0c3-4859-8e9e-41ed50166812', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('6b9a858f-d057-443b-b70f-b4ec11c0c738', '007fa5a0-91fc-4936-aa82-74e49c4eaf8f', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('60a7dae0-2797-48c5-8a64-6a6a42d565eb', 'b86bac8f-f5eb-4f2b-a4fb-82ea000a7261', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('4593390f-4018-4121-9c28-c218e31fb8da', '6e40b618-9037-4b00-bc4f-1e6ca5e3a281', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('46e86a04-3c9e-4b8e-87b5-212809554282', 'e9976883-e32b-4004-90ea-a97555251db8', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('aa67bc57-dacd-4065-825d-fd6b55fa58b5', '87bfa905-7862-485a-b9a0-d314c03d9ad1', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('484735bd-67f0-4804-8869-ce1baa7cd42d', '9552cb8c-5917-4a16-8225-8ed94e713a0c', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('7db50f9c-b598-4d1b-9c99-710291e82c70', '829df69e-fbf9-4321-b899-bd3e56885c13', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('8974dae9-b203-4ec8-b42d-ed018f4a7ad8', '2ae753b2-cabf-4188-b2fc-20b4a2051574', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('957ebcce-7e06-42fc-9649-c18684986e19', '24047048-d36e-4941-b03f-febdc51557c7', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('98e7e5eb-79c6-471d-a1c3-2185bf3e933e', '18ec7b0b-92ca-4b5d-ba9d-fe6a2ec48dcd', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('75e0b222-748d-4d8c-895e-0c017d79f138', 'f0e3e403-9806-4da8-87f6-ca2ccd19afb0', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('24124ff8-64fd-42cc-8374-92d63660d016', 'abb301a0-6710-462c-b7d5-c4f8ca194fce', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('6b494690-fa7a-46b6-9817-e67cc50db106', '1ab92fc2-4ca7-4bdb-9860-7c3f57a0345f', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('b9e400d4-0e41-4c5c-b4e8-5347c12b583a', '957507f5-7b51-46af-a7a8-c2f2b2d1cb3c', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('c30a2e89-0c40-4583-988e-ae9621261efb', '4509061a-0c90-4f62-8d4c-ce3930418340', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('5b147d5a-f7af-458a-b90c-e640fe32ee39', '3f168a84-e998-402f-a2c8-df67b074e9b2', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('aa847ca1-4bf6-4a58-9416-8df33b5f2985', 'a8ed6b23-0e35-4169-8640-bb8b64f89134', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('ae2c9243-5429-4b2a-81cd-bd9921072ccd', '102637f8-a0e7-4a5d-9db7-8f21423d2c68', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('b558ab73-a69c-4d77-8ec1-755ffedf71a0', '242d61fa-9cbf-4faf-835c-1f441c933b66', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('acfb1005-2cde-408b-8163-598f62ac41a3', 'e21f5eee-8978-49db-8bce-a74eb7ea9a63', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('2d99c666-fbb0-493e-99da-f2c1d510a334', '5135a657-08e6-42a7-ba72-8d950ebb5a38', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('3c93b711-16ff-48b1-83ed-5d9df5356777', 'fd91747b-2004-408b-adef-422c5b9ecffa', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('2a37c427-4272-414e-8e8d-f544d3628b1a', 'b9325c07-b690-4c63-bde8-16841a925543', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('dbce2dd8-d681-4390-8b05-b92bd28085f3', 'dd582ba5-61d3-4d71-b338-18d67ac12b65', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('a2c44713-bdad-4469-a2f4-6517250ae2a0', '8397c09c-0e8e-4ea3-ae14-25d5f71b8246', '2026-03-19', 'River Camp', 'South Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:40.109915+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('5fa16798-feb1-4c63-a4c9-b3a7f16a88da', '08479d26-ff9f-4b41-a55c-2bd143dc51a1', '2026-03-19', 'South Camp', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:48.830239+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('3345f041-2cd0-4eb9-aa8a-06253acc7142', '0e71cf10-5fa6-45e6-9565-07d379301cb8', '2026-03-19', 'South Camp', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:48.830239+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('92fc28df-c415-46c6-9f47-c3bd24fbeb31', 'e8100216-7f78-4d5d-bb63-fb2102e8e312', '2026-03-19', 'South Camp', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:48.830239+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('50560ff2-2005-479f-8b78-8b6eed21e8c2', 'b8aa144c-2c00-43e4-8662-7e469b02e23f', '2026-03-19', 'South Camp', 'River Camp', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-19 18:46:48.830239+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('1a491ebd-a19f-4b34-8058-4ab667327991', '08479d26-ff9f-4b41-a55c-2bd143dc51a1', '2026-03-21', 'River Camp', 'North', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-21 06:44:42.410245+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('a03a41ee-cda6-4d68-95b8-7bfbcc88145b', '0e71cf10-5fa6-45e6-9565-07d379301cb8', '2026-03-21', 'River Camp', 'North', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-21 06:44:42.410245+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('8a72fcfc-746d-416a-8fb9-f526a526e546', 'e8100216-7f78-4d5d-bb63-fb2102e8e312', '2026-03-21', 'River Camp', 'North', NULL, NULL, 'Batch moved via Camp & Pasture Manager', '2026-03-21 06:44:42.410245+00', '29a110f7-cdcf-4b5c-a66d-459122911da1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual'),
	('cc2d3815-8e30-4121-9ad8-2f243c23e0c0', '4d1e230c-b22d-4f25-9777-a6dfeffeff26', '2026-03-31', 'Initial Assignment / Purchase', 'North Winter Camp', NULL, NULL, 'Automatic log on creation', '2026-03-31 18:17:08.914609+00', '7c05cce8-2ced-4f45-bdd0-2880ba741652', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Manual');


--
-- Data for Name: biosecurity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: farm_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."farm_settings" ("id", "user_id", "farm_name", "district", "default_cattle_breed", "default_sheep_breed", "gs1_company_prefix", "legal_entity_gln", "created_at", "updated_at", "gln_certificate_url", "brand_certificate_url", "audio_used_bytes") VALUES
	('caba8795-767d-46b2-8515-c73d7bbe0472', 'b800f1eb-f7e2-4f4b-bf40-8a3a7dccdab3', 'Rykwater', 'Free State', 'Tuli', 'Dorper', '', '', '2026-03-19 19:13:40.94167+00', '2026-03-19 19:13:40.709+00', NULL, NULL, 0),
	('9d94cb8f-9228-4706-ae15-9c260e5a3f58', 'f5f7c3eb-a624-41b4-89f6-1852dddb304a', 'Rykwater', 'Free State', 'Tuli', 'Dorper', '', '', '2026-03-23 19:03:30.75409+00', '2026-03-24 20:14:50.268+00', '', '', 0),
	('037152c1-d28a-49da-8bfa-f421f4b07d75', '29a110f7-cdcf-4b5c-a66d-459122911da1', 'Rykwater', 'Free State', 'Tuli', 'Dorper', '6009238655901', '6009238655901', '2026-03-19 18:27:54.745172+00', '2026-04-05 05:44:20.172+00', '', '', 0);


--
-- Data for Name: health_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."health_logs" ("id", "animal_id", "treatment_type", "medication", "dosage", "date_administered", "notes", "created_at", "user_id") VALUES
	('c0c28c13-c6cd-4087-b4b3-c80e36a54b7e', 'd45f9842-42fe-4d34-98e7-eb0eaa8205bf', 'Medication', 'penicillin', '10ml', '2026-03-23', 'Logged via Voice Prompt: "my guy see 1098 10 ml of penicillin yesterday"', '2026-03-24 19:51:23.126051+00', 'f5f7c3eb-a624-41b4-89f6-1852dddb304a'),
	('8918e81e-d17b-4ed3-bc8c-6750eee9e36f', '8397c09c-0e8e-4ea3-ae14-25d5f71b8246', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('3fd26c1f-f3cc-4b73-aa1b-e765a72eb31d', 'a79a7f9f-cd4f-4d20-8810-12d1866cef88', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('e794ad10-8fa6-4ed2-86d7-159691ccb2d6', 'd8eae0d1-e079-42a4-baed-d6acc5fd99ca', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('17ef0f12-304d-419f-879f-5f381563530d', 'f6a6bebf-45c6-4620-bb21-56471fddd0a7', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('bfcf8c4b-2c6e-439f-a516-d0b5a57dff12', '08479d26-ff9f-4b41-a55c-2bd143dc51a1', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('9f0ad67e-c036-4a9d-abcd-1ca1ae8f1b8b', '0e71cf10-5fa6-45e6-9565-07d379301cb8', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('f449e0f4-e26a-4756-86b5-0605b72c58ba', '007fa5a0-91fc-4936-aa82-74e49c4eaf8f', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('a529959f-1d39-4db7-9ed0-426642257660', '102637f8-a0e7-4a5d-9db7-8f21423d2c68', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('6ba2024a-4a9b-4319-aa3a-ffc2d5e2b2a0', '18ec7b0b-92ca-4b5d-ba9d-fe6a2ec48dcd', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('28360808-e846-4bf2-b6fc-22261e5e654f', '1ab92fc2-4ca7-4bdb-9860-7c3f57a0345f', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('c7886cff-afe3-4826-9ceb-59307466d5c0', '24047048-d36e-4941-b03f-febdc51557c7', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('bd5ddef5-9304-49cd-9d80-590c4e5d5d1b', '242d61fa-9cbf-4faf-835c-1f441c933b66', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('dca9a1a2-aba6-4965-861d-9f2b0eb27d0f', '2ae753b2-cabf-4188-b2fc-20b4a2051574', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('e00ca59a-0328-4efe-af70-c67dd85e0fcf', '3c648c6c-5333-4bc6-b1eb-7e16aca6312f', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('c3400284-8b56-41d2-b0bb-ab7f0c1c6716', '3c9da456-9eee-45e4-a8b0-f2fe3f020cf5', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('e1e1f50a-92bf-45c8-a595-b50e07233383', '3f168a84-e998-402f-a2c8-df67b074e9b2', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('623437ff-efa6-4f40-bd2b-067c814c4595', '42550202-d374-45ea-9bcf-cf59dbd49608', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('0e5e6c9f-ee64-458d-949d-50247b49268e', '4509061a-0c90-4f62-8d4c-ce3930418340', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('5c334a55-afd9-46d6-abee-a9c627a9a687', '5135a657-08e6-42a7-ba72-8d950ebb5a38', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('05c367ef-c8aa-4205-8b0f-bfce754a9763', '6e40b618-9037-4b00-bc4f-1e6ca5e3a281', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('e90a60a8-1c7f-41d9-b560-3247787faa49', '829df69e-fbf9-4321-b899-bd3e56885c13', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('b6e793fb-eab1-4bd6-945c-fd71a2220bce', '87bfa905-7862-485a-b9a0-d314c03d9ad1', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('90ccdad0-42e1-4f58-8c4e-d88a2e69a671', '9552cb8c-5917-4a16-8225-8ed94e713a0c', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('85739d80-cdba-4d4c-924a-8a27b2158482', '957507f5-7b51-46af-a7a8-c2f2b2d1cb3c', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('771f1184-2ebe-4d73-b9d6-f84cf34d1cb5', 'a8ed6b23-0e35-4169-8640-bb8b64f89134', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('03b76fd1-2c1b-4dd2-9b61-75732742b485', 'ab07cbf0-d0c3-4859-8e9e-41ed50166812', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('e33613ad-3d8e-4457-ba61-135f2a267e6c', 'abb301a0-6710-462c-b7d5-c4f8ca194fce', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('423db77a-7c1c-4366-9b02-090374223c7d', 'b86bac8f-f5eb-4f2b-a4fb-82ea000a7261', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('81818bbd-f8cd-45de-b894-d0d82537d7fb', 'b9325c07-b690-4c63-bde8-16841a925543', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('ea758db6-b190-424e-8e1d-a991e09db13c', 'c1375065-6d88-4a4a-8c48-26f79f2888ae', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('7c566a8f-ca73-4cd8-b5c2-e1f6b57cdef1', 'ca3fd2e5-8b2c-469d-a771-f1908be76c56', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('4d6c9012-c536-4059-9100-124b8e679db3', 'd0399960-50a3-44b5-a903-89d1a439b2a6', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('28a6ab3e-5774-4e21-b9ef-00af0f6ec98a', 'dd582ba5-61d3-4d71-b338-18d67ac12b65', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('e3702008-7c5c-4862-ae3f-387999b3cfd9', 'e21f5eee-8978-49db-8bce-a74eb7ea9a63', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('d8e57424-8a2a-47a2-bcb4-c996238c850b', 'e9976883-e32b-4004-90ea-a97555251db8', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('e0e26876-47b7-4134-b9ff-f347151f1b58', 'f0e3e403-9806-4da8-87f6-ca2ccd19afb0', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('6f5fde94-b5e6-4e57-ad5d-21b5c8323232', 'fd91747b-2004-408b-adef-422c5b9ecffa', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('7b2e10e6-912b-4b9f-a495-7f6ad88973bf', 'ff9ee68f-1729-4522-9745-62625a34e238', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('7de17109-829d-4260-92d2-c4bac068748c', 'b8aa144c-2c00-43e4-8662-7e469b02e23f', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('29c75cff-c58c-4489-aca8-b0c81e377a5d', 'e8100216-7f78-4d5d-bb63-fb2102e8e312', 'Vaccination', 'foot and mouth disease vaccine', '', '2026-03-24', 'Batch Logged via Voice: "I have vaccinated my whole herd against foot and mouth disease yesterday."', '2026-03-25 18:50:18.260675+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('865b57ae-86f3-4014-8437-d7b3211b1a9c', 'a79a7f9f-cd4f-4d20-8810-12d1866cef88', 'Deworming', NULL, NULL, '2026-03-25', 'Batch Logged via Voice: "I have dewormed all my sheep today."', '2026-03-25 19:11:27.269568+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('59ea22a0-77cc-493b-ad15-7af816b0ec00', 'd8eae0d1-e079-42a4-baed-d6acc5fd99ca', 'Deworming', NULL, NULL, '2026-03-25', 'Batch Logged via Voice: "I have dewormed all my sheep today."', '2026-03-25 19:11:27.269568+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('2762f3e0-cc5b-4550-833e-a84e0d6698a0', 'f6a6bebf-45c6-4620-bb21-56471fddd0a7', 'Deworming', NULL, NULL, '2026-03-25', 'Batch Logged via Voice: "I have dewormed all my sheep today."', '2026-03-25 19:11:27.269568+00', '29a110f7-cdcf-4b5c-a66d-459122911da1'),
	('7648e4cf-7711-49cc-a7b2-4bf83d5c0775', 'c1375065-6d88-4a4a-8c48-26f79f2888ae', 'Illness', 'Terramycin', '45ml', '2026-03-02', 'Injury detected on left back leg', '2026-04-05 05:31:37.32797+00', '29a110f7-cdcf-4b5c-a66d-459122911da1');


--
-- Data for Name: journal_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."journal_logs" ("id", "animal_id", "note_text", "date_recorded", "created_at", "audio_url", "audio_size_bytes", "audio_duration_seconds") VALUES
	('40424ddd-5fea-4641-884f-64174ef03f44', '10329f06-9d4b-47cc-9bd1-60c2f439d511', 'Added via Voice Prompt: "gal c1008  just gave birth to a healthy bull golf  can you log it for me". Mother: C-1006', '2026-03-24', '2026-03-24 20:06:08.37125+00', NULL, NULL, NULL),
	('67ce41d3-6034-4406-ae6f-453ccd398949', '89e46e6e-a337-436f-b7c3-337dd83ef15b', 'abc', '2026-04-02', '2026-04-02 19:12:22.245282+00', NULL, NULL, NULL),
	('3c724bbe-1c8f-453e-b654-4533b72040b5', '102637f8-a0e7-4a5d-9db7-8f21423d2c68', 'Hello world ', '2026-04-02', '2026-04-02 19:29:17.657351+00', NULL, NULL, NULL),
	('067810b0-6be7-4099-b76f-06e268f3d774', '242d61fa-9cbf-4faf-835c-1f441c933b66', 'Hello', '2026-04-02', '2026-04-02 19:44:40.364212+00', NULL, NULL, NULL),
	('d743d242-1e29-4e62-8623-3144f146bd5c', '242d61fa-9cbf-4faf-835c-1f441c933b66', 'Hello how are you', '2026-04-02', '2026-04-02 20:47:57.843109+00', NULL, NULL, NULL),
	('6bbd8e18-1648-45c7-8af3-409769cff06e', '102637f8-a0e7-4a5d-9db7-8f21423d2c68', 'Audio Note', '2026-04-02', '2026-04-02 20:55:07.178412+00', '102637f8-a0e7-4a5d-9db7-8f21423d2c68/6bbd8e18-1648-45c7-8af3-409769cff06e.webm', 227569, 10),
	('0375b37b-40d8-4fad-ad96-47b722a25ed8', '102637f8-a0e7-4a5d-9db7-8f21423d2c68', 'It is time to vaccinate these animals', '2026-04-02', '2026-04-02 20:55:41.336662+00', NULL, NULL, NULL),
	('18d50e4f-d153-4831-ba3d-cba1ea901d35', 'ab07cbf0-d0c3-4859-8e9e-41ed50166812', 'Pregnant ', '2026-04-05', '2026-04-05 05:47:27.875583+00', NULL, NULL, NULL),
	('68a3313e-9dbe-4386-83dc-a5357292e432', 'ab07cbf0-d0c3-4859-8e9e-41ed50166812', 'Left eye is blind', '2026-04-05', '2026-04-05 05:48:40.569592+00', NULL, NULL, NULL),
	('bfced629-6eca-4189-a7b9-4fbfc739ca98', '0e71cf10-5fa6-45e6-9565-07d379301cb8', 'Mooi wit kalf 513', '2026-04-05', '2026-04-05 05:49:29.033098+00', NULL, NULL, NULL),
	('0f005985-233d-4481-ab84-91d4eeeda337', 'd0399960-50a3-44b5-a903-89d1a439b2a6', 'Mooi dragtig', '2026-04-05', '2026-04-05 05:50:00.081081+00', NULL, NULL, NULL),
	('b14abc1b-f5d2-423a-b21e-6a032700772b', 'd0399960-50a3-44b5-a903-89d1a439b2a6', 'Kalf 505', '2026-04-05', '2026-04-05 05:50:49.080932+00', NULL, NULL, NULL),
	('7c63f1f0-9f09-4350-a114-28923aa40b4e', '42550202-d374-45ea-9bcf-cf59dbd49608', 'Kalf 517', '2026-04-05', '2026-04-05 05:53:40.241043+00', NULL, NULL, NULL),
	('4554cff7-89fd-46db-b033-2d13247a9716', 'ab07cbf0-d0c3-4859-8e9e-41ed50166812', 'Kalf518', '2026-04-05', '2026-04-05 05:54:11.681686+00', NULL, NULL, NULL),
	('a3978dc0-1554-4eb9-ada2-b59ad30f8fd6', 'abb301a0-6710-462c-b7d5-c4f8ca194fce', 'Audio Note', '2026-04-05', '2026-04-05 05:56:59.56482+00', 'abb301a0-6710-462c-b7d5-c4f8ca194fce/a3978dc0-1554-4eb9-ada2-b59ad30f8fd6.webm', 151800, 6),
	('be21f4b3-c6d4-4579-afc2-67f531d4c5c3', 'abb301a0-6710-462c-b7d5-c4f8ca194fce', 'Audio Note', '2026-04-05', '2026-04-05 05:56:59.91389+00', 'abb301a0-6710-462c-b7d5-c4f8ca194fce/be21f4b3-c6d4-4579-afc2-67f531d4c5c3.webm', 151800, 6),
	('ec4def62-f449-47e6-80c2-23302f632b71', '0e71cf10-5fa6-45e6-9565-07d379301cb8', 'Need to check the golf number', '2026-04-05', '2026-04-05 05:59:59.673329+00', NULL, NULL, NULL),
	('c8aeb436-3e43-4829-a6c5-964b3fd4b6c4', 'e8100216-7f78-4d5d-bb63-fb2102e8e312', 'Audio Note', '2026-04-05', '2026-04-05 06:10:36.153245+00', 'e8100216-7f78-4d5d-bb63-fb2102e8e312/c8aeb436-3e43-4829-a6c5-964b3fd4b6c4.webm', 191416, 7),
	('6935a8f3-c7c9-4651-9c76-01c3c94d5985', '3f168a84-e998-402f-a2c8-df67b074e9b2', 'Kalf nog nie gemerk nie', '2026-04-05', '2026-04-05 06:12:25.119667+00', NULL, NULL, NULL);


--
-- Data for Name: weight_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('documents', 'documents', NULL, '2026-03-23 17:53:09.226751+00', '2026-03-23 17:53:09.226751+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('audio_notes', 'audio_notes', NULL, '2026-04-02 20:44:53.185409+00', '2026-04-02 20:44:53.185409+00', false, false, 20971520, '{audio/webm,audio/mp4,audio/m4a,audio/mpeg}', NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('c058c72b-c159-4196-aa56-4883ceea3cce', 'audio_notes', '102637f8-a0e7-4a5d-9db7-8f21423d2c68/6bbd8e18-1648-45c7-8af3-409769cff06e.webm', '29a110f7-cdcf-4b5c-a66d-459122911da1', '2026-04-02 20:55:06.681055+00', '2026-04-02 20:55:06.681055+00', '2026-04-02 20:55:06.681055+00', '{"eTag": "\"0164a45bb39c49d5411cef1741161303\"", "size": 227569, "mimetype": "audio/webm", "cacheControl": "max-age=3600", "lastModified": "2026-04-02T20:55:07.000Z", "contentLength": 227569, "httpStatusCode": 200}', 'a55d2ada-2f6f-41a2-88ce-30e4f394f004', '29a110f7-cdcf-4b5c-a66d-459122911da1', '{}'),
	('d380fc0f-d881-4319-a696-0da207a3efc2', 'audio_notes', 'abb301a0-6710-462c-b7d5-c4f8ca194fce/a3978dc0-1554-4eb9-ada2-b59ad30f8fd6.webm', '29a110f7-cdcf-4b5c-a66d-459122911da1', '2026-04-05 05:56:57.951026+00', '2026-04-05 05:56:57.951026+00', '2026-04-05 05:56:57.951026+00', '{"eTag": "\"ebcf17db7be7670c4d5a58b451ec8c46\"", "size": 151800, "mimetype": "audio/webm", "cacheControl": "max-age=3600", "lastModified": "2026-04-05T05:56:58.000Z", "contentLength": 151800, "httpStatusCode": 200}', '375ecc86-6f26-4f47-8d73-d2033f6c3742', '29a110f7-cdcf-4b5c-a66d-459122911da1', '{}'),
	('452adece-fb50-4a2b-a147-9e931c1fb067', 'audio_notes', 'abb301a0-6710-462c-b7d5-c4f8ca194fce/be21f4b3-c6d4-4579-afc2-67f531d4c5c3.webm', '29a110f7-cdcf-4b5c-a66d-459122911da1', '2026-04-05 05:56:58.996504+00', '2026-04-05 05:56:58.996504+00', '2026-04-05 05:56:58.996504+00', '{"eTag": "\"ebcf17db7be7670c4d5a58b451ec8c46\"", "size": 151800, "mimetype": "audio/webm", "cacheControl": "max-age=3600", "lastModified": "2026-04-05T05:56:59.000Z", "contentLength": 151800, "httpStatusCode": 200}', 'c3f1ccea-69dc-4174-a792-02cd6908cfb1', '29a110f7-cdcf-4b5c-a66d-459122911da1', '{}'),
	('a1f4a462-b52c-4add-9347-cdb0c344c367', 'audio_notes', 'e8100216-7f78-4d5d-bb63-fb2102e8e312/c8aeb436-3e43-4829-a6c5-964b3fd4b6c4.webm', '29a110f7-cdcf-4b5c-a66d-459122911da1', '2026-04-05 06:10:34.137038+00', '2026-04-05 06:10:34.137038+00', '2026-04-05 06:10:34.137038+00', '{"eTag": "\"6ed2341b25e125241990b904ebabfccc\"", "size": 191416, "mimetype": "audio/webm", "cacheControl": "max-age=3600", "lastModified": "2026-04-05T06:10:35.000Z", "contentLength": 191416, "httpStatusCode": 200}', '215774ee-3c11-4c9f-9d62-a0f13e8fbce5', '29a110f7-cdcf-4b5c-a66d-459122911da1', '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 98, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict IKEDouv9Nptd6cXTw7X8L3Ipi7Do0Dt3eKbOOmOMLzmUtHaGsGGazuXgZVADRb2

RESET ALL;
