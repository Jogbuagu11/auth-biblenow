
import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Function to extract redirectTo from URL
const getRedirectTo = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('redirectTo') || '';
};

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{message: string} | null>(null);
  const navigate = useNavigate();
  
  // Handle redirect after login/signup
  const handleRedirect = () => {
    const redirectTo = getRedirectTo();
    if (redirectTo) {
      // If it's a relative URL or a biblenow.io subdomain, redirect
      if (redirectTo.startsWith('/') || 
          redirectTo.includes('.biblenow.io') || 
          redirectTo === 'biblenow.io') {
        window.location.href = decodeURIComponent(redirectTo);
      }
    }
  };
  
  // Function to sign in
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        setError({ message: signInError.message });
        return false;
      }
      
      handleRedirect();
      return true;
    } catch (err: any) {
      console.error('Error signing in:', err.message);
      setError({ message: err.message || 'An error occurred during sign in' });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to sign up
  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) {
        setError({ message: signUpError.message });
        return false;
      }
      
      console.log("Sign up response:", data);
      
      // Fixed this line: use the toast function correctly
      toast('Account created', {
        description: 'Please check your email to confirm your account',
      });
      
      handleRedirect();
      return true;
    } catch (err: any) {
      console.error('Error signing up:', err.message);
      setError({ message: err.message || 'An error occurred during sign up' });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err: any) {
      console.error('Error signing out:', err.message);
      setError({ message: err.message || 'An error occurred during sign out' });
    }
  };
  
  // Listen for auth changes
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        console.log("Auth state changed, new session:", newSession);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Current session on init:", currentSession);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return {
    session,
    user,
    loading,
    error,
    setError,
    signIn,
    signUp,
    signOut,
  };
};

export default useAuth;
