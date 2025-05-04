
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AuthLayout from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Mail, Loader } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Invalid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the full URL with the current origin to ensure correct redirection
      const redirectTo = `${window.location.origin}/password-update`;
      console.log('Redirect URL:', redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      
      if (error) {
        toast.error('Password reset failed', { description: error.message });
      } else {
        toast.success('Reset email sent', { description: 'Check your inbox for instructions to reset your password.' });
        navigate('/check-email');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred', { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-biblenow-gold">Reset Your Password</h1>
        <p className="text-biblenow-beige/80 mt-2">
          Enter your email and we'll send you a link to reset your password
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-biblenow-beige/40" />
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input pl-10 w-full"
            required
          />
        </div>
        
        <Button
          type="submit"
          className="w-full bg-biblenow-gold hover:bg-biblenow-gold-light text-biblenow-brown"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="h-4 w-4 animate-spin mr-2" />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>
        
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="auth-link text-sm"
          >
            Return to Sign In
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
