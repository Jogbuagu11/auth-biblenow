import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface SignUpFormProps {
  onToggleForm: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<any>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken: captchaToken || '',
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Check Your Email', description: 'Confirm your email to finish signing up.' });
    }

    captchaRef.current?.resetCaptcha();
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-biblenow-beige mb-1">First Name</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="auth-input"
          />
        </div>
        <div>
          <label className="block text-sm text-biblenow-beige mb-1">Last Name</label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="auth-input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-biblenow-beige mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />
      </div>

      <div>
        <label className="block text-sm text-biblenow-beige mb-1">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
      </div>

      <HCaptcha
        ref={captchaRef}
        sitekey="3f8892b6-4d14-4d5a-841e-2792c152545e"
        onVerify={(token) => setCaptchaToken(token)}
      />

      <Button type="submit" className="w-full auth-btn-primary">
        Create Account
      </Button>

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
