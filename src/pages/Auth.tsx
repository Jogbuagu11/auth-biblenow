
// File: src/pages/Auth.tsx
import React, { useState } from 'react';
import AuthLayout from '@/components/AuthLayout';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import PhoneSignInModal from '@/components/auth/PhoneSignInModal';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const Auth: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const toggleForm = () => {
    setIsSignIn(!isSignIn);
  };

  return (
    <AuthLayout>
      <div className="mb-6">
        <ToggleGroup
          type="single"
          value={isSignIn ? 'signin' : 'signup'}
          onValueChange={(value) => {
            if (value) setIsSignIn(value === 'signin');
          }}
          className="w-full border border-biblenow-gold/30 rounded-md overflow-hidden"
        >
          <ToggleGroupItem
            value="signin"
            className="w-1/2 py-2 data-[state=on]:bg-biblenow-gold/20 data-[state=on]:text-biblenow-gold"
          >
            Sign In
          </ToggleGroupItem>
          <ToggleGroupItem
            value="signup"
            className="w-1/2 py-2 data-[state=on]:bg-biblenow-gold/20 data-[state=on]:text-biblenow-gold"
          >
            Create Account
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isSignIn && (
        <div className="mb-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 w-full"
            onClick={() => setIsPhoneModalOpen(true)}
          >
            <Phone size={16} />
            Sign in with Phone Number
          </Button>
        </div>
      )}

      {isSignIn ? (
        <SignInForm onToggleForm={toggleForm} />
      ) : (
        <SignUpForm onToggleForm={toggleForm} />
      )}
      
      <PhoneSignInModal 
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
      />
    </AuthLayout>
  );
};

export default Auth;
