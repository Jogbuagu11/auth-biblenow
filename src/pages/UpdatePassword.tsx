
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AuthLayout from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader } from 'lucide-react';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  // Check if URL has hash fragment from Supabase (verification token)
  useEffect(() => {
    const handleHashChange = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (!hashParams.get('access_token')) {
        toast.error('Invalid or expired reset link', { 
          description: 'Please request a new password reset link.' 
        });
      }
    };

    handleHashChange();
  }, []);

  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength('');
      return;
    }

    // Password strength criteria
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    const strength = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, isLongEnough]
      .filter(Boolean).length;

    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (password.length < 8) {
      toast.error('Password is too short', { description: 'Password must be at least 8 characters long.' });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', { description: 'Please ensure both passwords are identical.' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast.error('Failed to update password', { description: error.message });
      } else {
        toast.success('Password updated successfully', { description: 'You can now sign in with your new password.' });
        
        // Sign out to ensure user signs in with the new password
        await supabase.auth.signOut();
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred', { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength === 'weak') return 'bg-red-500';
    if (passwordStrength === 'medium') return 'bg-yellow-500';
    if (passwordStrength === 'strong') return 'bg-green-500';
    return 'bg-biblenow-beige/10';
  };
  
  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-biblenow-gold">Set New Password</h1>
        <p className="text-biblenow-beige/80 mt-2">
          Choose a strong, unique password for your account
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* New password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-biblenow-beige mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input pr-10 w-full"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-biblenow-beige/60 hover:text-biblenow-beige"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password strength indicator */}
            {password && (
              <div className="mt-2">
                <div className="h-1 w-full bg-biblenow-beige/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getPasswordStrengthColor()} transition-all`} 
                    style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '67%' : '100%' }}
                  />
                </div>
                <p className="text-xs mt-1 text-biblenow-beige/60">
                  {passwordStrength === 'weak' ? 'Weak - Add uppercase, numbers or special characters' : 
                   passwordStrength === 'medium' ? 'Medium - Getting better!' : 
                   passwordStrength === 'strong' ? 'Strong password' : ''}
                </p>
              </div>
            )}
          </div>
          
          {/* Confirm password field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-biblenow-beige mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input pr-10 w-full"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-biblenow-beige/60 hover:text-biblenow-beige"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password match indicator */}
            {confirmPassword && (
              <p className={`text-xs mt-1 ${password === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full bg-biblenow-gold hover:bg-biblenow-gold-light text-biblenow-brown"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="h-4 w-4 animate-spin mr-2" />
              Updating...
            </>
          ) : (
            'Set New Password'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default UpdatePassword;
