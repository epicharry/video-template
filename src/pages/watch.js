import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getRule34VideoSources } from "@/lib/rule34video";
import { getXAnimuVideo } from "@/lib/xanimu";
import { getYoujizzVideoSources } from "@/lib/youjizz";
import { getHamsterVideoSources } from "@/lib/hamster";
import Loading from "@/components/Loading";
import Layout from "@/components/layouts";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";

const Watch = () => {
  const router = useRouter();
  const { url, id, link, source: sourceType } = router.query;
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [videoKey, setVideoKey] = useState(0);

  const isXAnimu = sourceType === "xanimu";
  const isYoujizz = sourceType === "youjizz";
  const isHamster = sourceType === "hamster";
  const isRule34 = sourceType === "rule34" || (!sourceType && url);

  const { data: rule34Data, isLoading: rule34Loading, error: rule34Error } = useQuery({
    queryKey: ["rule34-video-sources", url],
    queryFn: () => getRule34VideoSources(url),
    enabled: isRule34 && !!url,
  });

  const { data: xanimuData, isLoading: xanimuLoading, error: xanimuError } = useQuery({
    queryKey: ["xanimu-video", id],
    queryFn: () => getXAnimuVideo(id),
    enabled: isXAnimu && !!id,
  });

  const { data: youjizzData, isLoading: youjizzLoading, error: youjizzError } = useQuery({
    queryKey: ["youjizz-video-sources", id],
    queryFn: () => getYoujizzVideoSources(id),
    enabled: isYoujizz && !!id,
  });

  const { data: hamsterData, isLoading: hamsterLoading, error: hamsterError } = useQuery({
    queryKey: ["hamster-video-sources", link],
    queryFn: () => getHamsterVideoSources(link),
    enabled: isHamster && !!link,
  });

  const sources = isXAnimu ? null : isYoujizz ? youjizzData : isHamster ? hamsterData : rule34Data;
  const isLoading = isRule34 ? rule34Loading : isYoujizz ? youjizzLoading : isHamster ? hamsterLoading : xanimuLoading;
  const error = isRule34 ? rule34Error : isYoujizz ? youjizzError : isHamster ? hamsterError : xanimuError;

  const currentSource = isXAnimu
    ? null
    : selectedQuality
    ? sources?.find((s) => s.quality === selectedQuality)
    : sources?.[0];

  const videoUrl = isXAnimu ? xanimuData?.videoUrl : isYoujizz ? currentSource?.url : isHamster ? currentSource?.url : currentSource?.resolved_url;
  const videoTitle = isXAnimu ? xanimuData?.title : null;

  if (!url && !id && !link) {
    return (
      <div className="text-center py-20 text-neutral-400">
        No video provided
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

  if (error || (isRule34 && (!sources || sources.length === 0)) || (isYoujizz && (!sources || sources.length === 0)) || (isHamster && (!sources || sources.length === 0)) || (isXAnimu && !xanimuData)) {
    return (
      <div className="text-center py-20 text-red-400">
        Failed to load video. Please try again.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <div className="rounded-lg overflow-hidden">
            <CustomVideoPlayer
              src={videoUrl}
              sources={sources}
              selectedQuality={selectedQuality}
              onQualityChange={setSelectedQuality}
            />
          </div>

          {videoTitle && (
            <div className="mt-4 bg-neutral-900 rounded-lg p-4">
              <h1 className="text-xl font-semibold">{videoTitle}</h1>
            </div>
          )}

          {(isRule34 || isYoujizz || isHamster) && sources && sources.length > 0 && (
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
          )}

          <div className="mt-4 bg-neutral-900 rounded-lg p-4">
            <h3 className="font-semibold mb-2">About this video</h3>
            <div className="text-sm text-neutral-400 space-y-1">
              <p>Source: {isXAnimu ? "XAnimu" : isYoujizz ? "Youjizz" : isHamster ? "Hamster" : "Rule34Video"}</p>
              {(isRule34 || isYoujizz || isHamster) && currentSource && (
                <>
                  {isRule34 && <p>Format: {currentSource.ext?.toUpperCase()}</p>}
                  <p>Available qualities: {sources.map(s => s.quality).join(", ")}</p>
                </>
              )}
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
