
import React, { useState } from 'react';
import AuthLayout from '@/components/AuthLayout';
import SignInForm from '@/components/SignInForm';
import SignUpForm from '@/components/SignUpForm';

const Auth: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  
  const toggleForm = () => {
    setIsSignIn(!isSignIn);
  };
  
  return (
    <AuthLayout>
      {isSignIn ? (
        <SignInForm onToggleForm={toggleForm} />
      ) : (
        <SignUpForm onToggleForm={toggleForm} />
      )}
    </AuthLayout>
  );
};

export default Auth;
