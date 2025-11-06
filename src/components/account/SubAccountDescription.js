import Image from "next/image";
import React from "react";
import { cn } from "@/lib/utils";

const SubAccountDescription = ({ channelUser, preview }) => {

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
      </div>
    </div>
  );
};

export default SubAccountDescription;
