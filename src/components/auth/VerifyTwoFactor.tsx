
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, RefreshCcw, XCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

const VerifyTwoFactor: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const api = useApi();

  useEffect(() => {
    // Get stored data from session storage
    const storedPhone = sessionStorage.getItem('verifyPhone');
    const storedCode = sessionStorage.getItem('verificationCode');
    
    if (!storedPhone || !storedCode) {
      // If data is missing, go back to setup page
      navigate('/auth/setup-2fa');
      return;
    }
    
    setPhoneNumber(storedPhone);
    setExpectedCode(storedCode);
  }, [navigate]);

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error('Unable to retrieve user information');
        return;
      }

      // Call the verify-2fa-code edge function
      const { data, error: verifyError } = await api.verify2FACode(
        user.id, 
        code,
        expectedCode
      );

      if (verifyError || !data?.verified) {
        setError('Invalid verification code');
        setLoading(false);
        return;
      }

      // Mark user as verified in profile
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          twofa_enabled: true,
          twofa_verified: true,
          phone_number: phoneNumber
        },
      });

      if (updateError) {
        toast.error('Failed to verify 2FA');
        setError('Failed to update user profile');
        setLoading(false);
        return;
      }

      // Verification successful
      setVerified(true);
      setError(null);
      toast.success('Two-Factor Authentication enabled successfully');

      // Clear session storage
      sessionStorage.removeItem('verifyPhone');
      sessionStorage.removeItem('verificationCode');

      // Redirect after a short delay to allow the user to see the success message
      setTimeout(() => {
        window.location.href = 'https://social.biblenow.io/edit-testimony';
      }, 2000);
    } catch (err: any) {
      console.error('2FA verification error:', err);
      setError('An unexpected error occurred');
      toast.error('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setResending(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error('Unable to retrieve user');
        return;
      }

      const { data, error: funcError } = await supabase.functions.invoke('setup-2fa', {
        body: {
          user_id: user.id,
          phone_number: phoneNumber,
        },
      });

      if (funcError || !data?.verification_code) {
        setError('Failed to resend verification code');
        toast.error('Failed to resend code');
        return;
      }

      // Update the expected code
      setExpectedCode(data.verification_code);
      sessionStorage.setItem('verificationCode', data.verification_code);
      
      toast.success('New code sent to your phone');
    } catch (err: any) {
      setError('Failed to resend code');
      toast.error('Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      {verified ? (
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-xl font-bold mb-2 text-green-700">Two-Factor Authentication Enabled</h2>
          <p className="text-gray-600">Your account is now more secure.</p>
          <p className="text-gray-600 mt-4">Redirecting you...</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">Verify Your Phone</h2>
          <p className="mb-4 text-gray-600">
            Enter the 6-digit verification code sent to your phone.
          </p>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            className="text-center text-xl tracking-widest mb-4"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
          />
          
          <div className="space-y-2">
            <Button className="w-full" onClick={verifyCode} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={resendCode}
              disabled={resending}
            >
              {resending ? (
                <>
                  <span className="mr-2">Resending...</span>
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Resend Code
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default VerifyTwoFactor;
