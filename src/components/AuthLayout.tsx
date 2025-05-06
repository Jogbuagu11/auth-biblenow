
import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  // Check if we're in a router context before using useLocation
  let redirectTo = '';
  
  try {
    const location = useLocation();
    redirectTo = new URLSearchParams(location.search).get('redirectTo') || '';
  } catch (error) {
    // If useLocation fails, we're not in a router context
    console.log('Not in a router context, skipping redirectTo parsing');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-md space-y-12">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-biblenow-gold mb-2">BibleNOW</h1>
            {redirectTo && (
              <div className="mt-2 text-sm text-biblenow-beige/50">
                You'll be redirected to: {decodeURIComponent(redirectTo)}
              </div>
            )}
          </div>
          <div className="auth-card animate-fade-in">
            {children}
          </div>
          <div className="h-12"></div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
