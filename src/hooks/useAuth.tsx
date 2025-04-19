import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

<<<<<<< HEAD
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
=======
interface AuthError {
  message: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

>>>>>>> 4e08369 (Refactor auth flow: removed useAuth from SignInForm, added ResetPasswordModal, cleaned up signup/login components)
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession();

        if (error) {
          setError({ message: error.message });
        } else {
          setSession(session);
          setUser(session?.user || null);
        }
      } catch (err: any) {
        setError({ message: err.message || 'Unexpected error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    error,
    setError,
  };
};