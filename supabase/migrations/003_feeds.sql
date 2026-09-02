-- Create feeds table
CREATE TABLE feeds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  caption text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create feed_images table
CREATE TABLE feed_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_id uuid REFERENCES feeds(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS policies
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public profiles are viewable by everyone" ON feeds FOR SELECT USING (true);
CREATE POLICY "Public feed images are viewable by everyone" ON feed_images FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Authenticated users can insert feeds" ON feeds FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Authenticated users can update feeds" ON feeds FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Authenticated users can delete feeds" ON feeds FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Authenticated users can insert feed images" ON feed_images FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Authenticated users can update feed images" ON feed_images FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Authenticated users can delete feed images" ON feed_images FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
