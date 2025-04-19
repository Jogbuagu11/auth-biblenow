// File: src/pages/PasswordReset.tsx
import React, { useState } from 'react';
import AuthLayout from '@/components/AuthLayout';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const PasswordReset: React.FC = () => {
  const [email, setEmail] = useState('');
  const { requestPasswordReset } = useApi();
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    const { error } = await requestPasswordReset(email);
    if (error) {
      toast({ title: 'Error', description: error });
    } else {
      setSent(true);
      toast({ title: 'Reset Sent', description: 'Check your email for reset link.' });
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
        <h2 className="text-xl font-bold mb-4 text-biblebrown-900">Reset Your Password</h2>
        <p className="mb-4 text-biblebrown-700">
          Enter your email and we’ll send you a link to reset your password.
        </p>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <Button className="w-full" onClick={handleReset} disabled={sent}>
          {sent ? 'Sent!' : 'Send Reset Link'}
        </Button>
      </div>
    </AuthLayout>
  );
};

export default PasswordReset;
