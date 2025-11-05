import { supabase } from './supabase';
import toast from 'react-hot-toast';
import { searchYoujizzVideos, getYoujizzVideoSources, getHighestQualitySource as getYoujizzHighestQuality } from './youjizz';
import { searchXAnimuVideos, getXAnimuVideo } from './xanimu';
import { searchRule34Videos, getRule34VideoSources, getHighestQualitySource as getRule34HighestQuality } from './rule34video';

export const getAllVideos = async () => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profile:profiles(username, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

export const getUserVideos = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user videos:', error);
    return [];
  }
};

export const getVideoBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profile:profiles(id, username, avatar_url)
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching video:', error);
    return null;
  }
};

export const likeVideo = async (userId, videoId) => {
  try {
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
      toast.success('Removed from liked videos');
    } else {
      const { error } = await supabase
        .from('video_likes')
        .insert([{ user_id: userId, video_id: videoId }]);

      if (error) throw error;
      toast.success('Added to liked videos');
    }
  } catch (error) {
    console.error('Error liking video:', error);
    toast.error('Failed to update like');
  }
};

export const saveToWatchLater = async (userId, videoId) => {
  try {
    const { data: existingSave } = await supabase
      .from('watch_later')
      .select('id')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .maybeSingle();

    if (existingSave) {
      const { error } = await supabase
        .from('watch_later')
        .delete()
        .eq('id', existingSave.id);

      if (error) throw error;
      toast.success('Removed from watch later');
    } else {
      const { error } = await supabase
        .from('watch_later')
        .insert([{ user_id: userId, video_id: videoId }]);

      if (error) throw error;
      toast.success('Saved to watch later');
    }
  } catch (error) {
    console.error('Error saving to watch later:', error);
    toast.error('Failed to save');
  }
};

export const saveHistory = async (userId, videoId) => {
  try {
    if (!userId) return;

    const { data: existingHistory } = await supabase
      .from('watch_history')
      .select('id')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .maybeSingle();

    if (existingHistory) {
      const { error } = await supabase
        .from('watch_history')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', existingHistory.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('watch_history')
        .insert([{ user_id: userId, video_id: videoId }]);

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error saving history:', error);
  }
};

export const fetchHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('watch_history')
      .select(`
        *,
        video:videos(
          *,
          profile:profiles(username, avatar_url)
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
};

export const removeFromHistory = async (userId, videoId) => {
  try {
    const { error } = await supabase
      .from('watch_history')
      .delete()
      .eq('user_id', userId)
      .eq('video_id', videoId);

    if (error) throw error;
    toast.success('Removed from history');
  } catch (error) {
    console.error('Error removing from history:', error);
    toast.error('Failed to remove from history');
  }
};

export const getLikedVideos = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('video_likes')
      .select(`
        *,
        video:videos(
          *,
          profile:profiles(username, avatar_url)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching liked videos:', error);
    return [];
  }
};

export const getWatchLater = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('watch_later')
      .select(`
        *,
        video:videos(
          *,
          profile:profiles(username, avatar_url)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching watch later:', error);
    return [];
  }
};

export const subscribe = async (subscriberId, channelId) => {
  try {
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('subscriber_id', subscriberId)
      .eq('channel_id', channelId)
      .maybeSingle();

    if (existingSub) {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', existingSub.id);

      if (error) throw error;
      toast.success('Unsubscribed');
      return false;
    } else {
      const { error } = await supabase
        .from('subscriptions')
        .insert([{ subscriber_id: subscriberId, channel_id: channelId }]);

      if (error) throw error;
      toast.success('Subscribed');
      return true;
    }
  } catch (error) {
    console.error('Error subscribing:', error);
    toast.error('Failed to update subscription');
    return null;
  }
};

export const getSubscriptionStatus = async (subscriberId, channelId) => {
  try {
    const { data } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('subscriber_id', subscriberId)
      .eq('channel_id', channelId)
      .maybeSingle();

    return !!data;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};

export const getMySubscriptions = async (subscriberId) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        channel:profiles!subscriptions_channel_id_fkey(id, username, avatar_url)
      `)
      .eq('subscriber_id', subscriberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
};

export const getSubscriberCount = async (channelId) => {
  try {
    const { count, error } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('channel_id', channelId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching subscriber count:', error);
    return 0;
  }
};

export const searchExternalVideos = async (query, page = 1, source = 'youjizz') => {
  try {
    switch (source.toLowerCase()) {
      case 'youjizz':
        return await searchYoujizzVideos(query, page);
      case 'xanimu':
        return await searchXAnimuVideos(query, page);
      case 'rule34':
        return await searchRule34Videos(query, page);
      default:
        throw new Error(`Unknown source: ${source}`);
    }
  } catch (error) {
    console.error(`Error searching ${source} videos:`, error);
    throw error;
  }
};

export const getExternalVideoSources = async (videoId, source = 'youjizz') => {
  try {
    switch (source.toLowerCase()) {
      case 'youjizz':
        return await getYoujizzVideoSources(videoId);
      case 'xanimu':
        return await getXAnimuVideo(videoId);
      case 'rule34':
        return await getRule34VideoSources(videoId);
      default:
        throw new Error(`Unknown source: ${source}`);
    }
  } catch (error) {
    console.error(`Error getting ${source} video sources:`, error);
    throw error;
  }
};

export const getExternalHighestQuality = async (videoId, source = 'youjizz') => {
  try {
    switch (source.toLowerCase()) {
      case 'youjizz':
        return await getYoujizzHighestQuality(videoId);
      case 'xanimu':
        const video = await getXAnimuVideo(videoId);
        return video.videoUrl;
      case 'rule34':
        return await getRule34HighestQuality(videoId);
      default:
        throw new Error(`Unknown source: ${source}`);
    }
  } catch (error) {
    console.error(`Error getting ${source} highest quality:`, error);
    throw error;
  }
};
