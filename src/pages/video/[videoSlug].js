import Layout from "@/components/layouts";
import MainVideoPlayer from "@/components/MainVideoPlayer";
import SuggestedVideos from "@/components/SuggestedVideos";
import VideoDescription from "@/components/VideoDescription";
import { getVideoBySlug } from "@/lib/api";
import React from "react";

const VideoName = ({ video, error }) => {
  if (error || !video) {
    return <div className="text-center py-20">Video not found</div>;
  }

  return (
    <div className="lg:grid lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8 rounded-lg shadow overflow-hidden">
        <MainVideoPlayer media={video} />
        <VideoDescription media={video} />
      </div>
      <div className="col-span-4 rounded-lg shadow overflow-hidden">
        <SuggestedVideos />
      </div>
    </div>
  );
};

VideoName.getLayout = function getLayout(page) {
  return <Layout variant="clean">{page}</Layout>;
};

export async function getServerSideProps({ params }) {
  try {
    const video = await getVideoBySlug(params.videoSlug);
    if (!video) {
      return { props: { error: "Video not found" } };
    }
    return { props: { video } };
  } catch (error) {
    console.error('Error fetching video:', error);
    return { props: { error: "Failed to fetch video" } };
  }
}

export default VideoName;
