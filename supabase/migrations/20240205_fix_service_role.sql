-- First, drop all existing policies
DROP POLICY IF EXISTS "ALL" ON public.groups;
DROP POLICY IF EXISTS "Enable delete for group admins" ON public.groups;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.groups;
DROP POLICY IF EXISTS "Enable read access for users" ON public.groups;
DROP POLICY IF EXISTS "Enable update for group admins" ON public.groups;

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Create a policy for service role to bypass RLS
CREATE POLICY "service_role_bypass" ON public.groups
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy for authenticated users to insert
CREATE POLICY "Enable insert for authenticated users" ON public.groups
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy for reading groups
CREATE POLICY "Enable read access for users" ON public.groups
    FOR SELECT
    TO authenticated
    USING (
        NOT is_private 
        OR EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = id
            AND group_members.user_id = auth.uid()
        )
    );

-- Create policy for group admins to update
CREATE POLICY "Enable update for group admins" ON public.groups
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = id
            AND group_members.user_id = auth.uid()
            AND group_members.is_admin = true
        )
    );

-- Create policy for group admins to delete
CREATE POLICY "Enable delete for group admins" ON public.groups
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = id
            AND group_members.user_id = auth.uid()
            AND group_members.is_admin = true
        )
    );
