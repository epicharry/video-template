import { supabase } from './supabase';
import toast from 'react-hot-toast';
import { searchYoujizzVideos, getYoujizzVideoSources, getHighestQualitySource as getYoujizzHighestQuality } from './youjizz';
import { searchXAnimuVideos, getXAnimuVideo } from './xanimu';
import { searchRule34Videos, getRule34VideoSources, getHighestQualitySource as getRule34HighestQuality } from './rule34video';
import { searchHamsterVideos, getHamsterVideoSources, getHighestQualitySource as getHamsterHighestQuality } from './hamster';

export const getAllVideos = async () => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        user:users(username, avatar_url)
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
        user:users(id, username, avatar_url)
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
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/toggle-video-like`;
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId, videoId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle video like');
    }

    const result = await response.json();

    if (result.liked) {
      toast.success('Added to liked videos');
    } else {
      toast.success('Removed from liked videos');
    }

    return result.liked;
  } catch (error) {
    console.error('Error liking video:', error);
    toast.error('Failed to update like');
    return null;
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

export const saveExternalVideoToHistory = async (userId, videoData) => {
  try {
    if (!userId) return null;

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-external-video`;
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId, videoData })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save external video');
    }

    const result = await response.json();
    return result.videoId;
  } catch (error) {
    console.error('Error saving external video to history:', error);
    return null;
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
          user:users(username, avatar_url)
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
          user:users(username, avatar_url)
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
          user:users(username, avatar_url)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false});

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching watch later:', error);
    return [];
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
      case 'hamster':
        return await searchHamsterVideos(query, page);
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
      case 'hamster':
        return await getHamsterVideoSources(videoId);
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
      case 'hamster':
        return await getHamsterHighestQuality(videoId);
      default:
        throw new Error(`Unknown source: ${source}`);
    }
  } catch (error) {
    console.error(`Error getting ${source} highest quality:`, error);
    throw error;
  }
};
