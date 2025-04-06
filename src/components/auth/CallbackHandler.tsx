
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const CallbackHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the auth code from the URL
        const code = searchParams.get('code');
        
        if (!code) {
          throw new Error('No code provided in callback URL');
        }
        
        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          throw error;
        }
        
        // Check if there's a redirectTo parameter
        const redirectTo = searchParams.get('redirectTo');
        
        if (redirectTo) {
          window.location.href = decodeURIComponent(redirectTo);
        } else {
          // Navigate to the home page if no redirect is specified
          window.location.href = 'https://social.biblenow.io/create-profile';
        }
      } catch (error: any) {
        console.error('Error handling auth callback:', error.message);
        setError(error.message);
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
            onClick={() => navigate('/login')}
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
