
import { createClient } from '@supabase/supabase-js'

// Debug all environment variables
console.log('All Environment Variables:', import.meta.env);

// Using the existing hardcoded values as fallbacks
const SUPABASE_URL = "https://jhlawjmyorpmafokxtuh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpobGF3am15b3JwbWFmb2t4dHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzI5MjYsImV4cCI6MjA1ODUwODkyNn0.qwGsvKP5P2kwMT9qkEA0ZxjAVUM-RIf9Do9xiPMikX4";

// Detailed debugging
console.log('Supabase Configuration:', {
  url: SUPABASE_URL,
  hasKey: !!SUPABASE_PUBLISHABLE_KEY,
  keyLength: SUPABASE_PUBLISHABLE_KEY?.length,
  keyPrefix: SUPABASE_PUBLISHABLE_KEY?.substring(0, 10) + '...',
  envKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
});

// Determine if we're running locally
const isLocalhost = window.location.hostname === 'localhost';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key) => {
        try {
          const value = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${key}=`))
            ?.split('=')[1];
          console.log('Reading cookie:', { key, hasValue: !!value });
          return value ? JSON.parse(decodeURIComponent(value)) : null;
        } catch (error) {
          console.error('Error reading cookie:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          const domain = isLocalhost ? 'localhost' : '.biblenow.io';
          const secure = !isLocalhost;
          const cookieStr = `${key}=${encodeURIComponent(JSON.stringify(value))}; domain=${domain}; path=/; ${secure ? 'secure; ' : ''}samesite=lax; max-age=${60 * 60 * 24 * 7}`;
          console.log('Setting cookie:', { key, domain, secure });
          document.cookie = cookieStr;
        } catch (error) {
          console.error('Error setting cookie:', error);
        }
      },
      removeItem: (key) => {
        try {
          const domain = isLocalhost ? 'localhost' : '.biblenow.io';
          const secure = !isLocalhost;
          console.log('Removing cookie:', { key, domain });
          document.cookie = `${key}=; domain=${domain}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${secure ? 'secure; ' : ''}samesite=lax`;
        } catch (error) {
          console.error('Error removing cookie:', error);
        }
      },
    },
    // Remove cookieOptions from here as it's not recognized in this context
  }
});
