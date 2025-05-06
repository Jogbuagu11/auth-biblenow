
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import CallbackHandler from "./components/auth/CallbackHandler";
import TwoFactorPrompt from "./components/auth/TwoFactorPrompt";
import TwoFactorSetup from "./components/auth/TwoFactorSetup";
import VerifyTwoFactor from "./components/auth/VerifyTwoFactor";
import CheckEmail from "./pages/CheckEmail";
import EmailConfirmed from "./pages/EmailConfirmed";
import ForgotPassword from "./pages/ForgotPassword";
import PasswordUpdate from "./pages/PasswordUpdate";
import ExpiredReset from "./pages/ExpiredReset";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/auth/callback" element={<CallbackHandler />} />
          <Route path="/auth/two-factor-prompt" element={<TwoFactorPrompt />} />
          <Route path="/auth/setup-2fa" element={<TwoFactorSetup />} />
          <Route path="/auth/verify-2fa" element={<VerifyTwoFactor />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/email-confirmed" element={<EmailConfirmed />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/password-update" element={<PasswordUpdate />} />
          <Route path="/expired-reset" element={<ExpiredReset />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
