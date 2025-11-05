import { getUserVideos } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import { useQuery } from "@tanstack/react-query";
import { formatDistance } from "date-fns";
import Link from "next/link";
import Loading from "../Loading";
import VideoPlayer from "../VideoPlayer";

const MyVideos = () => {
  const { user } = useUser();
  const { isPending, error, data } = useQuery({
    queryKey: ["user-uploaded-videos", user?.id],
    queryFn: () => getUserVideos(user?.id),
    enabled: !!user?.id,
  });

  const videos = data?.map((video) => (
    <Link key={video.id} href={`/video/${video.slug}`} className="space-y-1">
      <div>
        <VideoPlayer src={video.hls_url || video.video_url} />
      </div>
      <h3 className="text-sm font-medium">{video.title}</h3>
      <p className="text-xs text-neutral-400">
        {formatDistance(new Date(video.created_at), new Date(), {
          addSuffix: true,
        })}
      </p>
    </Link>
  ));

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <p>Something went wrong!</p>;
  }

  const renderVideos = (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos}
    </div>
  );
  const noVideoMessage = (
    <p className="text-xs text-neutral-400">
      No media uplaoded yet! Please upload a video to view here.
    </p>
  );

  return <div>{videos?.length > 0 ? renderVideos : noVideoMessage}</div>;
};

export default MyVideos;
