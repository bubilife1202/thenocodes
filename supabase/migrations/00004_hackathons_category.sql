-- Add category column to distinguish hackathons from contests
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'hackathon';

CREATE INDEX IF NOT EXISTS idx_hackathons_category ON public.hackathons(category);
