
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  "https://jhlawjmyorpmafokxtuh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpobGF3am15b3JwbWFmb2t4dHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzI5MjYsImV4cCI6MjA1ODUwODkyNn0.qwGsvKP5P2kwMT9qkEA0ZxjAVUM-RIf9Do9xiPMikX4", 
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      // The redirectTo option should be in the signUp/signIn options, not in the client config
      // It will be passed to the respective auth methods when needed
    }
  }
);
