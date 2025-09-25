-- Fix critical security vulnerabilities with proper role-based access control

-- First, drop the overly broad policies that allow all authenticated users access
DROP POLICY IF EXISTS "Authenticated users can manage sales records" ON public.sales_records;
DROP POLICY IF EXISTS "Authenticated users can view sales records" ON public.sales_records;
DROP POLICY IF EXISTS "Authenticated users can manage deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Authenticated users can view deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;

-- Update the get_current_user_role function to be more secure
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create role-based policies for sales_records table
-- Only admin and sales staff can access sales records
CREATE POLICY "Admin and sales staff can view sales records" 
ON public.sales_records 
FOR SELECT 
USING (
  public.get_current_user_role() IN ('admin', 'sales_staff')
);

CREATE POLICY "Admin and sales staff can insert sales records" 
ON public.sales_records 
FOR INSERT 
WITH CHECK (
  public.get_current_user_role() IN ('admin', 'sales_staff')
);

CREATE POLICY "Admin and sales staff can update sales records" 
ON public.sales_records 
FOR UPDATE 
USING (
  public.get_current_user_role() IN ('admin', 'sales_staff')
);

CREATE POLICY "Admin can delete sales records" 
ON public.sales_records 
FOR DELETE 
USING (
  public.get_current_user_role() = 'admin'
);

-- Create role-based policies for deliveries table
-- Only admin and logistics staff can manage deliveries
CREATE POLICY "Admin and logistics staff can view deliveries" 
ON public.deliveries 
FOR SELECT 
USING (
  public.get_current_user_role() IN ('admin', 'logistics_staff')
);

CREATE POLICY "Admin and logistics staff can insert deliveries" 
ON public.deliveries 
FOR INSERT 
WITH CHECK (
  public.get_current_user_role() IN ('admin', 'logistics_staff')
);

CREATE POLICY "Admin and logistics staff can update deliveries" 
ON public.deliveries 
FOR UPDATE 
USING (
  public.get_current_user_role() IN ('admin', 'logistics_staff')
);

CREATE POLICY "Admin can delete deliveries" 
ON public.deliveries 
FOR DELETE 
USING (
  public.get_current_user_role() = 'admin'
);

-- Create role-based policies for products table
-- Sales staff can view and update stock, but only admin can add/delete products
CREATE POLICY "Authenticated users can view products" 
ON public.products 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
);

CREATE POLICY "Admin and sales staff can update products" 
ON public.products 
FOR UPDATE 
USING (
  public.get_current_user_role() IN ('admin', 'sales_staff')
);

CREATE POLICY "Admin can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "Admin can delete products" 
ON public.products 
FOR DELETE 
USING (
  public.get_current_user_role() = 'admin'
);

-- Create a function to handle new user profiles with default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    'staff' -- Default role is 'staff', admin must manually promote users
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create profiles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix function search path for existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;