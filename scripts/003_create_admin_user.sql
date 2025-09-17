-- Create a sample admin user for testing
-- Note: In production, this should be done through a secure admin interface

-- First, you need to create the auth user through Supabase Auth
-- This script assumes the auth user already exists

-- Insert sample admin user (replace with actual user ID from auth.users)
-- You'll need to replace 'your-auth-user-id-here' with the actual UUID from auth.users
INSERT INTO public.admin_users (
  id,
  full_name,
  email,
  department_id,
  role,
  is_active
) VALUES (
  -- Replace this UUID with the actual user ID from auth.users after creating the auth user
  '00000000-0000-0000-0000-000000000000',
  'System Administrator',
  'admin@city.gov',
  (SELECT id FROM public.departments WHERE name = 'Public Works' LIMIT 1),
  'admin',
  true
) ON CONFLICT (id) DO NOTHING;

-- Create additional sample admin users for different departments
-- These would also need corresponding auth.users entries

-- Public Works Manager
INSERT INTO public.admin_users (
  id,
  full_name,
  email,
  department_id,
  role,
  is_active
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'John Smith',
  'john.smith@city.gov',
  (SELECT id FROM public.departments WHERE name = 'Public Works' LIMIT 1),
  'manager',
  true
) ON CONFLICT (id) DO NOTHING;

-- Utilities Staff
INSERT INTO public.admin_users (
  id,
  full_name,
  email,
  department_id,
  role,
  is_active
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Sarah Johnson',
  'sarah.johnson@city.gov',
  (SELECT id FROM public.departments WHERE name = 'Utilities' LIMIT 1),
  'staff',
  true
) ON CONFLICT (id) DO NOTHING;

-- Sanitation Manager
INSERT INTO public.admin_users (
  id,
  full_name,
  email,
  department_id,
  role,
  is_active
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Mike Davis',
  'mike.davis@city.gov',
  (SELECT id FROM public.departments WHERE name = 'Sanitation' LIMIT 1),
  'manager',
  true
) ON CONFLICT (id) DO NOTHING;
