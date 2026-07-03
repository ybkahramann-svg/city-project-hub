
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('belediye', 'bakanlik', 'taseron', 'milletvekili', 'diger')),
  logo_url text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer', 'guest_viewer')),
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.get_my_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  status text NOT NULL DEFAULT 'Planned' CHECK (status IN ('In Progress', 'Completed', 'Planned')),
  budget numeric,
  progress integer,
  image_url text,
  district text,
  neighborhood text,
  department text,
  manager_name text,
  start_date date,
  end_date date,
  impact_stat text,
  latitude double precision,
  longitude double precision,
  is_umbrella boolean DEFAULT false,
  sub_locations jsonb,
  completion_date date,
  planned_date date,
  detailed_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_projects_organization_id ON public.projects(organization_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.share_grants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  granted_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_level text NOT NULL DEFAULT 'view' CHECK (access_level IN ('view')),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_share_grants_granted_user ON public.share_grants(granted_user_id);
CREATE INDEX idx_share_grants_project ON public.share_grants(project_id);
CREATE INDEX idx_share_grants_owner_org ON public.share_grants(owner_org_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.share_grants TO authenticated;
GRANT ALL ON public.share_grants TO service_role;
ALTER TABLE public.share_grants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_active_share(p_project_id uuid, p_owner_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.share_grants sg
    WHERE sg.granted_user_id = auth.uid()
      AND sg.revoked_at IS NULL
      AND (sg.expires_at IS NULL OR sg.expires_at > now())
      AND sg.owner_org_id = p_owner_org_id
      AND (sg.project_id IS NULL OR sg.project_id = p_project_id)
  );
$$;

CREATE POLICY "org_select" ON public.organizations FOR SELECT
  USING (
    id = public.get_my_organization_id()
    OR EXISTS (
      SELECT 1 FROM public.share_grants sg
      WHERE sg.granted_user_id = auth.uid()
        AND sg.owner_org_id = organizations.id
        AND sg.revoked_at IS NULL
        AND (sg.expires_at IS NULL OR sg.expires_at > now())
    )
  );

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (id = auth.uid() OR organization_id = public.get_my_organization_id());

CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR (organization_id = public.get_my_organization_id() AND public.get_my_role() = 'admin'));

CREATE POLICY "profiles_insert_by_admin" ON public.profiles FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id() AND public.get_my_role() = 'admin');

CREATE POLICY "projects_select" ON public.projects FOR SELECT
  USING (
    organization_id = public.get_my_organization_id()
    OR public.has_active_share(id, organization_id)
  );

CREATE POLICY "projects_insert" ON public.projects FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id() AND public.get_my_role() IN ('admin', 'editor'));

CREATE POLICY "projects_update" ON public.projects FOR UPDATE
  USING (organization_id = public.get_my_organization_id() AND public.get_my_role() IN ('admin', 'editor'));

CREATE POLICY "projects_delete" ON public.projects FOR DELETE
  USING (organization_id = public.get_my_organization_id() AND public.get_my_role() = 'admin');

CREATE POLICY "share_grants_select" ON public.share_grants FOR SELECT
  USING (owner_org_id = public.get_my_organization_id() OR granted_user_id = auth.uid());

CREATE POLICY "share_grants_insert" ON public.share_grants FOR INSERT
  WITH CHECK (owner_org_id = public.get_my_organization_id() AND public.get_my_role() = 'admin');

CREATE POLICY "share_grants_update" ON public.share_grants FOR UPDATE
  USING (owner_org_id = public.get_my_organization_id() AND public.get_my_role() = 'admin');
