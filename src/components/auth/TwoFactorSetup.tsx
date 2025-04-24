
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const TwoFactorSetup: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [expectedCode, setExpectedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendCode = async () => {
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
          phone_number: phoneNumber,
        },
      });

      if (funcError || !data?.verification_code) {
        toast.error('Failed to send verification code');
        return;
      }

      setExpectedCode(data.verification_code);
      setStep('verify');
      toast.success('Code sent to your phone');
    } catch (err: any) {
      toast.error('Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (code !== expectedCode) {
      toast.error('Invalid verification code');
      return;
    }

    try {
      setLoading(true);
      const update = await supabase.auth.updateUser({
        data: { has_completed_2fa: true },
      });

      if (update.error) {
        toast.error('Failed to enable 2FA');
        return;
      }

      toast.success('Two-Factor Authentication enabled');
      window.location.href = 'https://social.biblenow.io/edit-testimony';
    } catch (err: any) {
      toast.error('Failed to enable 2FA');
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
      {step === 'input' ? (
        <>
          <h2 className="text-xl font-bold mb-4 text-biblebrown-900">Set Up 2FA</h2>
          <p className="mb-4 text-biblebrown-700">Enter your phone number to receive verification codes.</p>
          <input
            type="tel"
            className="w-full p-2 border rounded mb-4"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4 text-biblebrown-900">Verify Your Code</h2>
          <p className="mb-4 text-biblebrown-700">Enter the code sent to your phone.</p>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4 text-center text-xl tracking-widest"
            placeholder="123456"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button className="w-full" onClick={verifyCode} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </Button>
        </>
      )}
    </div>
  );
};

export default TwoFactorSetup;
