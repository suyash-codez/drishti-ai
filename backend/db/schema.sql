-- ==============================================================================
-- DRISHTI: Supabase Postgres Schema for `farm_sessions`
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table: farm_sessions (PRD Section 6 Schema)
CREATE TABLE IF NOT EXISTS public.farm_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_type TEXT NOT NULL,
    soil_moisture FLOAT NOT NULL,
    temperature FLOAT NOT NULL,
    rainfall FLOAT NOT NULL,
    language TEXT NOT NULL DEFAULT 'hi',
    irrigation_recommendation TEXT NOT NULL,
    fertilizer_recommendation TEXT NOT NULL,
    explanation TEXT NOT NULL,
    alert_level TEXT NOT NULL,
    water_saved_liters FLOAT NOT NULL DEFAULT 0.0,
    cost_saved_rupees FLOAT NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.farm_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous / public insert from API
CREATE POLICY "Allow public insert to farm_sessions"
    ON public.farm_sessions
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow reading farm sessions
CREATE POLICY "Allow public read of farm_sessions"
    ON public.farm_sessions
    FOR SELECT
    USING (true);

-- Create an index on created_at for fast analytics queries
CREATE INDEX IF NOT EXISTS idx_farm_sessions_created_at ON public.farm_sessions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farm_sessions_crop_type ON public.farm_sessions (crop_type);
