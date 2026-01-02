-- Create table for tracking popular searches
CREATE TABLE public.search_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_query TEXT NOT NULL,
  translated_keywords TEXT[] DEFAULT '{}',
  search_count INTEGER DEFAULT 1,
  has_results BOOLEAN DEFAULT false,
  last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint on original_query for upsert
CREATE UNIQUE INDEX idx_search_queries_original ON public.search_queries(lower(original_query));

-- Enable RLS
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- Anyone can view popular searches (for suggestions)
CREATE POLICY "Anyone can view search queries"
ON public.search_queries
FOR SELECT
USING (true);

-- Technicians can insert/update search queries
CREATE POLICY "Technicians can insert search queries"
ON public.search_queries
FOR INSERT
WITH CHECK (is_technician());

CREATE POLICY "Technicians can update search queries"
ON public.search_queries
FOR UPDATE
USING (is_technician());

-- Technicians can delete search queries
CREATE POLICY "Technicians can delete search queries"
ON public.search_queries
FOR DELETE
USING (is_technician());