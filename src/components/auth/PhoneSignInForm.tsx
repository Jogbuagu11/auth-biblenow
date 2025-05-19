
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { firebaseConfig } from '@/integrations/firebase/config';
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { supabase } from '@/integrations/supabase/client';

interface PhoneSignInFormProps {
  onSwitchToEmail: () => void;
}

const PhoneSignInForm: React.FC<PhoneSignInFormProps> = ({ onSwitchToEmail }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const navigate = useNavigate();
  
  // Initialize Firebase
  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    // Initialize invisible reCAPTCHA
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, you can proceed with sending OTP
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          toast.error('reCAPTCHA expired. Please try again.');
        }
      });
    }
    
    return () => {
      // Cleanup
      recaptchaVerifierRef.current = null;
    };
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Format phone number to E.164 standard required by Firebase
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      if (!formattedPhone) {
        setError('Please enter a valid 10-digit US phone number');
        setIsSubmitting(false);
        return;
      }
      
      const auth = getAuth();
      const confirmation = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        recaptchaVerifierRef.current!
      );
      
      setConfirmationResult(confirmation);
      setCodeSent(true);
      toast.success('Verification code sent!');
    } catch (error: any) {
      console.error('Error sending code:', error);
      setError(error.message || 'Failed to send verification code');
      
      // Reset reCAPTCHA if there's an error
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        const auth = getAuth();
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Confirm the verification code
      const result = await confirmationResult.confirm(verificationCode);
      const firebaseUser = result.user;
      
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Call Supabase Edge Function to link Firebase user
      const response = await fetch('https://jhlawjmyorpmafokxtuh.supabase.co/functions/v1/link-firebase-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to link account');
      }
      
      const { session } = await response.json();
      
      // Set the session in Supabase
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      
      toast.success('Successfully signed in');
      // Redirect to home page or dashboard
      navigate('/');
    } catch (error: any) {
      console.error('Error verifying code:', error);
      setError(error.message || 'Failed to verify code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format US phone numbers to E.164 format
  const formatPhoneNumber = (phone: string): string | null => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Check if it's a valid 10-digit US number
    if (digits.length !== 10) {
      return null;
    }
    
    // Format to E.164 for US (+1)
    return `+1${digits}`;
  };

  return (
    <div>
      {error && (
        <div className="bg-red-600/10 border border-red-400/20 rounded-md p-3 mb-5">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!codeSent ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="relative">
            <input
              type="tel"
              placeholder="Phone Number (10 digits)"
              className="auth-input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              pattern="[0-9]{10}"
              maxLength={10}
            />
          </div>
          
          <div id="recaptcha-container"></div>
          
          <Button
            type="submit"
            className="w-full bg-biblenow-gold hover:bg-biblenow-gold-light text-biblenow-brown"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Sending Code...
              </>
            ) : (
              'Send Verification Code'
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-biblenow-beige mb-2">
              Enter 6-digit verification code
            </label>
            <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-biblenow-gold hover:bg-biblenow-gold-light text-biblenow-brown"
            disabled={isSubmitting || verificationCode.length < 6}
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      )}
      
      <div className="mt-4 text-center">
        <button onClick={onSwitchToEmail} className="text-sm auth-link">
          Sign in with Email
        </button>
      </div>
    </div>
  );
};

export default PhoneSignInForm;
