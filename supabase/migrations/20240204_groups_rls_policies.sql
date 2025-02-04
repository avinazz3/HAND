-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Policy for creating groups
CREATE POLICY "Users can create groups"
ON public.groups
FOR INSERT
TO authenticated
WITH CHECK (
    -- Check is handled by the handle_new_group_member trigger
    -- which verifies premium status and group limits
    true
);

-- Policy for viewing groups
CREATE POLICY "Users can view groups they are members of"
ON public.groups
FOR SELECT
TO authenticated
USING (
    -- Users can view groups if:
    -- 1. They are a member of the group
    -- 2. The group is public
    EXISTS (
        SELECT 1 
        FROM public.group_members 
        WHERE group_id = id 
        AND user_id = auth.uid()
    )
    OR
    NOT is_private
);

-- Policy for updating groups
CREATE POLICY "Group admins can update groups"
ON public.groups
FOR UPDATE
TO authenticated
USING (
    -- Only group admins can update group details
    EXISTS (
        SELECT 1 
        FROM public.group_members 
        WHERE group_id = id 
        AND user_id = auth.uid()
        AND is_admin = true
    )
);

-- Policy for deleting groups
CREATE POLICY "Group admins can delete groups"
ON public.groups
FOR DELETE
TO authenticated
USING (
    -- Only group admins can delete groups
    EXISTS (
        SELECT 1 
        FROM public.group_members 
        WHERE group_id = id 
        AND user_id = auth.uid()
        AND is_admin = true
    )
);

-- Function to generate join codes
CREATE OR REPLACE FUNCTION public.set_join_code_trigger()
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate an 8-character random code using uppercase letters and numbers
        new_code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Check if this code already exists
        SELECT EXISTS (
            SELECT 1 
            FROM public.groups 
            WHERE join_code = new_code
        ) INTO code_exists;
        
        -- If code doesn't exist, use it
        IF NOT code_exists THEN
            NEW.join_code := new_code;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
