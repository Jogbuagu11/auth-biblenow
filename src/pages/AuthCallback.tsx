// File: src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Check if this is an email confirmation link
        const type = searchParams.get('type');
        
        // If this is specifically an email confirmation, redirect to email-confirmed
        if (type === 'email_confirmation') {
          // Redirect to the full URL as required
          window.location.href = 'https://auth.biblenow.io/email-confirmed';
          return;
        }
        
        // Check if this is a password reset
        if (type === 'recovery') {
          navigate('/password-update');
          return;
        }
        
        // Otherwise, proceed with normal auth flow
        const { data } = await supabase.auth.getSession();
        const redirectTo = searchParams.get('redirectTo');

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
          window.location.href = redirectTo || 'https://social.biblenow.io/edit-testimony';
        } else {
          navigate('/login'); // fallback if session fails
        }
      } catch (error) {
        console.error("Error handling auth callback:", error);
        navigate('/login');
      }
    };

    handleRedirect();
  }, [navigate, searchParams]);

  return <p className="text-center mt-10 text-biblebrown-800">Loading...</p>;
};

export default AuthCallback;
