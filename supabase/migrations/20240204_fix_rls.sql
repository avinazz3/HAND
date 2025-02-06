-- First, disable RLS temporarily
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view public groups" ON public.groups;
DROP POLICY IF EXISTS "Enable group creation for authenticated users" ON public.groups;
DROP POLICY IF EXISTS "Enable group reading for all" ON public.groups;
DROP POLICY IF EXISTS "Enable group viewing for members" ON public.groups;
DROP POLICY IF EXISTS "Group admins can delete groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;

-- Create a single policy that allows all operations for service role
CREATE POLICY "Enable all operations for service role" ON public.groups
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
