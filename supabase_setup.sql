-- =============================================
-- DRISHTI KISAN APP — Database Setup
-- Supabase SQL Editor mein paste karke RUN karo
-- =============================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'किसान भाई',
  email TEXT,
  phone TEXT,
  village_district TEXT DEFAULT 'इंदौर, म.प्र.',
  state TEXT DEFAULT 'मध्य प्रदेश',
  language TEXT DEFAULT 'hi',
  land_size_acres DECIMAL DEFAULT 2.5,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FARMER FIELDS TABLE
CREATE TABLE IF NOT EXISTS farmer_fields (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  crop_key TEXT NOT NULL,
  crop_name TEXT,
  area_acres DECIMAL DEFAULT 1.0,
  soil_type TEXT DEFAULT 'काली दोमट',
  sowing_date TEXT,
  status TEXT DEFAULT 'healthy',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ADVISORY HISTORY TABLE
CREATE TABLE IF NOT EXISTS advisory_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  growth_stage TEXT DEFAULT 'general',
  soil_moisture DECIMAL DEFAULT 0,
  temperature DECIMAL DEFAULT 0,
  rainfall DECIMAL DEFAULT 0,
  irrigation_mm DECIMAL DEFAULT 0,
  irrigation_timing TEXT,
  fertilizer_type TEXT,
  fertilizer_amount_kg DECIMAL DEFAULT 0,
  cost_saved_rupees DECIMAL DEFAULT 0,
  water_saved_liters DECIMAL DEFAULT 0,
  alert_level TEXT DEFAULT 'green',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisory_history ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Farmer Fields
CREATE POLICY "Users can view own fields" ON farmer_fields
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fields" ON farmer_fields
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fields" ON farmer_fields
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fields" ON farmer_fields
  FOR DELETE USING (auth.uid() = user_id);

-- Advisory History
CREATE POLICY "Users can view own advisories" ON advisory_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own advisories" ON advisory_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Auto-create profile on signup (supports Email & Google OAuth)
CREATE OR REPLACE FUNCTION public.seed_farmer_demo_data(target_user_id UUID, pref_lang TEXT DEFAULT 'hi')
RETURNS VOID AS $$
BEGIN
  IF pref_lang = 'en' THEN
    -- English Sample Fields
    INSERT INTO public.farmer_fields (user_id, name, crop_key, crop_name, area_acres, soil_type, sowing_date, status)
    VALUES
      (target_user_id, 'North Tube-well Field', 'wheat', 'Wheat (Lokwan)', 2.5, 'Black Clay Soil', '15 Nov 2025', 'healthy'),
      (target_user_id, 'Canal Side Plot', 'soybean', 'Soybean (JS 9560)', 1.5, 'Loamy Soil', '20 Jun 2025', 'needs_water'),
      (target_user_id, 'Orchard Boundary Field', 'maize', 'Maize (Hybrid HQPM-1)', 1.0, 'Sandy Loam', '05 Jul 2025', 'healthy')
    ON CONFLICT DO NOTHING;

    -- English Sample Advisories & Savings
    INSERT INTO public.advisory_history (user_id, crop_type, growth_stage, soil_moisture, temperature, rainfall, irrigation_mm, irrigation_timing, fertilizer_type, fertilizer_amount_kg, cost_saved_rupees, water_saved_liters, alert_level)
    VALUES
      (target_user_id, 'Wheat', 'Crown Root Initiation (CRI)', 28, 26, 0, 25, 'Early Morning (6:00 AM - 9:00 AM)', 'Urea (Nitrogen)', 12.5, 480, 14500, 'green'),
      (target_user_id, 'Soybean', 'Pod Filling Stage', 32, 29, 5, 18, 'Evening (5:00 PM - 7:30 PM)', 'DAP & Potash', 10.0, 650, 18200, 'yellow'),
      (target_user_id, 'Maize', 'Knee-High Vegetative Stage', 24, 31, 0, 22, 'Night / Drip Early Hours', 'NPK 19:19:19', 8.0, 390, 12000, 'green')
    ON CONFLICT DO NOTHING;
  ELSE
    -- Hindi Sample Fields (हिन्दी नमूना खेत)
    INSERT INTO public.farmer_fields (user_id, name, crop_key, crop_name, area_acres, soil_type, sowing_date, status)
    VALUES
      (target_user_id, 'उत्तरी बोरवेल वाला खेत', 'wheat', 'गेहूं (लोकवन - उन्नत)', 2.5, 'काली चिकनी दोमट मिट्टी', '15 नवं 2025', 'healthy'),
      (target_user_id, 'नहर किनारे वाला खेत', 'soybean', 'सोयाबीन (JS 9560)', 1.5, 'मध्यम भारी दोमट मिट्टी', '20 जून 2025', 'needs_water'),
      (target_user_id, 'बगीचे के पास की जमीन', 'maize', 'मक्का (हाइब्रिड HQPM-1)', 1.0, 'बलुई दोमट मिट्टी', '05 जुला 2025', 'healthy')
    ON CONFLICT DO NOTHING;

    -- Hindi Sample Advisories (हिन्दी नमूना सलाह व बचत)
    INSERT INTO public.advisory_history (user_id, crop_type, growth_stage, soil_moisture, temperature, rainfall, irrigation_mm, irrigation_timing, fertilizer_type, fertilizer_amount_kg, cost_saved_rupees, water_saved_liters, alert_level)
    VALUES
      (target_user_id, 'गेहूं', 'ताजमूल अवस्था (CRI स्टेज)', 28, 26, 0, 25, 'प्रातःकाल (6:00 AM - 9:00 AM)', 'यूरिया (नाइट्रोजन)', 12.5, 480, 14500, 'green'),
      (target_user_id, 'सोयाबीन', 'फली भराव अवस्था', 32, 29, 5, 18, 'सायंकाल (5:00 PM - 7:30 PM)', 'डीएपी व पोटाश', 10.0, 650, 18200, 'yellow'),
      (target_user_id, 'मक्का', 'घुटने तक बढ़वार अवस्था', 24, 31, 0, 22, 'सुबह ड्रिप सिंचाई द्वारा', 'NPK 19:19:19', 8.0, 390, 12000, 'green')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  farmer_lang TEXT;
BEGIN
  farmer_lang := COALESCE(NEW.raw_user_meta_data->>'language', 'hi');

  INSERT INTO public.profiles (id, full_name, email, village_district, state, language, land_size_acres, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'किसान भाई'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'village_district', 'इंदौर, म.प्र.'),
    COALESCE(NEW.raw_user_meta_data->>'state', 'मध्य प्रदेश'),
    farmer_lang,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'land_size_acres', '')::decimal, 2.5),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = COALESCE(EXCLUDED.email, profiles.email),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();

  -- Auto-seed 3 demo fields and 3 advisory records in farmer's preferred language
  BEGIN
    PERFORM public.seed_farmer_demo_data(NEW.id, farmer_lang);
  EXCEPTION WHEN OTHERS THEN
    -- Safe fallback: log and proceed without failing user creation
    RAISE NOTICE 'Demo seed skipped: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
