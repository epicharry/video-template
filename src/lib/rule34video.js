const RULE34_API_BASE = 'https://workers-playground-fragrant-thunder-fc54.haryvibes.workers.dev';

export const searchRule34Videos = async (query, page = 1) => {
  try {
    const response = await fetch(`${RULE34_API_BASE}/?q=${encodeURIComponent(query)}&page=${page}`);

    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching Rule34 videos:', error);
    throw error;
  }
};

export const getRule34VideoSources = async (videoUrl) => {
  try {
    const response = await fetch(`${RULE34_API_BASE}/?url=${encodeURIComponent(videoUrl)}`);

    if (!response.ok) {
      throw new Error('Failed to fetch video sources');
    }

    const sources = await response.json();

    const qualityOrder = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p'];
    sources.sort((a, b) => {
      const aIndex = qualityOrder.indexOf(a.quality);
      const bIndex = qualityOrder.indexOf(b.quality);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    return sources;
  } catch (error) {
    console.error('Error fetching Rule34 video sources:', error);
    throw error;
  }
};

export const getHighestQualitySource = async (videoUrl) => {
  const sources = await getRule34VideoSources(videoUrl);
  return sources[0]?.resolved_url || null;
};
