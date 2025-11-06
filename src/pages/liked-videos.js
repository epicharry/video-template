import SignedOutUI from "@/components/signed-out/LikedVideos";
import VideoCard from "@/components/VideoCard";
import { useUser } from "@/contexts/UserContext";
import { getLikedVideos, likeVideo as likeVideoAPI, saveToWatchLater } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Timer, Trash2 } from "lucide-react";

const menuItems = [
  { icon: Trash2, label: "Remove", id: "like" },
  { icon: Timer, label: "Add to Watch Later", id: "save" },
];

const LikedVideos = () => {
  const { user } = useUser();
  const router = useRouter();

  const { data: likedData, refetch } = useQuery({
    queryKey: ['liked-videos', user?.id],
    queryFn: () => getLikedVideos(user?.id),
    enabled: !!user?.id,
  });

  const { mutate } = useMutation({
    mutationFn: async ({ videoId, action }) => {
      if (action === "like") {
        await likeVideoAPI(user.id, videoId);
      } else if (action === "save") {
        await saveToWatchLater(user.id, videoId);
      }
      return { videoId, action };
    },
    onSuccess: () => {
      refetch();
    },
  });

  if (!user) {
    return <SignedOutUI />;
  }

  let noLikedVids = (
    <p className="italic text-neutral-400">
      Your liked videos will be available here.
    </p>
  );

  return (
    <div>
      <h1 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-1">
        Liked Videos
      </h1>
      <div className="space-y-4 mt-4 max-w-3xl">
        {likedData && likedData.length > 0
          ? likedData.map((item) => (
              <VideoCard
                key={item.video.id}
                vid={item.video}
                uploader={{
                  uploaderName: item.video.user?.username,
                  uploaderAvatar: item.video.user?.avatar_url,
                }}
                menuItems={menuItems}
                mutate={mutate}
              />
            ))
          : noLikedVids}
      </div>
    </div>
  );
};

export default LikedVideos;
