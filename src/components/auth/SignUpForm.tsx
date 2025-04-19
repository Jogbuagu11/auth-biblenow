// File: src/components/SignUpForm.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface SignUpFormProps {
  onToggleForm: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Check Your Email', description: 'Confirm your email to finish signing up.' });
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-biblenow-beige mb-1">First Name</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="auth-input"
          />
        </div>
        <div>
          <label className="block text-sm text-biblenow-beige mb-1">Last Name</label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="auth-input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-biblenow-beige mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />
      </div>

      <div>
        <label className="block text-sm text-biblenow-beige mb-1">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
      </div>

      <Button type="submit" className="w-full auth-btn-primary">
        Create Account
      </Button>

      <p className="text-center text-sm text-biblenow-beige/60 mt-4">
        Already have an account?{' '}
        <button type="button" onClick={onToggleForm} className="auth-link">
          Sign In
        </button>
      </p>
    </form>
  );
};

export default SignUpForm;
