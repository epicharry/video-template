import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaMuteButton,
  MediaPlaybackRateButton,
  MediaPlayButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";
import ReactPlayer from "react-player";
import { useEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { saveHistory } from "@/lib/api";

export default function MainVideoPlayer({ media }) {
  const { hlsUrl, id } = media;
  const { user } = useUser();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (user && id && !hasTrackedRef.current) {
      const timer = setTimeout(() => {
        saveHistory(user.id, id);
        hasTrackedRef.current = true;
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [user, id]);

  return (
    <MediaController
      style={{
        width: "100%",
        aspectRatio: "16/9",
      }}
    >
      <ReactPlayer
        autoPlay
        slot="media"
        src={hlsUrl}
        controls={false}
        style={{
          width: "100%",
          height: "100%",
          "--controls": "none",
        }}
      ></ReactPlayer>
      <div slot="top-chrome" className="lg:hidden flex justify-end w-full">
        <MediaFullscreenButton className="p-2 bg-transparent" />
      </div>
      <div slot="centered-chrome" className="lg:hidden">
        <MediaPlayButton className="p-2 bg-transparent" noTooltip />
      </div>
      <MediaControlBar className="w-full lg:hidden">
        <MediaTimeDisplay showDuration className="p-2 bg-transparent" />
        <MediaTimeRange className="bg-transparent" />
        <MediaMuteButton className="p-2 bg-transparent" />
        <MediaPlaybackRateButton className="p-2 bg-transparent ml-auto " />
      </MediaControlBar>

      <div className="hidden lg:block w-full">
        <MediaControlBar className="w-full">
          <MediaTimeRange className="bg-transparent" />
        </MediaControlBar>
      </div>
      <MediaControlBar className="hidden lg:flex gap-0">
        <MediaPlayButton className="p-2 bg-transparent" />
        <MediaMuteButton className="p-2 bg-transparent" />
        <MediaVolumeRange className="p-2 bg-transparent" />
        <MediaTimeDisplay showDuration className="p-2 bg-transparent" />
        <MediaPlaybackRateButton className="p-2 bg-transparent ml-auto " />
        <MediaFullscreenButton className="p-2 bg-transparent" />
      </MediaControlBar>
    </MediaController>
  );
}
