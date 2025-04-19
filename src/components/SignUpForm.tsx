import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { Eye, EyeOff, Mail, User, Lock, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format, parse } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

enum SignUpStep {
  INITIAL_INFO,
  VERIFY_EMAIL,
  SET_PASSWORD,
  SETUP_2FA,
  VERIFY_2FA,
}

interface SignUpFormProps {
  onToggleForm: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleForm }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState<Date | undefined>(undefined);
  const [birthDateString, setBirthDateString] = useState('');
  const [gender, setGender] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [enable2FA, setEnable2FA] = useState<boolean | null>(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [expectedTwoFACode, setExpectedTwoFACode] = useState('');
  
  const [currentStep, setCurrentStep] = useState<SignUpStep>(SignUpStep.INITIAL_INFO);
  const [userId, setUserId] = useState<string | null>(null);
  
  const { loading, error, setError } = useAuth();
  const api = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const redirectTo = new URLSearchParams(location.search).get('redirectTo');

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBirthDateString(value);
    
    try {
      if (value) {
        const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
        if (!isNaN(parsedDate.getTime())) {
          setBirthdate(parsedDate);
        } else {
          setBirthdate(undefined);
        }
      } else {
        setBirthdate(undefined);
      }
    } catch (err) {
      setBirthdate(undefined);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      console.log("Starting Google sign up...");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent('https://social.biblenow.io/edit-testimony')}`
        },
      });
      
      console.log("Google sign up response:", { data, error });
      
      if (error) {
        console.error("Google sign up error:", error);
        setError({ message: error.message });
      }
    } catch (err: any) {
      console.error('Error signing up with Google:', err.message);
      setError({ message: err.message || 'An error occurred during sign up with Google' });
    }
  };

  const handleAppleSignUp = async () => {
    try {
      console.log("Starting Apple sign up...");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent('https://social.biblenow.io/edit-testimony')}`
        },
      });
      
      console.log("Apple sign up response:", { data, error });
      
      if (error) {
        console.error("Apple sign up error:", error);
        setError({ message: error.message });
      }
    } catch (err: any) {
      console.error('Error signing up with Apple:', err.message);
      setError({ message: err.message || 'An error occurred during sign up with Apple' });
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !birthdate || !gender) {
      setError({ message: 'Please fill in all required fields' });
      return;
    }
    
    if (!agreedToTerms) {
      setError({ message: 'Please agree to the terms and conditions' });
      return;
    }
    
    if (!ageVerified) {
      setError({ message: 'You must be at least 13 years of age to create an account' });
      return;
    }
    
    try {
      const response = await api.sendVerificationCode(email);
      
      if (response.error) {
        setError({ message: response.error });
        return;
      }
      
      setCurrentStep(SignUpStep.VERIFY_EMAIL);
      toast({
        title: "Verification code sent",
        description: "Please check your email for the 6-digit code",
      });
    } catch (err: any) {
      console.error('Error sending verification code:', err.message);
      setError({ message: err.message || 'An error occurred. Please try again.' });
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError({ message: 'Please enter the verification code' });
      return;
    }
    
    try {
      const response = await api.verifyEmailCode(email, verificationCode);
      
      if (response.error) {
        setError({ message: response.error });
        return;
      }
      
      if (response.data?.verified) {
        setCurrentStep(SignUpStep.SET_PASSWORD);
        toast({
          title: "Email verified",
          description: "Please set your password to continue",
        });
      } else {
        setError({ message: 'Invalid verification code. Please try again.' });
      }
    } catch (err: any) {
      console.error('Error verifying email:', err.message);
      setError({ message: err.message || 'An error occurred. Please try again.' });
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError({ message: 'Please enter and confirm your password' });
      return;
    }
    
    if (password.length < 8) {
      setError({ message: 'Password must be at least 8 characters long' });
      return;
    }
    
    if (password !== confirmPassword) {
      setError({ message: 'Passwords do not match' });
      return;
    }
    
    try {
      console.log("Creating Supabase user with email/password:", { email, firstName, lastName, birthdate, gender });
      
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            birthdate: birthdate ? format(birthdate, 'yyyy-MM-dd') : null,
            gender,
          }
        }
      });
      
      console.log("Supabase signup response:", { userData, signUpError });
      
      if (signUpError) {
        console.error("Error creating user in Supabase:", signUpError);
        setError({ message: signUpError.message });
        return;
      }
      
      if (!userData.user) {
        setError({ message: 'Failed to create user account. Please try again.' });
        return;
      }
      
      setUserId(userData.user.id);
      
      setCurrentStep(SignUpStep.SETUP_2FA);
      toast({
        title: "Account created",
        description: "Your account has been created successfully",
      });
    } catch (err: any) {
      console.error('Error creating account:', err.message);
      setError({ message: err.message || 'An error occurred. Please try again.' });
    }
  };

  const handleSetup2FA = async (enable: boolean) => {
    setEnable2FA(enable);
    
    if (!enable) {
      if (userId) {
        try {
          const response = await api.skip2FA(userId);
          
          if (response.error) {
            setError({ message: response.error });
            return;
          }
          
          window.location.href = 'https://social.biblenow.io/edit-testimony';
        } catch (err: any) {
          console.error('Error skipping 2FA:', err.message);
          setError({ message: err.message || 'An error occurred. Please try again.' });
        }
      }
    }
  };

  const handleSend2FACode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      setError({ message: 'Please enter your phone number' });
      return;
    }
    
    if (!userId) {
      setError({ message: 'User ID not found. Please try again.' });
      return;
    }
    
    try {
      const response = await api.setup2FA(userId, phoneNumber);
      
      if (response.error) {
        setError({ message: response.error });
        return;
      }
      
      setExpectedTwoFACode(response.data?.verification_code || '');
      
      setCurrentStep(SignUpStep.VERIFY_2FA);
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code",
      });
    } catch (err: any) {
      console.error('Error sending 2FA code:', err.message);
      setError({ message: err.message || 'An error occurred. Please try again.' });
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!twoFACode) {
      setError({ message: 'Please enter the verification code' });
      return;
    }
    
    if (!userId || !expectedTwoFACode) {
      setError({ message: 'User ID or expected code not found. Please try again.' });
      return;
    }
    
    try {
      const response = await api.verify2FACode(userId, twoFACode, expectedTwoFACode);
      
      if (response.error) {
        setError({ message: response.error });
        return;
      }
      
      if (response.data?.verified) {
        toast({
          title: "Phone verified",
          description: "Your phone number has been verified successfully",
        });
        
        window.location.href = 'https://social.biblenow.io/edit-testimony';
      } else {
        setError({ message: 'Invalid verification code. Please try again.' });
      }
    } catch (err: any) {
      console.error('Error verifying 2FA code:', err.message);
      setError({ message: err.message || 'An error occurred. Please try again.' });
    }
  };

  const renderInitialForm = () => (
    <form onSubmit={handleInitialSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-biblenow-beige mb-1">
            First Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-biblenow-beige/40" />
            </div>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="auth-input pl-10"
              placeholder="John"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-biblenow-beige mb-1">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="auth-input"
            placeholder="Doe"
          />
        </div>
      </div>
      
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
        <label htmlFor="birthdate" className="block text-sm font-medium text-biblenow-beige mb-1">
          Date of Birth
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-biblenow-beige/40" />
          </div>
          <input
            id="birthdate"
            name="birthdate"
            type="date"
            required
            value={birthDateString}
            onChange={handleBirthdateChange}
            className="auth-input pl-10"
            max={new Date().toISOString().split('T')[0]}
            min="1900-01-01"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-biblenow-beige mb-3">
          Gender
        </label>
        <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" className="border-biblenow-gold/50 text-biblenow-gold" />
            <label htmlFor="male" className="text-biblenow-beige cursor-pointer">Male</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" className="border-biblenow-gold/50 text-biblenow-gold" />
            <label htmlFor="female" className="text-biblenow-beige cursor-pointer">Female</label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="flex items-start space-x-2">
        <Checkbox
          id="ageVerification"
          checked={ageVerified}
          onCheckedChange={(checked) => setAgeVerified(checked === true)}
          className="mt-1"
        />
        <label htmlFor="ageVerification" className="text-sm text-biblenow-beige/70 cursor-pointer">
          I am at least 13 years of age
        </label>
      </div>
      
      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={agreedToTerms}
          onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
          className="mt-1"
        />
        <label htmlFor="terms" className="text-sm text-biblenow-beige/70 cursor-pointer">
          I agree to the{' '}
          <a href="https://terms.biblenow.io" target="_blank" rel="noopener noreferrer" className="auth-link">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="https://policy.biblenow.io" target="_blank" rel="noopener noreferrer" className="auth-link">
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
            'Continue'
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
          onClick={handleGoogleSignUp}
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
          onClick={handleAppleSignUp}
          className="auth-btn-secondary flex justify-center items-center"
        >
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <path d="M12.1892 9.7149C12.2025 8.30465 12.8363 7.13275 13.9355 6.33595C13.3183 5.4581 12.3606 4.93135 11.1163 4.7477C9.93992 4.56857 8.6105 5.08078 8.05625 5.08078C7.47445 5.08078 6.28902 4.77313 5.38402 4.77313C3.59605 4.7942 1.7412 6.03545 1.7412 8.56898C1.7412 9.42673 1.88482 10.3146 2.1729 11.2284C2.56625 12.4498 3.97515 15.3749 5.44702 15.3355C6.39152 15.3173 7.06962 14.6426 8.2981 14.6426C9.4984 14.6426 10.1292 15.3355 11.1781 15.3355C12.6429 15.3177 13.9082 12.6821 14.2762 11.4567C12.1485 10.5023 12.1892 9.76343 12.1892 9.7149ZM10.0834 3.10695C10.9847 2.0263 10.873 1.03063 10.8492 0.667175C10.0334 0.7047 9.0864 1.19915 8.52315 1.82375C7.89855 2.50185 7.54102 3.34073 7.6375 4.7216C8.5119 4.79325 9.37898 3.9409 10.0834 3.10695Z" fill="#d4af37"/>
          </svg>
          Apple
        </button>
      </div>
    </form>
  );

  const renderVerifyEmailForm = () => (
    <form onSubmit={handleVerifyEmail} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-semibold text-biblenow-beige">Verify Your Email</h2>
        <p className="text-biblenow-beige/60 text-sm mt-1">
          We've sent a 6-digit code to {email}
        </p>
      </div>
      
      <div>
        <label htmlFor="verificationCode" className="block text-sm font-medium text-biblenow-beige mb-1">
          Verification Code
        </label>
        <input
          id="verificationCode"
          name="verificationCode"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className="auth-input text-center text-xl tracking-widest"
          placeholder="123456"
        />
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
            'Verify Email'
          )}
        </button>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-biblenow-beige/60">
          Didn't receive the code?{' '}
          <button 
            type="button" 
            onClick={async () => {
              await api.sendVerificationCode(email);
              toast({
                title: "Code resent",
                description: "A new verification code has been sent to your email",
              });
            }} 
            className="auth-link"
          >
            Resend
          </button>
        </p>
      </div>
    </form>
  );

  const renderSetPasswordForm = () => (
    <form onSubmit={handleSetPassword} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-semibold text-biblenow-beige">Set Your Password</h2>
        <p className="text-biblenow-beige/60 text-sm mt-1">
          Create a secure password for your account
        </p>
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
  );

  const renderSetup2FAForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-semibold text-biblenow-beige">Two-Factor Authentication</h2>
        <p className="text-biblenow-beige/60 text-sm mt-1">
          Would you like to set up two-factor authentication for added security?
        </p>
      </div>
      
      {enable2FA === null ? (
        <div className="flex flex-col space-y-4">
          <button
            type="button"
            onClick={() => handleSetup2FA(true)}
            className="auth-btn-primary flex justify-center items-center"
          >
            Yes, enable 2FA
          </button>
          <button
            type="button"
            onClick={() => handleSetup2FA(false)}
            className="auth-btn-secondary flex justify-center items-center"
          >
            Skip for now
          </button>
        </div>
      ) : (
        <form onSubmit={handleSend2FACode} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-biblenow-beige mb-1">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              inputMode="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="auth-input"
              placeholder="+1 (555) 123-4567"
            />
            <p className="text-xs text-biblenow-beige/50 mt-1">
              Enter your phone number with country code (e.g., +1 for US)
            </p>
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
                'Send Verification Code'
              )}
            </button>
          </div>
          
          <div>
            <button
              type="button"
              onClick={() => handleSetup2FA(false)}
              className="auth-btn-secondary w-full"
            >
              Skip 2FA
            </button>
          </div>
        </form>
      )}
    </div>
  );

  const renderVerify2FAForm = () => (
    <form onSubmit={handleVerify2FA} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-semibold text-biblenow-beige">Verify Your Phone</h2>
        <p className="text-biblenow-beige/60 text-sm mt-1">
          We've sent a verification code to {phoneNumber}
        </p>
      </div>
      
      <div>
        <label htmlFor="twoFACode" className="block text-sm font-medium text-biblenow-beige mb-1">
          Verification Code
        </label>
        <input
          id="twoFACode"
          name="twoFACode"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          value={twoFACode}
          onChange={(e) => setTwoFACode(e.target.value)}
          className="auth-input text-center text-xl tracking-widest"
          placeholder="123456"
        />
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
            'Verify Phone'
          )}
        </button>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-biblenow-beige/60">
          Didn't receive the code?{' '}
          <button 
            type="button" 
            onClick={async () => {
              if (userId) {
                await api.setup2FA(userId, phoneNumber);
                toast({
                  title: "Code resent",
                  description: "A new verification code has been sent to your phone",
                });
              }
            }} 
            className="auth-link"
          >
            Resend
          </button>
        </p>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-2 rounded-md text-sm">
          {error.message}
        </div>
      )}
      
      {currentStep === SignUpStep.INITIAL_INFO && renderInitialForm()}
      {currentStep === SignUpStep.VERIFY_EMAIL && renderVerifyEmailForm()}
      {currentStep === SignUpStep.SET_PASSWORD && renderSetPasswordForm()}
      {currentStep === SignUpStep.SETUP_2FA && renderSetup2FAForm()}
      {currentStep === SignUpStep.VERIFY_2FA && renderVerify2FAForm()}
      
      {currentStep === SignUpStep.INITIAL_INFO && (
        <div className="text-center mt-4">
          <p className="text-sm text-biblenow-beige/60">
            Already have an account?{' '}
            <button onClick={onToggleForm} className="auth-link">
              Sign in
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default SignUpForm;
