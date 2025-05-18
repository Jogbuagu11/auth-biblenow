
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { firebaseConfig } from '@/integrations/firebase/config';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

interface PhoneSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PhoneSignInModal: React.FC<PhoneSignInModalProps> = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Initialize Firebase app
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    if (isOpen) {
      // Create RecaptchaVerifier when modal is opened
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {
          // reCAPTCHA solved, allow sending SMS
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          // Reset the reCAPTCHA
          toast.error('reCAPTCHA expired. Please solve it again.');
        }
      });
      
      setRecaptchaVerifier(verifier);

      return () => {
        // Clean up recaptcha when modal is closed
        verifier.clear();
      };
    }
  }, [isOpen]);

  const handleSendCode = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedPhoneNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+1${phoneNumber.replace(/\D/g, '')}`;

      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not loaded');
      }

      const auth = getAuth();
      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, recaptchaVerifier);
      
      setConfirmationResult(confirmation);
      setIsCodeSent(true);
      toast.success('Verification code sent to your phone');
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult || !verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsVerifying(true);

    try {
      // Confirm the verification code
      const firebaseUserCredential = await confirmationResult.confirm(verificationCode);
      const firebaseUser = firebaseUserCredential.user;
      
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Call Supabase Edge Function to link Firebase user to Supabase
      const { data, error } = await supabase.functions.invoke('link-firebase-user', {
        body: { idToken }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data || !data.session) {
        throw new Error('Failed to get Supabase session');
      }
      
      // Set the Supabase session
      const { access_token, refresh_token } = data.session;
      await supabase.auth.setSession({ access_token, refresh_token });
      
      toast.success('Successfully signed in');
      onClose();
    } catch (error: any) {
      console.error('Error verifying code:', error);
      toast.error(error.message || 'Failed to verify code');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-biblenow-brown-light border border-biblenow-gold/20 rounded-lg shadow-xl p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold text-biblenow-gold mb-4">Sign In with Phone Number</h2>
          
          {!isCodeSent ? (
            <>
              <div className="mb-4">
                <label className="block text-sm text-biblenow-beige mb-1">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 555-5555"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="auth-input"
                />
                <p className="text-xs text-biblenow-beige/60 mt-1">
                  Include country code (e.g., +1 for US)
                </p>
              </div>
              
              <div id="recaptcha-container" className="mb-4"></div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSendCode} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm text-biblenow-beige mb-2">Verification Code</label>
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-xs text-biblenow-beige/60 mt-2">
                  Enter the 6-digit code sent to your phone
                </p>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleVerifyCode} disabled={isVerifying || verificationCode.length < 6}>
                  {isVerifying ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default PhoneSignInModal;
