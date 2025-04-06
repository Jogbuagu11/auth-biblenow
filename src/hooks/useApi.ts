
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Base Function URL
const FUNCTION_URL = 'https://jhlawjmyorpmafokxtuh.supabase.co/functions/v1';

// Type for API response
type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

export const useApi = () => {
  // Send verification code to email
  const sendVerificationCode = async (email: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { email },
      });

      if (error) {
        return { data: null, error: error.message, loading: false };
      }

      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err.message || 'An error occurred', loading: false };
    }
  };

  // Verify email with code
  const verifyEmailCode = async (email: string, code: string): Promise<ApiResponse<{ verified: boolean }>> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-email-code', {
        body: { email, code },
      });

      if (error) {
        return { data: null, error: error.message, loading: false };
      }

      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err.message || 'An error occurred', loading: false };
    }
  };

  // Setup 2FA
  const setup2FA = async (user_id: string, phone_number: string): Promise<ApiResponse<{ success: boolean, verification_code: string }>> => {
    try {
      const { data, error } = await supabase.functions.invoke('setup-2fa', {
        body: { user_id, phone_number },
      });

      if (error) {
        return { data: null, error: error.message, loading: false };
      }

      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err.message || 'An error occurred', loading: false };
    }
  };

  // Verify 2FA code
  const verify2FACode = async (user_id: string, code: string, expected_code: string): Promise<ApiResponse<{ verified: boolean }>> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa-code', {
        body: { user_id, code, expected_code },
      });

      if (error) {
        return { data: null, error: error.message, loading: false };
      }

      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err.message || 'An error occurred', loading: false };
    }
  };

  // Skip 2FA
  const skip2FA = async (user_id: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const { data, error } = await supabase.functions.invoke('skip-2fa', {
        body: { user_id },
      });

      if (error) {
        return { data: null, error: error.message, loading: false };
      }

      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err.message || 'An error occurred', loading: false };
    }
  };

  // Request password reset
  const requestPasswordReset = async (email: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const { data, error } = await supabase.functions.invoke('password-reset-request', {
        body: { email },
      });

      if (error) {
        return { data: null, error: error.message, loading: false };
      }

      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err.message || 'An error occurred', loading: false };
    }
  };

  // Create Supabase user with user metadata
  const createUserWithMetadata = async (
    email: string, 
    password: string, 
    metadata: any
  ): Promise<ApiResponse<any>> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        }
      });

      if (error) {
        return { data: null, error: error.message, loading: false };
      }

      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err.message || 'An error occurred', loading: false };
    }
  };

  // Reset password
  const resetPassword = async (email: string, password: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      // We use the updateUser method which requires the user to be authenticated
      // with a session from the password reset email
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return { data: null, error: error.message, loading: false };
      }

      return { data: { success: true }, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err.message || 'An error occurred', loading: false };
    }
  };

  return {
    sendVerificationCode,
    verifyEmailCode,
    setup2FA,
    verify2FACode,
    skip2FA,
    requestPasswordReset,
    createUserWithMetadata,
    resetPassword,
  };
};
