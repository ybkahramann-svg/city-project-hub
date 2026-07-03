
-- gallery_images: restrict writes to authenticated
DROP POLICY IF EXISTS "Anyone can insert gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Anyone can update gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Anyone can delete gallery images" ON public.gallery_images;
CREATE POLICY "Authenticated can insert gallery images" ON public.gallery_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update gallery images" ON public.gallery_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete gallery images" ON public.gallery_images FOR DELETE TO authenticated USING (true);

-- project_gallery
DROP POLICY IF EXISTS "Anyone can insert gallery images" ON public.project_gallery;
DROP POLICY IF EXISTS "Anyone can update gallery images" ON public.project_gallery;
DROP POLICY IF EXISTS "Anyone can delete gallery images" ON public.project_gallery;
CREATE POLICY "Authenticated can insert project gallery" ON public.project_gallery FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update project gallery" ON public.project_gallery FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete project gallery" ON public.project_gallery FOR DELETE TO authenticated USING (true);

-- project_notes
DROP POLICY IF EXISTS "Anyone can insert project notes" ON public.project_notes;
DROP POLICY IF EXISTS "Anyone can delete project notes" ON public.project_notes;
CREATE POLICY "Authenticated can insert project notes" ON public.project_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete project notes" ON public.project_notes FOR DELETE TO authenticated USING (true);

-- storage.objects: restrict writes to authenticated, drop broad listing of gallery
DROP POLICY IF EXISTS "Anyone can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update project images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete project images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to gallery" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view gallery files" ON storage.objects;

CREATE POLICY "Authenticated can upload project images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images');
CREATE POLICY "Authenticated can update project images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-images') WITH CHECK (bucket_id = 'project-images');
CREATE POLICY "Authenticated can delete project images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated can upload gallery files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Authenticated can update gallery files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery') WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Authenticated can delete gallery files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery');
