-- Create missing profile for the current user with admin role
INSERT INTO public.profiles (user_id, username, full_name, role)
VALUES (
  'd39b2906-b5ed-4829-8b6f-83fd6e02cdfe',
  'nisarg',
  'Nisarg Bhatt',
  'admin'
) ON CONFLICT (user_id) DO UPDATE SET role = 'admin';