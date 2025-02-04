-- Update users table to handle premium subscription
ALTER TABLE public.users 
DROP COLUMN is_premium,
ADD COLUMN premium_expires_at timestamp with time zone,
ADD COLUMN auto_renew_premium boolean NOT NULL DEFAULT false;

-- Function to check if a user is currently premium
CREATE OR REPLACE FUNCTION public.is_user_premium(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.users 
        WHERE id = user_id 
        AND premium_expires_at > CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_group_member function to enforce group limits
CREATE OR REPLACE FUNCTION public.handle_new_group_member()
RETURNS TRIGGER AS $$
DECLARE
    current_group_count integer;
    is_premium boolean;
BEGIN
    -- If this is the first member of the group (creator)
    IF NOT EXISTS (
        SELECT 1 
        FROM public.group_members 
        WHERE group_id = NEW.group_id
    ) THEN
        -- Get current group count and premium status
        SELECT 
            groups_created,
            premium_expires_at > CURRENT_TIMESTAMP
        INTO 
            current_group_count,
            is_premium
        FROM public.users 
        WHERE id = NEW.user_id;

        -- Non-premium users can only create 1 group
        IF NOT is_premium AND current_group_count >= 1 THEN
            RAISE EXCEPTION 'Free users can only create 1 group. Upgrade to premium for unlimited groups!';
        END IF;

        -- Update the user's groups_created count
        UPDATE public.users 
        SET groups_created = groups_created + 1
        WHERE id = NEW.user_id;
        
        NEW.is_admin := true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle premium expiration
CREATE OR REPLACE FUNCTION public.handle_premium_expiration()
RETURNS void AS $$
BEGIN
    -- Auto-renew premium for users who have opted in
    UPDATE public.users
    SET premium_expires_at = premium_expires_at + INTERVAL '1 month'
    WHERE 
        auto_renew_premium = true 
        AND premium_expires_at <= CURRENT_TIMESTAMP + INTERVAL '1 day'
        AND premium_expires_at > CURRENT_TIMESTAMP - INTERVAL '1 month';
        
    -- TODO: Implement payment processing for auto-renewal
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
