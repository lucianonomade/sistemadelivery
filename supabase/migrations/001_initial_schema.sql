-- CimentoTrack Database Schema
-- Run this migration in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'atendente' CHECK (role IN ('admin', 'atendente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tracking_code TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  cement_type TEXT,
  quantity NUMERIC,
  origin_address TEXT,
  destination_address TEXT NOT NULL,
  destination_lat NUMERIC,
  destination_lng NUMERIC,
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  driver_name TEXT,
  driver_phone TEXT,
  vehicle_plate TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracking updates table
CREATE TABLE IF NOT EXISTS tracking_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  status TEXT CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking_code ON deliveries(tracking_code);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_customer_id ON deliveries(customer_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON deliveries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_updates_delivery_id ON tracking_updates(delivery_id);
CREATE INDEX IF NOT EXISTS idx_tracking_updates_created_at ON tracking_updates(created_at DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_updates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Customers policies (authenticated users can manage)
CREATE POLICY "Authenticated users can view customers" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert customers" ON customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update customers" ON customers
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Deliveries policies
CREATE POLICY "Authenticated users can view all deliveries" ON deliveries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view deliveries by tracking code" ON deliveries
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert deliveries" ON deliveries
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update deliveries" ON deliveries
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete deliveries" ON deliveries
  FOR DELETE USING (auth.role() = 'authenticated');

-- Tracking updates policies
CREATE POLICY "Authenticated users can view all tracking updates" ON tracking_updates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view tracking updates for their delivery" ON tracking_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deliveries 
      WHERE deliveries.id = tracking_updates.delivery_id
    )
  );

CREATE POLICY "Authenticated users can insert tracking updates" ON tracking_updates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update tracking updates" ON tracking_updates
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on deliveries
CREATE TRIGGER update_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
