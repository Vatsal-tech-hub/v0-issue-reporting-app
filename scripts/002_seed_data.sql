-- Insert default departments
INSERT INTO public.departments (name, description, contact_email, contact_phone) VALUES
  ('Public Works', 'Handles road maintenance, potholes, and infrastructure', 'publicworks@city.gov', '555-0101'),
  ('Utilities', 'Manages streetlights, water, and electrical systems', 'utilities@city.gov', '555-0102'),
  ('Sanitation', 'Waste management and street cleaning services', 'sanitation@city.gov', '555-0103'),
  ('Transportation', 'Traffic signals, signs, and road safety', 'transportation@city.gov', '555-0104'),
  ('Parks & Recreation', 'Park maintenance and recreational facilities', 'parks@city.gov', '555-0105'),
  ('Code Enforcement', 'Building codes, zoning, and property violations', 'codeenforcement@city.gov', '555-0106')
ON CONFLICT (name) DO NOTHING;

-- Insert sample issues for demonstration
INSERT INTO public.issues (
  title, 
  description, 
  category, 
  status, 
  priority, 
  location_address, 
  latitude, 
  longitude, 
  citizen_name, 
  citizen_email,
  assigned_department
) VALUES
  (
    'Large pothole on Main Street',
    'There is a significant pothole near the intersection of Main Street and Oak Avenue that is causing damage to vehicles. It has been growing larger over the past few weeks.',
    'pothole',
    'submitted',
    'high',
    '123 Main Street, Downtown',
    40.7128,
    -74.0060,
    'John Smith',
    'john.smith@email.com',
    'Public Works'
  ),
  (
    'Broken streetlight on Elm Street',
    'The streetlight at 456 Elm Street has been out for over a week, making the area unsafe for pedestrians at night.',
    'streetlight',
    'in_progress',
    'medium',
    '456 Elm Street, Residential District',
    40.7589,
    -73.9851,
    'Sarah Johnson',
    'sarah.j@email.com',
    'Utilities'
  ),
  (
    'Overflowing trash bins in Central Park',
    'Multiple trash bins in Central Park are overflowing, attracting pests and creating an unsanitary environment.',
    'sanitation',
    'submitted',
    'medium',
    'Central Park, Recreation Area',
    40.7829,
    -73.9654,
    'Mike Davis',
    'mike.davis@email.com',
    'Sanitation'
  ),
  (
    'Malfunctioning traffic light',
    'The traffic light at the intersection of Broadway and 5th Street is stuck on red in all directions, causing traffic delays.',
    'traffic',
    'submitted',
    'urgent',
    'Broadway & 5th Street Intersection',
    40.7505,
    -73.9934,
    'Lisa Chen',
    'lisa.chen@email.com',
    'Transportation'
  );
