import Image from "next/image";
import React, { useEffect, useState } from "react";
import Button from "./Button";
import { Bookmark, ThumbsUp } from "lucide-react";
import { useRouter } from "next/router";
import { useUser } from "@/contexts/UserContext";
import { likeVideo as likeVideoAPI, saveToWatchLater, saveHistory, subscribe, getSubscriptionStatus, getSubscriberCount } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const VideoDescription = ({ media }) => {
  const router = useRouter();
  const { user } = useUser();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { data: subStatus } = useQuery({
    queryKey: ['subscription-status', user?.id, media?.profile?.id],
    queryFn: () => getSubscriptionStatus(user?.id, media?.profile?.id),
    enabled: !!user?.id && !!media?.profile?.id,
  });

  const { data: subCount } = useQuery({
    queryKey: ['subscriber-count', media?.profile?.id],
    queryFn: () => getSubscriberCount(media?.profile?.id),
    enabled: !!media?.profile?.id,
  });

  useEffect(() => {
    if (subStatus !== undefined) {
      setIsSubscribed(subStatus);
    }
  }, [subStatus]);

  useEffect(() => {
    if (subCount !== undefined) {
      setSubscriberCount(subCount);
    }
  }, [subCount]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user?.id && media?.id) {
        const { data } = await supabase
          .from('video_likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('video_id', media.id)
          .maybeSingle();
        setIsLiked(!!data);
      }
    };

    const checkSaveStatus = async () => {
      if (user?.id && media?.id) {
        const { data } = await supabase
          .from('watch_later')
          .select('id')
          .eq('user_id', user.id)
          .eq('video_id', media.id)
          .maybeSingle();
        setIsSaved(!!data);
      }
    };

    checkLikeStatus();
    checkSaveStatus();
  }, [user?.id, media?.id]);

  const checkAuth = () => {
    if (!user) {
      router.push("/sign-in");
      return false;
    }
    return true;
  };

  const handleLikeVideo = async () => {
    if (!checkAuth()) return;
    await likeVideoAPI(user.id, media.id);
    setIsLiked(!isLiked);
  };

  const handleSaveVideo = async () => {
    if (!checkAuth()) return;
    await saveToWatchLater(user.id, media.id);
    setIsSaved(!isSaved);
  };

  const updateSubscription = async () => {
    if (!checkAuth()) return;
    const result = await subscribe(user.id, media.profile.id);
    if (result !== null) {
      setIsSubscribed(result);
      setSubscriberCount(prev => result ? prev + 1 : prev - 1);
    }
  };

  useEffect(() => {
    if (user?.id && media?.id) {
      saveHistory(user.id, media.id);
    }
  }, [user?.id, media?.id]);

  return (
    <div className="my-4">
      <h1 className="tracking-tight text-lg font-semibold">{media.title}</h1>
      <div className="mt-3 text-sm space-y-4 lg:space-y-0 lg:flex lg:items-center">
        <div className="flex gap-2">
          <Image
            src={media.profile?.avatar_url ?? "/default-user.jpg"}
            alt="default user image"
            width={35}
            height={35}
            className="rounded-full self-baseline"
          />
          <div>
            <h2 className="tracking-tight text-base font-semibold">
              {media.profile?.username}
            </h2>
            <p className="text-neutral-400 text-xs">{subscriberCount} subscribers</p>
          </div>
          {media?.profile?.id !== user?.id && (
            <Button
              onClick={updateSubscription}
              variant={isSubscribed ? "secondary" : "tertiary"}
              className={cn(
                "rounded-full text-xs font-medium lg:ml-4 self-center py-1.5 leading-6 ml-auto"
              )}
            >
              Subscribe{isSubscribed ? "d" : ""}
            </Button>
          )}
        </div>
        <div className="flex lg:ml-auto">
          <Button
            onClick={handleLikeVideo}
            variant="tertiary"
            className={cn(
              "items-center gap-1 rounded-full text-xs font-medium self-center py-1.5 leading-6",
              isLiked && "bg-red-600 hover:bg-red-700"
            )}
          >
            <div className="flex items-center gap-1">
              <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
              <span className="">{isLiked ? "Liked" : "Like"}</span>
            </div>
          </Button>
          <Button
            onClick={handleSaveVideo}
            variant="tertiary"
            className={cn(
              "items-center gap-1 rounded-full text-xs font-medium ml-2 self-center py-1.5 leading-6",
              isSaved && "bg-blue-600 hover:bg-blue-700"
            )}
          >
            <div className="flex items-center gap-1">
              <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
              <span className="">{isSaved ? "Saved" : "Save to Watch List"}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoDescription;
