
import React from 'react';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, ShieldAlert } from 'lucide-react';

const TwoFactorPrompt: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSetup2FA = () => {
    navigate('/auth/setup-2fa');
  };
  
  const handleSkip2FA = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { twofa_skipped: true }
      });
      
      if (error) {
        toast.error('Error updating user preferences', {
          description: error.message
        });
        return;
      }
      
      toast.success('Preference saved', {
        description: 'You can enable 2FA anytime in your account settings'
      });
      
      // Redirect to edit testimony page
      window.location.href = 'https://social.biblenow.io/edit-testimony';
    } catch (err: any) {
      toast.error('An error occurred', {
        description: err.message
      });
    }
  };

  return (
    <div className="w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-biblenow-gold/10 text-biblenow-gold mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-serif font-semibold text-biblenow-brown text-center">
          Protect Your Account
        </h2>
        <p className="text-center text-biblenow-brown/80 mt-2">
          Add an extra layer of security to your BibleNOW account with Two-Factor Authentication.
        </p>
      </div>
      
      <div className="bg-biblenow-beige/30 p-4 rounded-md mb-6 border border-biblenow-gold/20">
        <div className="flex items-start">
          <Shield className="text-biblenow-gold mt-1 mr-3 flex-shrink-0" size={20} />
          <p className="text-sm text-biblenow-brown">
            Two-Factor Authentication requires a verification code when you sign in, 
            keeping your account secure even if your password is compromised.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <Button 
          onClick={handleSetup2FA} 
          className="w-full bg-biblenow-gold hover:bg-biblenow-gold/80 text-white"
        >
          Set Up 2FA Now
        </Button>
        <Button 
          onClick={handleSkip2FA} 
          variant="outline" 
          className="w-full border-biblenow-gold/30 text-biblenow-brown hover:bg-biblenow-gold/10"
=======
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TwoFactorPromptProps {
  onSkip: () => void;
}

const TwoFactorPrompt = ({ onSkip }: TwoFactorPromptProps) => {
  const navigate = useNavigate();

  const handleSetup2FA = () => {
    // In a real implementation, navigate to 2FA setup page
    navigate('/settings/security');
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-bibleyellow-100 mb-4">
          <Shield className="h-8 w-8 text-bibleyellow-600" />
        </div>
        
        <h2 className="text-2xl font-ebgaramond font-bold text-biblebrown-900 mb-2">
          Secure Your Account
        </h2>
        
        <p className="text-biblebrown-600">
          Protect your account with Two-Factor Authentication (2FA). 
          This adds an extra layer of security to prevent unauthorized access.
        </p>
      </div>
      
      <div className="space-y-4">
        <Button 
          className="w-full bg-biblebrown-800 text-white hover:bg-biblebrown-900"
          onClick={handleSetup2FA}
        >
          Set Up 2FA Now
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onSkip}
>>>>>>> 4e08369 (Refactor auth flow: removed useAuth from SignInForm, added ResetPasswordModal, cleaned up signup/login components)
        >
          Remind Me Later
        </Button>
      </div>
    </div>
  );
};

export default TwoFactorPrompt;
