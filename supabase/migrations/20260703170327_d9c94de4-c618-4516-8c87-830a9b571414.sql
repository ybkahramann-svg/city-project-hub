
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  organization TEXT NOT NULL,
  title TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_requests TO anon, authenticated;
GRANT ALL ON public.contact_requests TO service_role;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_can_insert_contact" ON public.contact_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins_can_read_contact" ON public.contact_requests FOR SELECT TO authenticated USING (public.get_my_role() = 'admin');
