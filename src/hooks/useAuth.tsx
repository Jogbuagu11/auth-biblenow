
import { useEffect, useState } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are available
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Cookie domain should be .biblenow.io in production
const cookieDomain = window.location.hostname.includes('biblenow.io') 
  ? '.biblenow.io' 
  : window.location.hostname;

// Only create the client if we have the required values
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        // Important: For cookie-based auth, we need to set storage to 'cookie'
        storage: {
          getItem: (key) => document.cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`)?.pop() || '',
          setItem: (key, value) => {
            document.cookie = `${key}=${value}; domain=${cookieDomain}; path=/; max-age=2592000; SameSite=Lax; secure`;
          },
          removeItem: (key) => {
            document.cookie = `${key}=; domain=${cookieDomain}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; secure`;
          },
        },
        detectSessionInUrl: true,
      }
    })
  : null;

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
    
    if (!supabase) {
      setError({ message: 'Supabase client is not initialized. Check your environment variables.' });
      setLoading(false);
      return false;
    }
    
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
    
    if (!supabase) {
      setError({ message: 'Supabase client is not initialized. Check your environment variables.' });
      setLoading(false);
      return false;
    }
    
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) {
        setError({ message: signUpError.message });
        return false;
      }
      
      toast({
        title: 'Account created',
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
    if (!supabase) {
      setError({ message: 'Supabase client is not initialized. Check your environment variables.' });
      return;
    }
    
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
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );
    
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
