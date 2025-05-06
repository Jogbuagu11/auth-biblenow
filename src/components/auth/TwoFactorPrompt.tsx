
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const TwoFactorPrompt: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and if 2FA is already set up
    const checkUserStatus = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        // No session, redirect to login
        navigate('/login');
        return;
      }
      
      // Check if 2FA is already enabled
      const twoFaEnabled = data.session.user?.user_metadata?.twofa_enabled;
      const twoFaSkipped = data.session.user?.user_metadata?.twofa_skipped;
      
      if (twoFaEnabled) {
        // 2FA already enabled, redirect to main app
        window.location.href = 'https://social.biblenow.io/edit-testimony';
        return;
      } else if (twoFaSkipped) {
        // 2FA was skipped, redirect to main app
        window.location.href = 'https://social.biblenow.io/edit-testimony';
        return;
      }
      
      setLoading(false);
    };
    
    checkUserStatus();
  }, [navigate]);

  const handleSetup = () => {
    navigate('/auth/setup-2fa');
  };

  const handleSkip = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { twofa_skipped: true }
      });
      
      if (error) {
        console.error('Error updating user:', error);
        setLoading(false);
        return;
      }
      
      window.location.href = 'https://social.biblenow.io/edit-testimony';
    } catch (err) {
      console.error('Error skipping 2FA:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-[380px]">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-biblebrown-600" />
          </div>
          <CardTitle className="text-2xl text-center">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-center">
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.
          </p>
          <div className="rounded-lg bg-biblebrown-50 p-3">
            <h3 className="font-medium text-biblebrown-900 mb-1">Why use 2FA?</h3>
            <ul className="list-disc pl-5 text-sm text-biblebrown-700 space-y-1">
              <li>Protect your account from unauthorized access</li>
              <li>Verify your identity using your phone</li>
              <li>Prevent others from accessing your personal information</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleSetup}>
            Set Up Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full" onClick={handleSkip}>
            Skip for Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TwoFactorPrompt;
