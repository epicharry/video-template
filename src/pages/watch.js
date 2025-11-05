import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getRule34VideoSources } from "@/lib/rule34video";
import Loading from "@/components/Loading";
import Layout from "@/components/layouts";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";

const Watch = () => {
  const router = useRouter();
  const { url } = router.query;
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [videoKey, setVideoKey] = useState(0);

  const { data: sources, isLoading, error } = useQuery({
    queryKey: ["rule34-video-sources", url],
    queryFn: () => getRule34VideoSources(url),
    enabled: !!url,
  });

  const currentSource = selectedQuality
    ? sources?.find((s) => s.quality === selectedQuality)
    : sources?.[0];

  useEffect(() => {
    if (currentSource) {
      setVideoKey(prev => prev + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSource?.resolved_url]);

  if (!url) {
    return (
      <div className="text-center py-20 text-neutral-400">
        No video URL provided
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loading />
      </div>
    );
  }

  if (error || !sources || sources.length === 0) {
    return (
      <div className="text-center py-20 text-red-400">
        Failed to load video. Please try again.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <CustomVideoPlayer
            key={videoKey}
            src={currentSource?.resolved_url}
          />

          <div className="mt-4 bg-neutral-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Quality Settings</h2>
              <span className="text-sm text-neutral-400">
                Current: {currentSource?.quality}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.map((source) => (
                <button
                  key={source.quality}
                  onClick={() => setSelectedQuality(source.quality)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    (selectedQuality === source.quality || (!selectedQuality && source === sources[0]))
                      ? "bg-red-600"
                      : "bg-neutral-800 hover:bg-neutral-700"
                  }`}
                >
                  {source.quality}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-neutral-900 rounded-lg p-4">
            <h3 className="font-semibold mb-2">About this video</h3>
            <div className="text-sm text-neutral-400 space-y-1">
              <p>Source: Rule34Video</p>
              <p>Format: {currentSource?.ext?.toUpperCase()}</p>
              <p>Available qualities: {sources.map(s => s.quality).join(", ")}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-neutral-900 rounded-lg p-4">
            <h3 className="font-semibold mb-4">Related Videos</h3>
            <p className="text-sm text-neutral-400">
              Use the search feature to find more videos
            </p>
            <button
              onClick={() => router.push("/search")}
              className="mt-4 w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
            >
              Go to Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

Watch.getLayout = function getLayout(page) {
  return <Layout variant="clean">{page}</Layout>;
};

export default Watch;
