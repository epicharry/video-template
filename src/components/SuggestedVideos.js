import { getAllVideos } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ListVideo } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Loading from "./Loading";
import Description from "./VideoBanner/Description";
import VideoPlayer from "./VideoPlayer";
import { useRouter } from "next/router";

const SuggestedVideos = () => {
  const { query } = useRouter();
  const currentSlug = query.videoSlug;

  const { status, data, error, isFetching } = useQuery({
    queryKey: ['all-videos'],
    queryFn: getAllVideos,
  });

  let fetchingVideos = (
    <div className="flex justify-center mt-12">
      <Loading />
    </div>
  );

  let display = (videoURL) =>
    !videoURL ? (
      <Image
        src="/placeholder.jpg"
        alt="sample-image"
        fill
        className="object-cover"
      />
    ) : (
      <VideoPlayer src={videoURL} className="w-full h-full object-cover" />
    );

  let suggested = () =>
    data?.filter(vid => vid.slug !== currentSlug).map((vid) => {
      return (
        <Link href={`/video/${vid.slug}`} key={vid.id} className="flex gap-2">
          <div className="relative h-20 lg:h-24 lg:24 w-full max-w-32 lg:max-w-40 flex-shrink-0 rounded-lg overflow-hidden">
            {display(vid.hls_url || vid.video_url)}
          </div>
          <Description
            title={vid.title}
            channelName={vid.profile?.username}
            uploadDate={formatDistanceToNow(new Date(vid.created_at), {
              addSuffix: true,
            })}
          />
        </Link>
      );
    });

  return (
    <div className="space-y-4">
      <h3 className="text-lg flex items-center gap-1">
        <ListVideo />
        Suggested Videos
      </h3>
      {isFetching && fetchingVideos}
      {!isFetching && error && <p>Failed to get videos!</p>}
      {status === "success" && data && data.length > 0 && (
        <div className="flex flex-col gap-2">{suggested()}</div>
      )}
    </div>
  );
};

export default SuggestedVideos;
