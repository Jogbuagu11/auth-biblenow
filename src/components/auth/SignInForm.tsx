import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import ResetPasswordModal from '@/components/auth/ResetPasswordModal';
import { Mail, Lock } from 'lucide-react';
import { GoogleIcon, AppleIcon } from '@/components/icons/SocialIcons';

interface SignInFormProps {
  onToggleForm: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
      navigate('/edit-testimony');
    }

    setLoading(false);
  };

  const handleSocialSignIn = (provider: "google" | "apple") => {
    toast({
      title: `Continue with ${provider === "google" ? "Google" : "Apple"} (not implemented)`,
      variant: "default"
    });
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-biblenow-beige">Sign In</h2>
      </div>

      <div className="relative">
        <Mail className="absolute left-3 top-3 h-5 w-5 text-biblenow-beige/40" />
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input pl-10"
          required
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-3 h-5 w-5 text-biblenow-beige/40" />
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input pl-10"
          required
        />
      </div>

      <div className="flex justify-between items-center text-sm">
        <button
          type="button"
          onClick={() => setShowReset(true)}
          className="text-biblenow-gold hover:underline"
        >
          Forgot Password?
        </button>
        <button
          type="button"
          onClick={onToggleForm}
          className="text-biblenow-gold hover:underline"
        >
          Create Account
        </button>
      </div>

      <button
        type="submit"
        className="auth-btn-primary w-full"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-biblenow-beige/20"></div>
        <span className="mx-2 text-xs text-biblenow-beige/60">or continue with</span>
        <div className="flex-grow h-px bg-biblenow-beige/20"></div>
      </div>
      <div className="flex space-x-2 mb-1">
        <button type="button" className="flex-1 auth-btn-outline flex items-center justify-center gap-2"
          onClick={() => handleSocialSignIn("google")}>
          <GoogleIcon /> Google
        </button>
        <button type="button" className="flex-1 auth-btn-outline flex items-center justify-center gap-2"
          onClick={() => handleSocialSignIn("apple")}>
          <AppleIcon /> Apple
        </button>
      </div>

      <ResetPasswordModal isOpen={showReset} onClose={() => setShowReset(false)} />
    </form>
  );
};

export default SignInForm;
