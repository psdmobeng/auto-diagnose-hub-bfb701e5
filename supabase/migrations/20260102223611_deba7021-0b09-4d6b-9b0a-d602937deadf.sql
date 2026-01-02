-- Drop the problematic policies
DROP POLICY IF EXISTS "Admin can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can view all user roles" ON public.user_roles;

-- Create a security definer function to check admin role without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Admin can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (
  auth.uid() = user_id OR public.is_admin()
);

CREATE POLICY "Admin can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.is_admin());