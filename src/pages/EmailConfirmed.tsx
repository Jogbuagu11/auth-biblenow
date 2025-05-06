
import React from "react";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/AuthLayout";

const EmailConfirmed: React.FC = () => {
  const handleLoginClick = () => {
    window.location.href = 'https://auth.biblenow.io/login';
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="text-biblenow-gold mb-4">
          <rect width="24" height="24" rx="12" fill="currentColor" fillOpacity="0.1"/>
          <path stroke="currentColor" strokeWidth="2" d="M4 8.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8.5M4 8.5 12 14l8-5.5M4 8.5 12 14M12 14l8-5.5"/>
        </svg>
        <h1 className="text-2xl font-bold text-biblenow-gold mb-4">Your Email has been Confirmed</h1>
        <p className="text-biblenow-beige/70 mb-8">
          You can now log in to access your account.
        </p>
        <Button onClick={handleLoginClick} className="w-full">
          Log In
        </Button>
      </div>
    </AuthLayout>
  );
};

export default EmailConfirmed;
