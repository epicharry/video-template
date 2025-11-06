const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const HAMSTER_PROXY_URL = `${SUPABASE_URL}/functions/v1/hamster-proxy`;

export const searchHamsterVideos = async (query, page = 1) => {
  try {
    const url = `${HAMSTER_PROXY_URL}?q=${encodeURIComponent(query)}&page=${page}`;
    console.log('Fetching Hamster via proxy:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
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
      videos: data.results || [],
      hasMore: data.next_page !== null,
    };
  } catch (error) {
    console.error('Error searching Hamster videos:', error);
    throw error;
  }
};

export const getHamsterVideoSources = async (videoLink) => {
  try {
    const url = `${HAMSTER_PROXY_URL}?v=${encodeURIComponent(videoLink)}`;
    console.log('Fetching Hamster video sources via proxy:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
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
