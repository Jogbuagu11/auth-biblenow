import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CallbackHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session after the OAuth callback
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!data.session) {
          throw new Error('No session found after authentication');
        }

        // Get redirect parameters from URL
        const redirectTo = searchParams.get('redirectTo');
        const next = searchParams.get('next');
        const returnTo = searchParams.get('returnTo');
        
        // Determine the redirect URL with priority order
        let finalRedirectUrl = null;
        
        if (redirectTo) {
          finalRedirectUrl = decodeURIComponent(redirectTo);
        } else if (next) {
          finalRedirectUrl = decodeURIComponent(next);
        } else if (returnTo) {
          finalRedirectUrl = decodeURIComponent(returnTo);
        }

        // Check if 2FA has been enabled or skipped in user metadata
        const twoFaEnabled = data.session.user.user_metadata?.twofa_enabled;
        const twoFaSkipped = data.session.user.user_metadata?.twofa_skipped;
        
        // If the user hasn't set up or skipped 2FA, redirect to the 2FA prompt
        if (!twoFaEnabled && !twoFaSkipped) {
          navigate('/auth/two-factor-prompt');
          return;
        }

        // If we have a specific redirect URL, use it
        if (finalRedirectUrl) {
          console.log("Redirecting to:", finalRedirectUrl);
          window.location.href = finalRedirectUrl;
          return;
        }

        // Default fallback - redirect to email confirmed page
        console.log("No specific redirect, going to email confirmed page");
        window.location.href = `${window.location.origin}/email-confirmed`;
        
      } catch (error: any) {
        console.error('Error handling auth callback:', error.message);
        setError(error.message);
        toast.error('Authentication error', {
          description: error.message
        });
      }
    };
    
    handleCallback();
  }, [searchParams, navigate]);
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-biblenow-brown">
        <div className="auth-card w-full max-w-md p-6">
          <h1 className="text-2xl font-serif font-semibold text-biblenow-beige mb-4">Authentication Error</h1>
          <p className="text-biblenow-beige/60 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="auth-btn-primary w-full"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-biblenow-brown">
      <div className="auth-card w-full max-w-md p-6 flex flex-col items-center">
        <h1 className="text-2xl font-serif font-semibold text-biblenow-beige mb-4">Completing Sign In</h1>
        <div className="w-16 h-16 border-4 border-biblenow-gold/30 border-t-biblenow-gold rounded-full animate-spin my-8"></div>
        <p className="text-biblenow-beige/60">Please wait while we complete your sign in...</p>
      </div>
    </div>
  );
};

export default CallbackHandler;
