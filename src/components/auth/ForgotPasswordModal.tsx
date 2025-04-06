
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApi } from '@/hooks/useApi';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'verify' | 'newPassword'>('email');
  const { requestPasswordReset, resetPassword } = useApi();
  const { toast } = useToast();

  const handleSendResetCode = async () => {
    const { data, error } = await requestPasswordReset(email);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    } else {
      setStep('verify');
    }
  };

  const handleVerifyCode = async () => {
    // Note: Supabase handles this automatically via magic link
    setStep('newPassword');
  };

  const handleResetPassword = async () => {
    const { data, error } = await resetPassword(email, newPassword);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Password reset successfully."
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            {step === 'email' && 'Enter your email to reset your password'}
            {step === 'verify' && 'Check your email for the verification code'}
            {step === 'newPassword' && 'Set a new password'}
          </DialogDescription>
        </DialogHeader>

        {step === 'email' && (
          <div>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="auth-input w-full"
            />
            <button 
              onClick={handleSendResetCode} 
              className="auth-btn-primary mt-4 w-full"
            >
              Send Reset Code
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div>
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
              className="auth-input w-full"
            />
            <button 
              onClick={handleVerifyCode} 
              className="auth-btn-primary mt-4 w-full"
            >
              Verify Code
            </button>
          </div>
        )}

        {step === 'newPassword' && (
          <div>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="auth-input w-full"
            />
            <button 
              onClick={handleResetPassword} 
              className="auth-btn-primary mt-4 w-full"
            >
              Reset Password
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
