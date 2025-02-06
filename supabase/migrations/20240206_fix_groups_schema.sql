-- First, drop all policies that depend on created_by
DROP POLICY IF EXISTS "Users can view their own groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can delete their groups" ON public.groups;
DROP POLICY IF EXISTS "Service role can do everything" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;

-- Add new column for Firebase UID if it doesn't exist
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS firebase_uid text;

-- Update existing groups to copy created_by to firebase_uid if needed
UPDATE public.groups g
SET firebase_uid = u.firebase_uid
FROM public.users u
WHERE g.created_by = u.id::uuid
AND g.firebase_uid IS NULL;

-- Create service role policy first (highest priority)
CREATE POLICY "Service role can do everything" ON public.groups
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy for group creation
CREATE POLICY "Authenticated users can create groups" ON public.groups
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Recreate the policies using firebase_uid
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
        firebase_uid = auth.uid()::text
        OR
        NOT is_private
    );

CREATE POLICY "Group admins can update their groups" ON public.groups
    FOR UPDATE
    TO authenticated
    USING (firebase_uid = auth.uid()::text)
    WITH CHECK (firebase_uid = auth.uid()::text);

CREATE POLICY "Group admins can delete their groups" ON public.groups
    FOR DELETE
    TO authenticated
    USING (firebase_uid = auth.uid()::text);

-- Make sure RLS is enabled
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
