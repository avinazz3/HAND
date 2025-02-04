-- Add is_admin column to group_members
ALTER TABLE public.group_members 
ADD COLUMN is_admin boolean NOT NULL DEFAULT false;

-- Make group creator an admin when creating a group
CREATE OR REPLACE FUNCTION public.handle_new_group_member()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is the first member of the group, make them an admin
    IF NOT EXISTS (
        SELECT 1 
        FROM public.group_members 
        WHERE group_id = NEW.group_id
    ) THEN
        NEW.is_admin := true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle new group members
CREATE TRIGGER on_group_member_created
    BEFORE INSERT ON public.group_members
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_group_member();
