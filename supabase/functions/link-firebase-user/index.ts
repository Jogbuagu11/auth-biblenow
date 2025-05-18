
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idToken } = await req.json();
    
    if (!idToken) {
      return new Response(
        JSON.stringify({ error: 'Firebase ID token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the Firebase ID token by using the admin API
    const verifyTokenResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${Deno.env.get('FIREBASE_API_KEY')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });
    
    if (!verifyTokenResponse.ok) {
      const errorData = await verifyTokenResponse.json();
      console.error('Firebase token verification failed:', errorData);
      return new Response(
        JSON.stringify({ error: 'Invalid Firebase token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const tokenData = await verifyTokenResponse.json();
    if (!tokenData.users || tokenData.users.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid Firebase user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const firebaseUser = tokenData.users[0];
    const phoneNumber = firebaseUser.phoneNumber;
    
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number not found in Firebase token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user exists in Supabase
    const { data: existingUsers, error: queryError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('phone', phoneNumber)
      .limit(1);
      
    let userId;
    
    if (queryError) {
      console.error('Error querying user:', queryError);
    }
    
    if (existingUsers && existingUsers.length > 0) {
      // User exists, get their ID
      userId = existingUsers[0].user_id;
    } else {
      // Create new user in Supabase
      const { data, error: createError } = await supabase.auth.admin.createUser({
        phone: phoneNumber,
        phone_confirm: true,
        user_metadata: {
          phone_verified: true,
          provider: 'firebase',
        },
      });
      
      if (createError) {
        console.error('Error creating user:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user in Supabase' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      userId = data.user.id;
      
      // Create profile entry if it doesn't exist yet
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          phone: phoneNumber,
        });
        
      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }
    
    // Create a Supabase session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: userId
    });
    
    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the session
    return new Response(
      JSON.stringify({ 
        session: {
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error in link-firebase-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
