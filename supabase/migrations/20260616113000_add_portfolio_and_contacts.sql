-- Create portfolio table
CREATE TABLE IF NOT EXISTS public.portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  date TEXT NOT NULL,
  client TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for portfolio
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist, then create
DROP POLICY IF EXISTS "Public can view portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Admins can manage portfolio" ON public.portfolio;

CREATE POLICY "Public can view portfolio" ON public.portfolio 
  FOR SELECT TO anon, authenticated USING (true);
  
CREATE POLICY "Admins can manage portfolio" ON public.portfolio 
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending', -- Pending, In Progress, Resolved
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for contact_submissions
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist, then create
DROP POLICY IF EXISTS "Anyone can submit contact requests" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can manage contact requests" ON public.contact_submissions;

CREATE POLICY "Anyone can submit contact requests" ON public.contact_submissions 
  FOR INSERT TO anon, authenticated WITH CHECK (true);
  
CREATE POLICY "Admins can manage contact requests" ON public.contact_submissions 
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
