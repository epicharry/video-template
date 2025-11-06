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
    const { userId, videoData } = await req.json();

    if (!userId || !videoData) {
      return new Response(
        JSON.stringify({ error: 'userId and videoData are required' }),
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

    const slug = videoData.slug || `external-${videoData.source}-${videoData.externalId}`;

    const { data: existingVideo } = await supabase
      .from('videos')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingVideo) {
      await saveToHistory(supabase, userId, existingVideo.id);
      return new Response(
        JSON.stringify({ videoId: existingVideo.id }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: systemUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'system')
      .maybeSingle();

    let systemUserId = systemUser?.id;

    if (!systemUserId) {
      const { data: newSystemUser } = await supabase
        .from('users')
        .insert([{
          username: 'system',
          password_hash: 'external_videos_placeholder',
          avatar_url: '/default-user.jpg'
        }])
        .select('id')
        .single();

      systemUserId = newSystemUser?.id;
    }

    const { data: newVideo, error: insertError } = await supabase
      .from('videos')
      .insert([{
        user_id: systemUserId,
        title: videoData.title,
        description: videoData.description || '',
        slug: slug,
        video_url: videoData.videoUrl,
        thumbnail_url: videoData.thumbnail,
        duration: videoData.duration || 0,
        views: 0
      }])
      .select('id')
      .single();

    if (insertError) {
      throw insertError;
    }

    await saveToHistory(supabase, userId, newVideo.id);

    return new Response(
      JSON.stringify({ videoId: newVideo.id }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error saving external video:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to save external video' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function saveToHistory(supabase: any, userId: string, videoId: string) {
  const { data: existingHistory } = await supabase
    .from('watch_history')
    .select('id')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .maybeSingle();

  if (existingHistory) {
    await supabase
      .from('watch_history')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', existingHistory.id);
  } else {
    await supabase
      .from('watch_history')
      .insert([{ user_id: userId, video_id: videoId }]);
  }
}