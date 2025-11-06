import SignedOutUI from "@/components/signed-out/history";
import VideoCard from "@/components/VideoCard";
import { useUser } from "@/contexts/UserContext";
import { fetchHistory, removeFromHistory } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

const menuItems = [{ icon: Trash2, label: "Remove", id: "history" }];

const History = () => {
  const { user } = useUser();

  const { data: historyData, refetch } = useQuery({
    queryKey: ['watch-history', user?.id],
    queryFn: () => fetchHistory(user?.id),
    enabled: !!user?.id,
  });

  const { mutate } = useMutation({
    mutationFn: async ({ videoId }) => {
      await removeFromHistory(user.id, videoId);
      return { videoId };
    },
    onSuccess: () => {
      refetch();
    },
  });

  if (!user) {
    return <SignedOutUI />;
  }

  let noHistoryVids = (
    <p className="italic text-neutral-400">
      Your watched history will be available here.
    </p>
  );

  return (
    <div>
      <h1 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-1">
        History
      </h1>
      <div className="space-y-4 mt-4 max-w-3xl">
        {historyData && historyData.length > 0
          ? historyData.map((item) => (
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
          : noHistoryVids}
      </div>
    </div>
  );
};

export default History;
