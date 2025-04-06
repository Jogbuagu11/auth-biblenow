
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ForgotPasswordModal from './auth/ForgotPasswordModal';

interface SignInFormProps {
  onToggleForm: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { loading, error, signIn, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const redirectTo = new URLSearchParams(location.search).get('redirectTo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError({ message: 'Please enter both email and password' });
      return;
    }
    
    const success = await signIn(email, password);
    
    if (success) {
      toast({
        title: "Success!",
        description: "You've been signed in.",
      });
      
      // If redirectTo parameter exists, redirect there, otherwise go to home
      if (redirectTo) {
        window.location.href = decodeURIComponent(redirectTo);
      } else {
        // Default redirect (e.g., to a dashboard or main biblenow service)
        window.location.href = 'https://read.biblenow.io';
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo 
            ? `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
            : `${window.location.origin}/auth/callback`
        },
      });
      
      if (error) {
        setError({ message: error.message });
      }
    } catch (err: any) {
      console.error('Error signing in with Google:', err.message);
      setError({ message: err.message || 'An error occurred during sign in with Google' });
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectTo 
            ? `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
            : `${window.location.origin}/auth/callback`
        },
      });
      
      if (error) {
        setError({ message: error.message });
      }
    } catch (err: any) {
      console.error('Error signing in with Apple:', err.message);
      setError({ message: err.message || 'An error occurred during sign in with Apple' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-semibold text-biblenow-beige">Sign In</h2>
        <p className="text-biblenow-beige/60 text-sm mt-1">Welcome back to BibleNOW</p>
      </div>
      
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-2 rounded-md text-sm">
          {error.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-biblenow-beige mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-biblenow-beige/40" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input pl-10"
              placeholder="you@example.com"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-biblenow-beige mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-biblenow-beige/40" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input pl-10 pr-10"
              placeholder="••••••••"
            />
            <div 
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-biblenow-beige/40" />
              ) : (
                <Eye className="h-5 w-5 text-biblenow-beige/40" />
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-biblenow-gold/30 bg-transparent text-biblenow-gold focus:ring-biblenow-gold/20"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-biblenow-beige/70">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <button 
              type="button" 
              onClick={() => setShowForgotPassword(true)} 
              className="auth-link text-sm"
            >
              Forgot your password?
            </button>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="auth-btn-primary w-full flex justify-center items-center"
          >
            {loading ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-biblenow-gold/30"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-biblenow-brown-light text-biblenow-beige/60">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="auth-btn-secondary flex justify-center items-center"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M17.9 9.18c0-.74-.06-1.29-.19-1.85H9.15v3.35h5c-.1.75-.77 2.32-2.24 3.27l-.02.13 3.25 2.54.22.02C16.73 15 18 12.34 18 9.18" fill="#4285F4" />
              <path d="M9.15 18c2.7 0 5-1 6.66-2.7l-3.45-2.69c-.95.6-2.17 1.05-3.21 1.05-2.48 0-4.57-1.68-5.32-3.95l-.11.01-3.36 2.63-.04.12C1.97 15.94 5.3 18 9.15 18z" fill="#34A853" />
              <path d="M3.83 10.71C3.65 10.18 3.55 9.61 3.55 9s.1-1.18.28-1.71l-.01-.12L.42 4.5l-.1.03A8.938 8.938 0 0 0 0 9c0 1.46.34 2.85.94 4.08l2.89-2.37z" fill="#FBBC05" />
              <path d="M9.15 3.34c1.76 0 2.94.76 3.62 1.4l3.06-3C14.11.64 11.82 0 9.15 0 5.3 0 1.97 2.06.33 5.46l3.39 2.67c.75-2.27 2.84-3.95 5.32-3.95" fill="#EB4335" />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={handleAppleSignIn}
            className="auth-btn-secondary flex justify-center items-center"
          >
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M12.1892 9.7149C12.2025 8.30465 12.8363 7.13275 13.9355 6.33595C13.3183 5.4581 12.3606 4.93135 11.1163 4.7477C9.93992 4.56857 8.6105 5.08078 8.05625 5.08078C7.47445 5.08078 6.28902 4.77313 5.38402 4.77313C3.59605 4.7942 1.7412 6.03545 1.7412 8.56898C1.7412 9.42673 1.88482 10.3146 2.1729 11.2284C2.56625 12.4498 3.97515 15.3749 5.44702 15.3355C6.39152 15.3173 7.06962 14.6426 8.2981 14.6426C9.4984 14.6426 10.1292 15.3355 11.1781 15.3355C12.6429 15.3177 13.9082 12.6821 14.2762 11.4567C12.1485 10.5023 12.1892 9.76343 12.1892 9.7149ZM10.0834 3.10695C10.9847 2.0263 10.873 1.03063 10.8492 0.667175C10.0334 0.7047 9.0864 1.19915 8.52315 1.82375C7.89855 2.50185 7.54102 3.34073 7.6375 4.7216C8.5119 4.79325 9.37898 3.9409 10.0834 3.10695Z" fill="#d4af37"/>
            </svg>
            Apple
          </button>
        </div>
      </form>
      
      <div className="text-center mt-4">
        <p className="text-sm text-biblenow-beige/60">
          Don't have an account?{' '}
          <button onClick={onToggleForm} className="auth-link">
            Create account
          </button>
        </p>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal 
          isOpen={showForgotPassword} 
          onClose={() => setShowForgotPassword(false)} 
        />
      )}
    </div>
  );
};

export default SignInForm;
