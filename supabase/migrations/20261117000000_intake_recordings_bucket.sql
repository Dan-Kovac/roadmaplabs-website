-- Private bucket for /intake screen recordings.
-- /api/intake-recording also creates it on first use when SUPABASE_SERVICE_ROLE_KEY is set; this is the manual equivalent.
-- No storage policies are added on purpose: only the service role (server side) can create upload URLs and read links.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('intake-recordings', 'intake-recordings', false, 52428800, array['video/webm', 'video/mp4'])
on conflict (id) do nothing;
