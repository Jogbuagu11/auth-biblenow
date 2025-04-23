import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { format, parse } from 'date-fns';
import { GoogleIcon, AppleIcon } from '@/components/icons/SocialIcons';
import { Eye, EyeOff } from 'lucide-react';

interface SignUpFormProps {
  onToggleForm: () => void;
}

const SITE_KEY = '6LcdPCErAAAAAE16XMD28du5yaoswveHFNPqI3NA';

const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleForm }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [birthDateString, setBirthDateString] = useState('');
  const [ageVerified, setAgeVerified] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<ReCAPTCHA>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const birthdate = parse(birthDateString, 'yyyy-MM-dd', new Date());

    if (!firstName || !lastName || !email || !password || !gender || !birthdate) {
      setError('All fields are required.');
      return;
    }

    if (!ageVerified || !agreedToTerms) {
      setError('You must verify your age and agree to the terms.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!captchaToken) {
      setError('Please complete the CAPTCHA.');
      return;
    }

    try {
      console.log("Attempting signup with token:", captchaToken);
      
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken,
          data: {
            first_name: firstName,
            last_name: lastName,
            gender,
            birthdate: format(birthdate, 'yyyy-MM-dd'),
          },
          emailRedirectTo: `${window.location.origin}/email-confirmed`,
        }
      });

      captchaRef.current?.reset();

      if (signUpError) {
        console.error("Signup error:", signUpError);
        setError(signUpError.message);
        return;
      }

      toast({
        title: 'Check Your Email',
        description: 'A confirmation email has been sent. Please check your inbox to finish signing up.'
      });

      navigate('/check-email');
    } catch (error: any) {
      console.error("Unexpected error during signup:", error);
      setError(error.message || "An unexpected error occurred");
    }
  };

  const handleSocialSignUp = async (provider: "google" | "apple") => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Redirecting to OAuth provider:", data);
    } catch (error: any) {
      toast({
        title: `Social sign-up failed`,
        description: error.message || "Could not connect to authentication provider",
        variant: "destructive"
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-biblenow-beige">First Name</label>
          <input className="auth-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm text-biblenow-beige">Last Name</label>
          <input className="auth-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="block text-sm text-biblenow-beige">Email</label>
        <input type="email" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm text-biblenow-beige">Date of Birth</label>
        <input
          type="date"
          className="auth-input"
          value={birthDateString}
          onChange={(e) => setBirthDateString(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm text-biblenow-beige mb-1">Gender</label>
        <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <label htmlFor="male">Male</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <label htmlFor="female">Female</label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <label className="block text-sm text-biblenow-beige">Password</label>
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
            className="auth-input pr-10" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button 
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-biblenow-beige/40 hover:text-biblenow-beige"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm text-biblenow-beige">Confirm Password</label>
        <div className="relative">
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            className="auth-input pr-10" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
          <button 
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-biblenow-beige/40 hover:text-biblenow-beige"
            onClick={toggleConfirmPasswordVisibility}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox checked={ageVerified} onCheckedChange={(c) => setAgeVerified(c === true)} />
        <label className="text-sm">I am at least 13 years old</label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox checked={agreedToTerms} onCheckedChange={(c) => setAgreedToTerms(c === true)} />
        <label className="text-sm">
          I agree to the <a href="https://terms.biblenow.io" className="text-blue-600 underline">Terms</a> and <a href="https://policy.biblenow.io" className="text-blue-600 underline">Privacy Policy</a>
        </label>
      </div>

      <div className="mt-4">
        <ReCAPTCHA
          ref={captchaRef}
          sitekey={SITE_KEY}
          onChange={(token) => {
            console.log("ReCAPTCHA token received:", token);
            setCaptchaToken(token);
          }}
        />
      </div>

      <Button type="submit" className="w-full">
        Create Account
      </Button>

      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-biblenow-beige/20"></div>
        <span className="mx-2 text-xs text-biblenow-beige/60">or continue with</span>
        <div className="flex-grow h-px bg-biblenow-beige/20"></div>
      </div>
      <div className="flex space-x-2 mb-1">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => handleSocialSignUp("google")}
        >
          <GoogleIcon /> Google
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => handleSocialSignUp("apple")}
        >
          <AppleIcon /> Apple
        </Button>
      </div>

      <p className="text-center text-sm text-biblenow-beige/60 mt-4">
        Already have an account?{' '}
        <button type="button" onClick={onToggleForm} className="auth-link">
          Sign In
        </button>
      </p>
    </form>
  );
};

export default SignUpForm;
