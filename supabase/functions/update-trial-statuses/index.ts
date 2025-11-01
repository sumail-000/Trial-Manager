// Supabase Edge Function to batch update trial statuses
// This should be triggered via a cron job (pg_cron or external scheduler)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing environment variables');
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Call the batch update function
    const { error } = await supabase.rpc('batch_update_trial_statuses');

    if (error) {
      console.error('Error updating trial statuses:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get count of updated trials
    const { count, error: countError } = await supabase
      .from('trials')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'cancelled');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Trial statuses updated successfully',
        trialsChecked: count ?? 0,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in update-trial-statuses function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

