
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SignInFormProps {
  onToggleForm: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
            <a href="#" className="auth-link text-sm">
              Forgot your password?
            </a>
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
      </form>
      
      <div className="text-center mt-4">
        <p className="text-sm text-biblenow-beige/60">
          Don't have an account?{' '}
          <button onClick={onToggleForm} className="auth-link">
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;
