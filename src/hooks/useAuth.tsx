
import { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Note: In a production environment, these would be environment variables
// For this demo, we're embedding them directly
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

const COOKIE_OPTIONS = {
  domain: '.biblenow.io',
  path: '/',
  sameSite: 'lax' as const,
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist to localStorage
    autoRefreshToken: true,
    storageKey: 'biblenow-auth',
    cookieOptions: COOKIE_OPTIONS,
  }
});

export type AuthError = {
  message: string;
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  
  // Clear any errors when component unmounts
  useEffect(() => {
    return () => setError(null);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to sign in. Please try again.',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to sign up. Please try again.',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err: any) {
      console.error('Error signing out:', err);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to reset password. Please try again.',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    setError,
  };
};
