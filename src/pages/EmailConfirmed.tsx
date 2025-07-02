import React from "react";

const EmailConfirmed: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-biblenow-brown">
    <div className="auth-card w-full max-w-md p-8 flex flex-col items-center">
      <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="text-biblenow-gold mb-4">
        <rect width="24" height="24" rx="12" fill="currentColor" fillOpacity="0.1"/>
        <path stroke="currentColor" strokeWidth="2" d="M4 8.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8.5M4 8.5 12 14l8-5.5M4 8.5 12 14M12 14l8-5.5"/>
      </svg>
      <h1 className="text-2xl font-bold text-biblenow-gold text-center mb-4">Your Email has been Confirmed</h1>
      <p className="text-center text-biblenow-beige/70 mb-8">
        You may now close this window.
      </p>
    </div>
  </div>
);

export default EmailConfirmed;
