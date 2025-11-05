import axios from "axios";

const XANIMU_API_BASE = "https://harrypersonal.haryvibes.workers.dev/xanimu";

export const searchXAnimuVideos = async (query, page = 1) => {
  try {
    const response = await axios.get(XANIMU_API_BASE, {
      params: {
        action: "search",
        q: query,
        page: page,
      },
    });

    return {
      results: response.data.results || [],
      currentPage: response.data.current_page || 1,
      hasMore: response.data.results && response.data.results.length > 0,
    };
  } catch (error) {
    console.error("Error searching XAnimu videos:", error);
    throw new Error("Failed to search XAnimu videos");
  }
};

export const getXAnimuVideo = async (videoId) => {
  try {
    const response = await axios.get(XANIMU_API_BASE, {
      params: {
        action: "video",
        id: videoId,
      },
    });

    return {
      id: response.data.id,
      title: response.data.title,
      thumbnail: response.data.thumbnail,
      videoUrl: response.data.video_url,
      source: "xanimu",
    };
  } catch (error) {
    console.error("Error fetching XAnimu video:", error);
    throw new Error("Failed to fetch XAnimu video");
  }
};
