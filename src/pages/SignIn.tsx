
// File: src/pages/SignIn.tsx
import React, { useState } from 'react';
import AuthLayout from '@/components/AuthLayout';
import SignInForm from '@/components/SignInForm';
import PhoneSignInModal from '@/components/auth/PhoneSignInModal';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

const SignIn: React.FC = () => {
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-center mb-6 text-biblenow-gold">Welcome Back</h1>
      <SignInForm onToggleForm={() => {}} />
      
      <div className="mt-4 text-center">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 mx-auto"
          onClick={() => setIsPhoneModalOpen(true)}
        >
          <Phone size={16} />
          Sign in with Phone Number
        </Button>
      </div>
      
      <PhoneSignInModal 
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
      />
    </AuthLayout>
  );
};

export default SignIn;
