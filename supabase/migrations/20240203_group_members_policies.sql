-- Enable Row Level Security
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Policy for inserting into group_members
-- Users can join groups if they are the ones being added
CREATE POLICY "Users can join groups"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
);

-- Policy for viewing group members
-- Users can view members of groups they are part of
CREATE POLICY "Users can view group members"
ON public.group_members
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = group_members.group_id 
        AND gm.user_id = auth.uid()
    )
    OR 
    EXISTS (
        SELECT 1 
        FROM public.groups g 
        WHERE g.id = group_members.group_id 
        AND g.is_private = false
    )
);

-- Policy for deleting group members
-- Users can only remove themselves from groups
CREATE POLICY "Users can leave groups"
ON public.group_members
FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id
);

-- Policy for group admins
-- Group admins can manage all members
CREATE POLICY "Group admins can manage members"
ON public.group_members
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = group_members.group_id 
        AND gm.user_id = auth.uid()
        AND gm.is_admin = true
    )
);
