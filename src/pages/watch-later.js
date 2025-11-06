import SignedOutUI from "@/components/signed-out/SavedVideos";
import VideoCard from "@/components/VideoCard";
import { useUser } from "@/contexts/UserContext";
import { getWatchLater, saveToWatchLater } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

const menuItems = [{ icon: Trash2, label: "Remove", id: "save" }];

const WatchLater = () => {
  const { user } = useUser();

  const { data: watchLaterData, refetch } = useQuery({
    queryKey: ['watch-later', user?.id],
    queryFn: () => getWatchLater(user?.id),
    enabled: !!user?.id,
  });

  const { mutate } = useMutation({
    mutationFn: async ({ videoId }) => {
      await saveToWatchLater(user.id, videoId);
      return { videoId };
    },
    onSuccess: () => {
      refetch();
    },
  });

  if (!user) {
    return <SignedOutUI />;
  }

  let noSavedVids = (
    <p className="italic text-neutral-400">
      Your saved videos will be available here.
    </p>
  );

  return (
    <div>
      <h1 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-1">
        Saved Videos
      </h1>
      <div className="space-y-4 mt-4 max-w-3xl">
        {watchLaterData && watchLaterData.length > 0
          ? watchLaterData.map((item) => (
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
          : noSavedVids}
      </div>
    </div>
  );
};

export default WatchLater;
