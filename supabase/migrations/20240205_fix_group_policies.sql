-- First, disable RLS temporarily
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable all operations for service role" ON public.groups;
DROP POLICY IF EXISTS "Anyone can view public groups" ON public.groups;
DROP POLICY IF EXISTS "Enable group creation for authenticated users" ON public.groups;
DROP POLICY IF EXISTS "Enable group reading for all" ON public.groups;
DROP POLICY IF EXISTS "Enable group viewing for members" ON public.groups;
DROP POLICY IF EXISTS "Group admins can delete groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;

-- Create policies for service role
CREATE POLICY "Service role can do everything" ON public.groups
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can create groups" ON public.groups
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can view their own groups" ON public.groups
    FOR SELECT
    TO authenticated
    USING (
        auth.uid()::uuid IN (
            SELECT user_id 
            FROM group_members 
            WHERE group_id = id
        )
        OR
        created_by = auth.uid()
        OR
        NOT is_private
    );

CREATE POLICY "Group admins can update their groups" ON public.groups
    FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group admins can delete their groups" ON public.groups
    FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- Re-enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
