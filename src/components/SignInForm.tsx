import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ResetPasswordModal from '@/components/auth/ResetPasswordModal';

interface SignInFormProps {
  onToggleForm: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onToggleForm }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = React.useRef(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!captchaToken) {
        toast.error('Please complete the CAPTCHA');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken
        }
      });

      captchaRef.current?.resetCaptcha();

      if (error) {
        toast.error('Login failed', { description: error.message });
        return;
      }

      // Check if this is the first login
      if (data.session?.user && !data.session.user.user_metadata?.has_completed_2fa && !data.session.user.user_metadata?.twofa_skipped) {
        navigate('/auth/setup-2fa');
      } else {
        toast.success('Welcome back!');
        window.location.href = 'https://social.biblenow.io/edit-testimony';
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-biblenow-beige">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-biblenow-beige">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center text-sm">
        <button onClick={() => setShowReset(true)} className="auth-link">
          Forgot password?
        </button>
      </div>

      <div className="text-center text-sm">
        Don't have an account?{' '}
        <button onClick={onToggleForm} className="auth-link">
          Sign up
        </button>
      </div>

      <ResetPasswordModal isOpen={showReset} onClose={() => setShowReset(false)} />
    </div>
  );
};

export default SignInForm;
