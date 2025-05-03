
import React from 'react';
import { Button } from '@/components/ui/button';
import { GoogleIcon, AppleIcon } from '@/components/icons/SocialIcons';
import { useAuth } from '@/hooks/useAuth';

const SocialSignIn: React.FC = () => {
  const { signInWithOAuth, error } = useAuth();

  const handleGoogleSignIn = () => {
    signInWithOAuth('google');
  };

  const handleAppleSignIn = () => {
    signInWithOAuth('apple');
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button 
        variant="outline" 
        onClick={handleGoogleSignIn}
        className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 w-full flex items-center justify-center gap-2"
      >
        <GoogleIcon size={18} />
        <span>Google</span>
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleAppleSignIn}
        className="bg-black hover:bg-gray-900 text-white border border-black w-full flex items-center justify-center gap-2"
      >
        <AppleIcon size={18} />
        <span>Apple</span>
      </Button>
    </div>
  );
};

export default SocialSignIn;
