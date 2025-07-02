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
        // Check if 2FA has been enabled or skipped
        const twoFaEnabled = data.session.user?.user_metadata?.twofa_enabled;
        const twoFaSkipped = data.session.user?.user_metadata?.twofa_skipped;
        
        // If 2FA hasn't been set up or skipped, redirect to 2FA prompt
        if (!twoFaEnabled && !twoFaSkipped) {
          navigate('/auth/two-factor-prompt');
          return;
        }
        
        // Otherwise, proceed with normal redirect
        window.location.href = redirectTo || `${window.location.origin}/email-confirmed`;
      } else {
        navigate('/auth'); // fallback if session fails
      }
    };

    handleRedirect();
  }, [navigate]);

  return <p className="text-center mt-10 text-biblebrown-800">Logging you in...</p>;
};

export default AuthCallback;
