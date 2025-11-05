import SubAccountDescription from "@/components/account/SubAccountDescription";
import SubActions from "@/components/account/SubActions";
import { supabase } from "@/lib/supabase";
import { getUserVideos } from "@/lib/api";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading";

const Subscription = () => {
  const { query } = useRouter();
  const channelId = query.id;

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['channel-profile', channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', channelId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!channelId,
  });

  const { data: videosData } = useQuery({
    queryKey: ['channel-videos', channelId],
    queryFn: () => getUserVideos(channelId),
    enabled: !!channelId,
  });

  if (profileLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loading />
      </div>
    );
  }

  if (!profileData) {
    return <div className="text-center py-20">Channel not found</div>;
  }

  return (
    <div className="lg:pl-12 space-y-4">
      <SubAccountDescription
        channelUser={{
          id: profileData.id,
          username: profileData.username,
          email: '',
        }}
        preview={profileData.avatar_url || "/default-user.jpg"}
      />
      {videosData && <SubActions videos={videosData} />}
    </div>
  );
};

export default Subscription;
