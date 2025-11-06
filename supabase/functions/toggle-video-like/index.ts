import { createClient } from 'npm:@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { userId, videoId } = await req.json();

    if (!userId || !videoId) {
      return new Response(
        JSON.stringify({ error: 'userId and videoId are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: existingLike } = await supabase
      .from('video_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .maybeSingle();

    if (existingLike) {
      const { error } = await supabase
        .from('video_likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ liked: false, message: 'Video unliked successfully' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      const { error } = await supabase
        .from('video_likes')
        .insert([{ user_id: userId, video_id: videoId }]);

      if (error) throw error;

      return new Response(
        JSON.stringify({ liked: true, message: 'Video liked successfully' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error toggling video like:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to toggle video like' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});