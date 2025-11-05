import Image from "next/image";
import React, { useEffect, useState } from "react";
import Button from "../Button";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { subscribe, getSubscriptionStatus } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const SubAccountDescription = ({ channelUser, preview }) => {
  const { user: loggedInUser } = useUser();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { data: subStatus } = useQuery({
    queryKey: ['subscription-status', loggedInUser?.id, channelUser?.id],
    queryFn: () => getSubscriptionStatus(loggedInUser?.id, channelUser?.id),
    enabled: !!loggedInUser?.id && !!channelUser?.id,
  });

  useEffect(() => {
    if (subStatus !== undefined) {
      setIsSubscribed(subStatus);
    }
  }, [subStatus]);

  const updateSubscription = async () => {
    if (!loggedInUser || !channelUser) return;
    const result = await subscribe(loggedInUser.id, channelUser.id);
    if (result !== null) {
      setIsSubscribed(result);
    }
  };

  return (
    <div className="flex gap-6">
      <div className="relative group w-24 h-24 md:w-[150px] md:h-[150px]">
        <Image
          src={preview}
          alt={`${channelUser?.username}'s avatar`}
          fill
          priority
          className="object-cover rounded-full"
        />
      </div>
      <div className="space-y-2 flex flex-col justify-center">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">
          {channelUser?.username}
        </h1>
        <p className="text-xs text-neutral-400">&#x2022; {channelUser?.email} </p>
        <Button
          onClick={updateSubscription}
          variant={isSubscribed ? "secondary" : "tertiary"}
          className={cn(
            "rounded-full text-xs font-medium self-start py-1.5 leading-6"
          )}
        >
          Subscribe{isSubscribed ? "d" : ""}
        </Button>
      </div>
    </div>
  );
};

export default SubAccountDescription;
