
-- Create a function that allows looking up a user's email by ID
-- This is called from the client to retrieve the email for authentication
CREATE OR REPLACE FUNCTION public.get_user_email_by_id(user_id uuid)
RETURNS TABLE (email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT au.email
  FROM auth.users au
  WHERE au.id = user_id;
END;
$$;

-- Grant access to the authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_email_by_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_email_by_id(uuid) TO anon;
