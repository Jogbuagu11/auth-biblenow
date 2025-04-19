// File: src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      const { data } = await supabase.auth.getSession();
      const redirectTo = new URLSearchParams(window.location.search).get('redirectTo');

      if (data.session) {
        window.location.href = redirectTo || 'https://social.biblenow.io/edit-testimony';
      } else {
        navigate('/auth'); // fallback if session fails
      }
    };

    handleRedirect();
  }, [navigate]);

  return <p className="text-center mt-10 text-biblebrown-800">Logging you in...</p>;
};

export default AuthCallback;
