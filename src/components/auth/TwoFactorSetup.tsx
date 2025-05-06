
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const TwoFactorSetup: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `+1 (${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `+1 (${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const sendCode = async () => {
    const cleanedPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
    
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      toast.error('Unable to retrieve user');
      return;
    }

    try {
      setLoading(true);
      const { data, error: funcError } = await supabase.functions.invoke('setup-2fa', {
        body: {
          user_id: user.id,
          phone_number: cleanedPhoneNumber,
        },
      });

      if (funcError || !data?.verification_code) {
        toast.error('Failed to send verification code');
        return;
      }

      // Store the phone number in session storage for the verify page
      sessionStorage.setItem('verifyPhone', cleanedPhoneNumber);
      sessionStorage.setItem('verificationCode', data.verification_code);
      
      toast.success('Code sent to your phone');
      navigate('/auth/verify-2fa');
    } catch (err: any) {
      toast.error('Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        data: { twofa_skipped: true },
      });

      if (error) {
        toast.error('Failed to update preferences');
        return;
      }

      window.location.href = 'https://social.biblenow.io/edit-testimony';
    } catch (err: any) {
      toast.error('Failed to skip 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-black">Set Up 2FA</h2>
      <p className="mb-4 text-black">Enter your phone number to receive verification codes.</p>
      <input
        type="tel"
        className="w-full p-2 border rounded mb-4"
        placeholder="+1 (234) 567-8910"
        value={formatPhoneNumber(phoneNumber)}
        onChange={(e) => setPhoneNumber(e.target.value)}
        maxLength={17}
      />
      <div className="space-y-2">
        <Button className="w-full" onClick={sendCode} disabled={loading}>
          {loading ? 'Sending...' : 'Send Verification Code'}
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleDecline}
          disabled={loading}
        >
          Skip 2FA Setup
        </Button>
      </div>
    </div>
  );
};

export default TwoFactorSetup;
