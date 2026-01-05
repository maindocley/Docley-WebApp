INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE
SET public = false;

DROP POLICY IF EXISTS "Authenticated Read Documents" ON storage.objects;
CREATE POLICY "Authenticated Read Documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Authenticated Upload Documents" ON storage.objects;
CREATE POLICY "Authenticated Upload Documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "Owner Manage Documents" ON storage.objects;
CREATE POLICY "Owner Manage Documents"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'documents' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'documents' AND auth.uid() = owner);
