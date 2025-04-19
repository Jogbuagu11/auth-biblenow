// File: src/pages/SignUp.tsx
import React from 'react';
import AuthLayout from '@/components/AuthLayout';
import SignUpForm from '@/components/SignUpForm';

const SignUp: React.FC = () => {
  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-center mb-6 text-biblenow-gold">Create Your Account</h1>
      <SignUpForm onToggleForm={() => {}} />
    </AuthLayout>
  );
};

export default SignUp;
