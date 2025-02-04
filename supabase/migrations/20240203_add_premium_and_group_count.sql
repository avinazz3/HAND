-- Add premium user flag and group count to users table
ALTER TABLE public.users 
ADD COLUMN is_premium boolean NOT NULL DEFAULT false,
ADD COLUMN groups_created integer NOT NULL DEFAULT 0;

-- Update the handle_new_group_member function to track group creation
CREATE OR REPLACE FUNCTION public.handle_new_group_member()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is the first member of the group, make them an admin and increment their group count
    IF NOT EXISTS (
        SELECT 1 
        FROM public.group_members 
        WHERE group_id = NEW.group_id
    ) THEN
        -- Update the user's groups_created count
        UPDATE public.users 
        SET groups_created = groups_created + 1
        WHERE id = NEW.user_id;
        
        NEW.is_admin := true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
