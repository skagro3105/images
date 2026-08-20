-- ==============================================================================
-- SK AGRO CHEMICAL - Product Asset Management (PAM)
-- Production PostgreSQL Database Schema & Storage Setup for Supabase
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100) DEFAULT 'Sprout',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

-- Seed Categories
INSERT INTO public.categories (name, slug, description, icon)
VALUES 
    ('Insecticides', 'insecticides', 'Fast-acting pest elimination formulations', 'Bug'),
    ('Fungicides', 'fungicides', 'Broad-spectrum crop disease protection', 'ShieldCheck'),
    ('Herbicides', 'herbicides', 'Selective & Non-selective weed control solutions', 'Sprout'),
    ('PGR', 'pgr', 'Plant Growth Regulators & Biostimulants', 'Sparkles'),
    ('Fertilizers', 'fertilizers', 'Essential crop nutrition & growth stimulants', 'Zap'),
    ('Micronutrients', 'micronutrients', 'Chelated trace elements for soil health', 'Sun')
ON CONFLICT (slug) DO NOTHING;

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    product_code VARCHAR(100) NOT NULL UNIQUE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name VARCHAR(255),
    active_ingredient TEXT,
    formulation VARCHAR(255),
    description TEXT,
    main_image_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    packing_sizes TEXT[] DEFAULT ARRAY['100ml', '250ml', '500ml', '1L'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

-- 4. Assets Table (Media & Documents)
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_name VARCHAR(255),
    asset_type VARCHAR(100) NOT NULL, -- 'Packing', 'Label', 'Material', 'Creative', 'Video', 'Document'
    name VARCHAR(255) NOT NULL,
    packing_size VARCHAR(100) DEFAULT '500ml',
    file_name VARCHAR(255),
    file_url TEXT NOT NULL,
    preview_url TEXT,
    file_type VARCHAR(100),
    file_size VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

-- 5. Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) DEFAULT 'admin@skagro.com',
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

-- 6. Enable Row Level Security (RLS) & Public Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow Public Access for Categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow Public Access for Products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow Public Access for Assets" ON public.assets FOR ALL USING (true);
CREATE POLICY "Allow Public Access for Favorites" ON public.favorites FOR ALL USING (true);

-- 7. Supabase Storage Bucket Setup Script (Run in Supabase Dashboard > Storage)
-- Bucket Name: sk-agro-assets (Public Bucket)
INSERT INTO storage.buckets (id, name, public) VALUES ('sk-agro-assets', 'sk-agro-assets', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public Storage Policy" ON storage.objects FOR ALL USING (bucket_id = 'sk-agro-assets');
