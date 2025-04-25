
import React, { useState } from "react";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/useApi";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const CheckEmail: React.FC = () => {
  const [isResending, setIsResending] = useState(false);
  const { sendVerificationCode } = useApi();
  const { user } = useAuth();

  const handleResendEmail = async () => {
    if (!user?.email) {
      toast.error("No email found. Please sign up again.");
      return;
    }

    setIsResending(true);
    const result = await sendVerificationCode(user.email);
    
    if (result.error) {
      toast.error("Failed to resend verification email", {
        description: result.error
      });
    } else {
      toast.success("Verification email resent", {
        description: "Please check your inbox"
      });
    }
    
    setIsResending(false);
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center space-y-6 px-4 py-8">
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="text-biblenow-gold mb-2">
          <rect width="24" height="24" rx="12" fill="currentColor" fillOpacity="0.1"/>
          <path stroke="currentColor" strokeWidth="2" d="M4 8.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8.5M4 8.5 12 14l8-5.5M4 8.5 12 14M12 14l8-5.5"/>
        </svg>
        <h1 className="text-2xl font-bold text-biblenow-gold text-center">Confirmation Email Sent</h1>
        <p className="text-center text-biblenow-beige/70">
          Please check your email for a confirmation link. Once you confirm, you can sign in!
        </p>
        <p className="text-sm text-biblenow-beige/50 text-center">
          Didn't receive the email?
        </p>
        <Button 
          onClick={handleResendEmail} 
          disabled={isResending}
          variant="outline"
          className="mt-4"
        >
          {isResending ? "Resending..." : "Resend"}
        </Button>
      </div>
    </AuthLayout>
  );
};

export default CheckEmail;
