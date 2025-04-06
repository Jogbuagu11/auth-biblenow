
import { useEffect, useState } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

// Create a Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Cookie domain should be .biblenow.io in production
const cookieDomain = window.location.hostname.includes('biblenow.io') 
  ? '.biblenow.io' 
  : window.location.hostname;

const supabase = createClient(supabaseUrl, supabaseKey, {
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
});

// Function to extract redirectTo from URL
const getRedirectTo = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('redirectTo') || '';
};

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      handleRedirect();
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to sign up
  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      handleRedirect();
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    }
  };
  
  // Listen for auth changes
  useEffect(() => {
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
    signIn,
    signUp,
    signOut,
  };
};

export default useAuth;
