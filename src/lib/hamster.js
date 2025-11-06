const HAMSTER_API_BASE = 'https://harrypersonal.haryvibes.workers.dev/hamster';

export const searchHamsterVideos = async (query, page = 1) => {
  try {
    const url = `${HAMSTER_API_BASE}?q=${encodeURIComponent(query)}&page=${page}`;
    console.log('Fetching Hamster:', url);

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
    console.log('Hamster search response:', data);

    return {
      query: data.query,
      page: data.current_page,
      results: data.results || [],
      hasMore: data.next_page !== null,
    };
  } catch (error) {
    console.error('Error searching Hamster videos:', error);
    throw error;
  }
};

export const getHamsterVideoSources = async (videoLink) => {
  try {
    // Extract just the path from the full URL if needed
    let videoPath = videoLink;
    if (videoLink.includes('://')) {
      const urlObj = new URL(videoLink);
      videoPath = urlObj.pathname;
    }

    const url = `${HAMSTER_API_BASE}?v=${encodeURIComponent(videoPath)}`;
    console.log('Fetching Hamster video sources:', url);

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
    console.log('Hamster video sources:', data);

    if (!data.qualities) {
      throw new Error('Invalid response from Hamster API');
    }

    const qualityOrder = ['2160p', '1080p', '720p', '480p', '240p', '144p'];
    const sources = Object.entries(data.qualities)
      .map(([quality, url]) => ({
        quality,
        url,
        name: quality,
      }))
      .sort((a, b) => {
        const aIndex = qualityOrder.indexOf(a.quality);
        const bIndex = qualityOrder.indexOf(b.quality);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });

    return sources;
  } catch (error) {
    console.error('Error fetching Hamster video sources:', error);
    throw error;
  }
};

export const getHighestQualitySource = async (videoLink) => {
  const sources = await getHamsterVideoSources(videoLink);
  return sources[0]?.url || null;
};
