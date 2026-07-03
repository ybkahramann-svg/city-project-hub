
-- Replace true-based policies with role-based checks
DROP POLICY IF EXISTS "Authenticated can insert gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Authenticated can update gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Authenticated can delete gallery images" ON public.gallery_images;
CREATE POLICY "Editors can insert gallery images" ON public.gallery_images FOR INSERT TO authenticated WITH CHECK (public.get_my_role() IN ('admin','editor'));
CREATE POLICY "Editors can update gallery images" ON public.gallery_images FOR UPDATE TO authenticated USING (public.get_my_role() IN ('admin','editor')) WITH CHECK (public.get_my_role() IN ('admin','editor'));
CREATE POLICY "Editors can delete gallery images" ON public.gallery_images FOR DELETE TO authenticated USING (public.get_my_role() IN ('admin','editor'));

DROP POLICY IF EXISTS "Authenticated can insert project gallery" ON public.project_gallery;
DROP POLICY IF EXISTS "Authenticated can update project gallery" ON public.project_gallery;
DROP POLICY IF EXISTS "Authenticated can delete project gallery" ON public.project_gallery;
CREATE POLICY "Editors can insert project gallery" ON public.project_gallery FOR INSERT TO authenticated WITH CHECK (public.get_my_role() IN ('admin','editor'));
CREATE POLICY "Editors can update project gallery" ON public.project_gallery FOR UPDATE TO authenticated USING (public.get_my_role() IN ('admin','editor')) WITH CHECK (public.get_my_role() IN ('admin','editor'));
CREATE POLICY "Editors can delete project gallery" ON public.project_gallery FOR DELETE TO authenticated USING (public.get_my_role() IN ('admin','editor'));

DROP POLICY IF EXISTS "Authenticated can insert project notes" ON public.project_notes;
DROP POLICY IF EXISTS "Authenticated can delete project notes" ON public.project_notes;
CREATE POLICY "Editors can insert project notes" ON public.project_notes FOR INSERT TO authenticated WITH CHECK (public.get_my_role() IN ('admin','editor'));
CREATE POLICY "Editors can delete project notes" ON public.project_notes FOR DELETE TO authenticated USING (public.get_my_role() IN ('admin','editor'));

-- Storage
DROP POLICY IF EXISTS "Authenticated can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for project images" ON storage.objects;

CREATE POLICY "Editors can upload project images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images' AND public.get_my_role() IN ('admin','editor'));
CREATE POLICY "Editors can update project images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-images' AND public.get_my_role() IN ('admin','editor')) WITH CHECK (bucket_id = 'project-images' AND public.get_my_role() IN ('admin','editor'));
CREATE POLICY "Editors can delete project images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images' AND public.get_my_role() IN ('admin','editor'));

CREATE POLICY "Editors can upload gallery files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.get_my_role() IN ('admin','editor'));
CREATE POLICY "Editors can update gallery files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery' AND public.get_my_role() IN ('admin','editor')) WITH CHECK (bucket_id = 'gallery' AND public.get_my_role() IN ('admin','editor'));
CREATE POLICY "Editors can delete gallery files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.get_my_role() IN ('admin','editor'));
