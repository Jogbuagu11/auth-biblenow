
import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get('redirectTo') || '';

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-biblenow-gold mb-2">BibleNOW</h1>
            <p className="text-biblenow-beige/70 max-w-sm mx-auto">
              Your gateway to all BibleNOW services
            </p>
            {redirectTo && (
              <div className="mt-2 text-sm text-biblenow-beige/50">
                You'll be redirected to: {decodeURIComponent(redirectTo)}
              </div>
            )}
          </div>
          <div className="auth-card animate-fade-in">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
