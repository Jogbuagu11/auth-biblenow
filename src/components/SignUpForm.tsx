
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SignUpFormProps {
  onToggleForm: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { loading, error, signUp, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const redirectTo = new URLSearchParams(location.search).get('redirectTo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError({ message: 'Please fill in all required fields' });
      return;
    }
    
    if (password !== confirmPassword) {
      setError({ message: 'Passwords do not match' });
      return;
    }
    
    if (!agreedToTerms) {
      setError({ message: 'Please agree to the terms and conditions' });
      return;
    }
    
    const success = await signUp(email, password);
    
    if (success) {
      toast({
        title: "Account created!",
        description: "Check your email to confirm your account.",
      });
      
      // Direct users back to sign in
      onToggleForm();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-semibold text-biblenow-beige">Create Account</h2>
        <p className="text-biblenow-beige/60 text-sm mt-1">Join the BibleNOW community</p>
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
              autoComplete="new-password"
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
          <p className="text-xs text-biblenow-beige/50 mt-1">
            Password must be at least 8 characters
          </p>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-biblenow-beige mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-biblenow-beige/40" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input pl-10"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="h-4 w-4 rounded border-biblenow-gold/30 bg-transparent text-biblenow-gold focus:ring-biblenow-gold/20"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-biblenow-beige/70">
            I agree to the{' '}
            <a href="#" className="auth-link">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="auth-link">
              Privacy Policy
            </a>
          </label>
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
              'Create Account'
            )}
          </button>
        </div>
      </form>
      
      <div className="text-center mt-4">
        <p className="text-sm text-biblenow-beige/60">
          Already have an account?{' '}
          <button onClick={onToggleForm} className="auth-link">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
