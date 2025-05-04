
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';

const ExpiredReset = () => {
  const navigate = useNavigate();
  
  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-biblenow-gold">Invalid or expired reset link</h1>
        <p className="text-biblenow-beige/80 mt-4">
          Please request a new password reset link.
        </p>
      </div>
      
      <div className="mt-6 space-y-4">
        <Button
          className="w-full bg-biblenow-gold hover:bg-biblenow-gold-light text-biblenow-brown"
          onClick={() => navigate('/forgot-password')}
        >
          Request New Link
        </Button>
        
        <Button
          variant="outline"
          className="w-full border-biblenow-beige/20 text-biblenow-beige hover:bg-biblenow-brown-light"
          onClick={() => navigate('/login')}
        >
          Back to Sign In
        </Button>
      </div>
    </AuthLayout>
  );
};

export default ExpiredReset;
