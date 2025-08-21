-- Create a security definer function to get current user role
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing overly permissive policies on customers table
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;

-- Create role-based RLS policies for customers table
-- Only admin users can view customer data
CREATE POLICY "Admin users can view customers" 
ON public.customers 
FOR SELECT 
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Only admin users can insert customer data
CREATE POLICY "Admin users can insert customers" 
ON public.customers 
FOR INSERT 
TO authenticated
WITH CHECK (public.get_current_user_role() = 'admin');

-- Only admin users can update customer data
CREATE POLICY "Admin users can update customers" 
ON public.customers 
FOR UPDATE 
TO authenticated
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- Only admin users can delete customer data
CREATE POLICY "Admin users can delete customers" 
ON public.customers 
FOR DELETE 
TO authenticated
USING (public.get_current_user_role() = 'admin');