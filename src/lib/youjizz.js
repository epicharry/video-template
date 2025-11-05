const YOUJIZZ_API_BASE = 'https://harrypersonal.haryvibes.workers.dev/youjizz';

export const searchYoujizzVideos = async (query, page = 1) => {
  try {
    const url = `${YOUJIZZ_API_BASE}?action=search&q=${encodeURIComponent(query)}&page=${page}`;
    console.log('Fetching Youjizz:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Youjizz search response:', data);
    return data;
  } catch (error) {
    console.error('Error searching Youjizz videos:', error);
    throw error;
  }
};

export const getYoujizzVideoSources = async (videoId) => {
  try {
    const url = `${YOUJIZZ_API_BASE}?action=download&id=${videoId}`;
    console.log('Fetching Youjizz video sources:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video sources: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Youjizz video sources:', data);

    if (data.status !== 'success' || !data.video_links) {
      throw new Error('Invalid response from Youjizz API');
    }

    const qualityOrder = ['1080p', '720p', '480p', '360p', '240p'];
    const sources = data.video_links.sort((a, b) => {
      const aIndex = qualityOrder.indexOf(a.quality);
      const bIndex = qualityOrder.indexOf(b.quality);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    return sources;
  } catch (error) {
    console.error('Error fetching Youjizz video sources:', error);
    throw error;
  }
};

export const getHighestQualitySource = async (videoId) => {
  const sources = await getYoujizzVideoSources(videoId);
  return sources[0]?.url || null;
};
