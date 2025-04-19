
import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{message: string} | null>(null);
  const navigate = useNavigate();
  
  // Function to sign in
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Attempting to sign in with email/password:", email);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("Sign in response:", data, signInError);
      
      if (signInError) {
        setError({ message: signInError.message });
        return false;
      }
      
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
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Attempting to sign up with email/password:", email);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
          emailRedirectTo: 'https://auth.biblenow.io/auth/callback'
        },
      });
      
      console.log("Sign up response:", data);
      
      if (signUpError) {
        setError({ message: signUpError.message });
        return false;
      }
      
      toast('Account created', {
        description: 'Please check your email to confirm your account',
      });
      
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
