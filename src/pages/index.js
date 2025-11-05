import VideoPlayer from "@/components/VideoPlayer";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

export default function Home({ allVideos, error }) {
  if (error) {
    return <div className="text-center py-20">Error loading videos</div>;
  }

  if (!allVideos || allVideos.length === 0) {
    return <div className="text-center py-20 text-neutral-400">No videos available</div>;
  }

  let videos = allVideos.map((video) => (
    <Link key={video.id} href={`/video/${video.slug}`}>
      <div>
        <VideoPlayer src={video.hls_url || video.video_url} />
      </div>
      <div className="flex gap-2 mt-3 text-sm">
        <Image
          src={video.profile?.avatar_url ?? "/default-user.jpg"}
          alt="default user image"
          width={35}
          height={35}
          className="rounded-full self-baseline"
        />
        <div>
          <h3 className="tracking-wide">{video.title}</h3>
          <p className="text-neutral-400">{video.profile?.username}</p>
        </div>
      </div>
    </Link>
  ));

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-2 gap-y-8">
      {videos}
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profile:profiles(username, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { props: { allVideos: data || [] } };
  } catch (error) {
    console.error('Error fetching videos:', error);
    return { props: { allVideos: [], error: "Failed to fetch videos" } };
  }
}
