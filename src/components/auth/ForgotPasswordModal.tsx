
import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

enum PasswordResetStep {
  EMAIL_INPUT,
  CODE_VERIFICATION,
  NEW_PASSWORD,
  SUCCESS,
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<PasswordResetStep>(PasswordResetStep.EMAIL_INPUT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const api = useApi();
  const { toast } = useToast();
  
  // Request password reset (send code)
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.requestPasswordReset(email);
      
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }
      
      setStep(PasswordResetStep.CODE_VERIFICATION);
      toast({
        title: "Verification code sent",
        description: "Please check your email for the 6-digit code",
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Verify email code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!code) {
      setError('Please enter the verification code');
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.verifyEmailCode(email, code);
      
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }
      
      if (response.data?.verified) {
        setStep(PasswordResetStep.NEW_PASSWORD);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password');
      setLoading(false);
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Sign in with email and password reset code
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        token: code,
        options: {
          shouldCreateUser: false,
        },
      });
      
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      
      setStep(PasswordResetStep.SUCCESS);
      toast({
        title: "Password reset successful",
        description: "Your password has been reset successfully",
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setStep(PasswordResetStep.EMAIL_INPUT);
    setError(null);
    onClose();
  };
  
  // Render the email input step
  const renderEmailStep = () => (
    <form onSubmit={handleRequestReset} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-biblenow-beige mb-1">
          Email Address
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
      
      <button
        type="submit"
        disabled={loading}
        className="auth-btn-primary w-full flex justify-center items-center"
      >
        {loading ? (
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
        ) : (
          'Send Reset Code'
        )}
      </button>
    </form>
  );
  
  // Render the code verification step
  const renderCodeStep = () => (
    <form onSubmit={handleVerifyCode} className="space-y-4">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-biblenow-beige mb-1">
          Verification Code
        </label>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="auth-input text-center text-xl tracking-widest"
          placeholder="123456"
        />
        <p className="text-xs text-biblenow-beige/50 mt-1">
          Enter the 6-digit code sent to {email}
        </p>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="auth-btn-primary w-full flex justify-center items-center"
      >
        {loading ? (
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
        ) : (
          'Verify Code'
        )}
      </button>
      
      <div className="text-center">
        <button 
          type="button" 
          onClick={async () => {
            setLoading(true);
            await api.requestPasswordReset(email);
            setLoading(false);
            toast({
              title: "Code resent",
              description: "A new verification code has been sent to your email",
            });
          }} 
          className="auth-link text-sm"
        >
          Resend code
        </button>
      </div>
    </form>
  );
  
  // Render the new password step
  const renderNewPasswordStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-biblenow-beige mb-1">
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="auth-input"
          placeholder="••••••••"
        />
        <p className="text-xs text-biblenow-beige/50 mt-1">
          Password must be at least 8 characters
        </p>
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-biblenow-beige mb-1">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="auth-input"
          placeholder="••••••••"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="auth-btn-primary w-full flex justify-center items-center"
      >
        {loading ? (
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
        ) : (
          'Reset Password'
        )}
      </button>
    </form>
  );
  
  // Render the success step
  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-biblenow-gold/20 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-biblenow-gold" />
      </div>
      <h3 className="text-xl font-semibold text-biblenow-beige">Password Reset Successful</h3>
      <p className="text-biblenow-beige/60">
        Your password has been reset successfully. You can now sign in with your new password.
      </p>
      <button
        type="button"
        onClick={handleClose}
        className="auth-btn-primary w-full"
      >
        Sign In
      </button>
    </div>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-biblenow-brown-light border-biblenow-gold/30">
        <DialogHeader>
          <DialogTitle className="text-biblenow-beige">Reset Password</DialogTitle>
          <DialogDescription className="text-biblenow-beige/60">
            {step === PasswordResetStep.EMAIL_INPUT && "Enter your email to receive a password reset code"}
            {step === PasswordResetStep.CODE_VERIFICATION && "Enter the verification code sent to your email"}
            {step === PasswordResetStep.NEW_PASSWORD && "Create a new password for your account"}
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4 text-biblenow-beige/60" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {step === PasswordResetStep.EMAIL_INPUT && renderEmailStep()}
        {step === PasswordResetStep.CODE_VERIFICATION && renderCodeStep()}
        {step === PasswordResetStep.NEW_PASSWORD && renderNewPasswordStep()}
        {step === PasswordResetStep.SUCCESS && renderSuccessStep()}
        
        <DialogFooter className="sm:justify-start">
          {step !== PasswordResetStep.EMAIL_INPUT && step !== PasswordResetStep.SUCCESS && (
            <button
              type="button"
              onClick={() => setStep(prevStep => prevStep - 1)}
              className="auth-btn-secondary"
            >
              Back
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
