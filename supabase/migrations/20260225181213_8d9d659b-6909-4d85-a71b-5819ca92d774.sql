
-- Create gallery_images table
CREATE TABLE public.gallery_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  project_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- RLS policies (public access for now)
CREATE POLICY "Anyone can view gallery images" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Anyone can insert gallery images" ON public.gallery_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete gallery images" ON public.gallery_images FOR DELETE USING (true);
CREATE POLICY "Anyone can update gallery images" ON public.gallery_images FOR UPDATE USING (true);

-- Create gallery storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

-- Storage RLS policies
CREATE POLICY "Anyone can upload to gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Anyone can view gallery files" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Anyone can delete gallery files" ON storage.objects FOR DELETE USING (bucket_id = 'gallery');
