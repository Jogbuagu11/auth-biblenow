
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Mail, Phone, ArrowLeft } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

enum TwoFactorStep {
  INPUT_CONTACT,
  VERIFY_CODE
}

const TwoFactorSetup: React.FC = () => {
  const [step, setStep] = useState<TwoFactorStep>(TwoFactorStep.INPUT_CONTACT);
  const [contactInfo, setContactInfo] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactInfo) {
      toast.error('Please enter your contact information');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const isEmail = contactInfo.includes('@');
      
      if (isEmail) {
        // Send email verification code
        const { data, error } = await supabase.functions.invoke('send-verification-code', {
          body: { email: contactInfo }
        });
        
        if (error) throw new Error(error.message);
        
        toast.success('Verification code sent', {
          description: `We've sent a 6-digit code to ${contactInfo}`
        });
        
        // For demo/testing purposes, using a fixed code
        // In production, this would be handled securely on the backend
        setExpectedCode('123456');
      } else {
        // Format phone number (remove any non-digit characters)
        const phoneNumber = contactInfo.replace(/\D/g, '');
        
        if (phoneNumber.length !== 10) {
          throw new Error('Please enter a valid 10-digit phone number');
        }
        
        // Send SMS verification code
        const { data, error } = await supabase.functions.invoke('send-2fa-sms', {
          body: { phone_number: phoneNumber }
        });
        
        if (error) throw new Error(error.message);
        
        toast.success('Verification code sent', {
          description: `We've sent a 6-digit code to ${contactInfo}`
        });
        
        // For demo/testing purposes, using a fixed code
        // In production, this would come from the edge function
        setExpectedCode('123456');
      }
      
      // Move to verification step
      setStep(TwoFactorStep.VERIFY_CODE);
    } catch (err: any) {
      toast.error('Error sending verification code', {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (verificationCode !== expectedCode) {
        throw new Error('Invalid verification code. Please try again.');
      }
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { twofa_enabled: true }
      });
      
      if (error) throw new Error(error.message);
      
      toast.success('Two-Factor Authentication enabled', {
        description: 'Your account is now more secure'
      });
      
      // Redirect to edit testimony page
      window.location.href = 'https://social.biblenow.io/edit-testimony';
    } catch (err: any) {
      toast.error('Verification failed', {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderContactInput = () => (
    <form onSubmit={handleContactSubmit} className="space-y-6">
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-biblenow-gold/10 text-biblenow-gold mb-4">
          <Shield size={32} />
        </div>
        <h2 className="text-2xl font-serif font-semibold text-biblenow-brown text-center">
          Set Up Two-Factor Authentication
        </h2>
        <p className="text-center text-biblenow-brown/80 mt-2">
          Enter your email or phone number to receive a verification code
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="contactInfo" className="block text-sm font-medium text-biblenow-brown mb-1">
            Email or Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {contactInfo.includes('@') ? (
                <Mail className="h-5 w-5 text-biblenow-brown/40" />
              ) : (
                <Phone className="h-5 w-5 text-biblenow-brown/40" />
              )}
            </div>
            <input
              id="contactInfo"
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-biblenow-gold/30 rounded-md 
                        shadow-sm focus:ring-biblenow-gold focus:border-biblenow-gold 
                        bg-white text-biblenow-brown"
              placeholder="you@example.com or (555) 123-4567"
            />
          </div>
          <p className="text-xs text-biblenow-brown/60 mt-1">
            {contactInfo.includes('@')
              ? "We'll send a verification code to this email"
              : "We'll send a verification code via SMS"}
          </p>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-biblenow-gold hover:bg-biblenow-gold/80 text-white flex items-center justify-center"
        >
          {isLoading ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
          ) : (
            'Send Verification Code'
          )}
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/auth/two-factor-prompt')} 
          className="w-full border-biblenow-gold/30 text-biblenow-brown hover:bg-biblenow-gold/10 flex items-center justify-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </form>
  );
  
  const renderVerifyCode = () => (
    <form onSubmit={handleVerifyCode} className="space-y-6">
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-biblenow-gold/10 text-biblenow-gold mb-4">
          <Shield size={32} />
        </div>
        <h2 className="text-2xl font-serif font-semibold text-biblenow-brown text-center">
          Verify Your Code
        </h2>
        <p className="text-center text-biblenow-brown/80 mt-2">
          Enter the 6-digit code we sent to {contactInfo}
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-center">
          <InputOTP 
            maxLength={6}
            value={verificationCode}
            onChange={setVerificationCode}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot 
                    key={index} 
                    {...slot} 
                    index={index}
                    className="w-10 h-12 text-center text-lg border-biblenow-gold/30 focus:border-biblenow-gold focus:ring-biblenow-gold"
                  />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading || verificationCode.length !== 6} 
          className="w-full bg-biblenow-gold hover:bg-biblenow-gold/80 text-white flex items-center justify-center mt-4"
        >
          {isLoading ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
          ) : (
            'Verify Code'
          )}
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-biblenow-brown/60">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={() => setStep(TwoFactorStep.INPUT_CONTACT)}
              className="text-biblenow-gold hover:underline focus:outline-none"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    </form>
  );
  
  return (
    <div className="w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
      {step === TwoFactorStep.INPUT_CONTACT ? renderContactInput() : renderVerifyCode()}
    </div>
  );
};

export default TwoFactorSetup;
