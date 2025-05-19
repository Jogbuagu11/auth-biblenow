
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader, Mail, Lock, AlertTriangle, Phone } from 'lucide-react';
import SocialSignIn from '@/components/auth/SocialSignIn';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { firebaseConfig } from '@/integrations/firebase/config';
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { supabase } from '@/integrations/supabase/client';

interface SignInFormProps {
  onToggleForm: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onToggleForm }) => {
  const [isPhoneSignIn, setIsPhoneSignIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setErrorMessage] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const recaptchaVerifierRef = React.useRef<RecaptchaVerifier | null>(null);
  
  const { signIn, setError } = useAuth();
  const navigate = useNavigate();

  // Initialize Firebase
  React.useEffect(() => {
    if (isPhoneSignIn) {
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
    }
  }, [isPhoneSignIn]);

  // Format phone number to E.164 standard required by Firebase
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
  
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const success = await signIn(email, password);
      if (success) {
        toast.success('Sign in successful');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const lookupEmailByPhone = async (phone: string): Promise<string | null> => {
    try {
      // Query your database to find a user with this phone number
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', phone)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      // Get the email from auth.users using the profile ID
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_email_by_id', { user_id: data.id });
      
      if (userError || !userData) {
        return null;
      }
      
      return userData.email;
    } catch (err) {
      console.error('Error looking up email by phone:', err);
      return null;
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Format phone number
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      if (!formattedPhone) {
        setErrorMessage('Please enter a valid 10-digit US phone number');
        setIsSubmitting(false);
        return;
      }
      
      // Look up email by phone number
      const userEmail = await lookupEmailByPhone(formattedPhone);
      
      if (!userEmail) {
        setErrorMessage('No account found with this phone number');
        setIsSubmitting(false);
        return;
      }
      
      // Attempt to sign in with the found email and provided password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password,
      });
      
      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }
      
      // Check if two factor authentication is enabled
      const { data: profileData } = await supabase
        .from('profiles')
        .select('has_completed_2fa')
        .eq('id', data.user?.id)
        .single();
      
      const needsTwoFactor = profileData?.has_completed_2fa === true;
      setTwoFactorEnabled(needsTwoFactor);
      
      if (needsTwoFactor) {
        // Send SMS verification code
        const auth = getAuth();
        const confirmation = await signInWithPhoneNumber(
          auth, 
          formattedPhone, 
          recaptchaVerifierRef.current!
        );
        
        setConfirmationResult(confirmation);
        setCodeSent(true);
        toast.success('Verification code sent!');
      } else {
        // No 2FA needed, proceed directly
        toast.success('Sign in successful!');
        // Navigate to home or dashboard
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error during phone login:', error);
      setErrorMessage(error.message || 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    
    setIsSubmitting(true);
    
    try {
      // Confirm the verification code
      await confirmationResult.confirm(verificationCode);
      
      toast.success('Successfully verified');
      // Navigate to home or dashboard
      navigate('/');
    } catch (error: any) {
      console.error('Error verifying code:', error);
      setErrorMessage(error.message || 'Failed to verify code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-600/10 border border-red-400/20 rounded-md p-3 mb-5">
          <div className="flex gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="text-center mb-4">
        <button 
          type="button" 
          onClick={() => setIsPhoneSignIn(!isPhoneSignIn)} 
          className="text-sm auth-link"
        >
          {isPhoneSignIn ? "Sign in with Email" : "Sign in with Phone Number"}
        </button>
      </div>

      {!isPhoneSignIn ? (
        // Email/Password Sign In
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-biblenow-beige/40" />
              <input
                type="email"
                placeholder="Email"
                className="auth-input pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-biblenow-beige/40" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="auth-input pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-biblenow-beige/60 hover:text-biblenow-beige"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M10 3C5.5 3 2 7.5 2 10c0 2.5 3.5 7 8 7s8-4.5 8-7c0-2.5-3.5-7-8-7zm0 11c-3.3 0-6-3.7-6-6 0-2.3 2.7-6 6-6s6 3.7 6 6c0 2.3-2.7 6-6 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 001.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
                      clipRule="evenodd"
                    />
                    <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm auth-link">Forgot password?</Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-biblenow-gold hover:bg-biblenow-gold-light text-biblenow-brown"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      ) : (
        // Phone Number Sign In
        <>
          {!codeSent ? (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-biblenow-beige/40" />
                <input
                  type="tel"
                  placeholder="Phone Number (10 digits)"
                  className="auth-input pl-10"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-biblenow-beige/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="auth-input pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-biblenow-beige/60 hover:text-biblenow-beige"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M10 3C5.5 3 2 7.5 2 10c0 2.5 3.5 7 8 7s8-4.5 8-7c0-2.5-3.5-7-8-7zm0 11c-3.3 0-6-3.7-6-6 0-2.3 2.7-6 6-6s6 3.7 6 6c0 2.3-2.7 6-6 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 001.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
                        clipRule="evenodd"
                      />
                      <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="text-right">
                <Link to="/forgot-password" className="text-sm auth-link">Forgot password?</Link>
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
                    Signing In...
                  </>
                ) : (
                  twoFactorEnabled ? 'Send Verification Code' : 'Sign In'
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
                  'Verify & Sign In'
                )}
              </Button>
              
              <div className="text-center mt-2">
                <button 
                  type="button"
                  className="text-sm auth-link"
                  onClick={() => setCodeSent(false)}
                >
                  Try again
                </button>
              </div>
            </form>
          )}
        </>
      )}

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-biblenow-beige/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-biblenow-brown-light text-biblenow-beige/70">Or continue with</span>
          </div>
        </div>

        <div className="mt-4">
          <SocialSignIn />
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-biblenow-beige/70">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onToggleForm}
              className="text-biblenow-gold hover:text-biblenow-gold-light"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
