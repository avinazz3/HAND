-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view public groups" ON public.groups;
DROP POLICY IF EXISTS "Enable group creation for authenticated users" ON public.groups;
DROP POLICY IF EXISTS "Enable group reading for all" ON public.groups;
DROP POLICY IF EXISTS "Enable group viewing for members" ON public.groups;
DROP POLICY IF EXISTS "Group admins can delete groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper definitions
-- Policy for creating groups (authenticated users can create)
CREATE POLICY "Enable insert for authenticated users" ON public.groups
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for viewing groups (public groups OR member of private group)
CREATE POLICY "Enable read access for users" ON public.groups
    FOR SELECT
    TO authenticated
    USING (
        NOT is_private 
        OR EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_id = id
            AND user_id = auth.uid()
        )
    );

-- Policy for updating groups (only admins)
CREATE POLICY "Enable update for group admins" ON public.groups
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_id = id
            AND user_id = auth.uid()
            AND is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_id = id
            AND user_id = auth.uid()
            AND is_admin = true
        )
    );

-- Policy for deleting groups (only admins)
CREATE POLICY "Enable delete for group admins" ON public.groups
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_id = id
            AND user_id = auth.uid()
            AND is_admin = true
        )
    );
