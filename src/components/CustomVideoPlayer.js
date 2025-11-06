import { useEffect, useRef, useState } from "react";

const CustomVideoPlayer = ({ src, thumbnail, sources, selectedQuality, onQualityChange }) => {
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const timelineContainerRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const thumbnailImgRef = useRef(null);

  const [isPaused, setIsPaused] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState("high");
  const [isTheater, setIsTheater] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isCaptions, setIsCaptions] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [totalTime, setTotalTime] = useState("0:00");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [wasPaused, setWasPaused] = useState(false);
  const [previewTime, setPreviewTime] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const hideControlsTimeoutRef = useRef(null);
  const previewVideoRef = useRef(null);

  const formatDuration = (time) => {
    const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
      minimumIntegerDigits: 2,
    });
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);
    if (hours === 0) {
      return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
    } else {
      return `${hours}:${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(seconds)}`;
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleTheaterMode = () => {
    setIsTheater(!isTheater);
  };

  const toggleFullScreenMode = () => {
    if (document.fullscreenElement == null) {
      videoContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleMiniPlayerMode = () => {
    if (videoContainerRef.current?.classList.contains("mini-player")) {
      document.exitPictureInPicture();
    } else {
      videoRef.current?.requestPictureInPicture();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const changePlaybackSpeed = () => {
    if (videoRef.current) {
      let newPlaybackRate = videoRef.current.playbackRate + 0.25;
      if (newPlaybackRate > 2) newPlaybackRate = 0.25;
      videoRef.current.playbackRate = newPlaybackRate;
      setPlaybackSpeed(newPlaybackRate);
    }
  };

  const skip = (duration) => {
    if (videoRef.current) {
      videoRef.current.currentTime += duration;
    }
  };

  const lastPreviewTimeRef = useRef(0);
  const previewTimeoutRef = useRef(null);

  const updatePreview = (time) => {
    if (!previewVideoRef.current || !time) return;

    if (Math.abs(time - lastPreviewTimeRef.current) < 0.5) {
      return;
    }

    lastPreviewTimeRef.current = time;

    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    previewTimeoutRef.current = setTimeout(() => {
      if (previewVideoRef.current) {
        previewVideoRef.current.currentTime = time;
        setPreviewTime(time);
      }
    }, 50);
  };

  useEffect(() => {
    if (previewVideoRef.current && src) {
      previewVideoRef.current.src = src;
      previewVideoRef.current.load();
    }
  }, [src]);

  const handleTimelineUpdate = (e) => {
    if (!timelineContainerRef.current || !videoRef.current) return;

    const rect = timelineContainerRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;

    timelineContainerRef.current.style.setProperty("--preview-position", percent);

    const time = percent * videoRef.current.duration;
    if (!isScrubbing && time > 0) {
      setShowPreview(true);
      updatePreview(time);
    }

    if (isScrubbing) {
      e.preventDefault();
      timelineContainerRef.current.style.setProperty("--progress-position", percent);
    }
  };

  const toggleScrubbing = (e) => {
    if (!timelineContainerRef.current || !videoRef.current) return;

    const rect = timelineContainerRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
    const scrubbing = (e.buttons & 1) === 1;

    setIsScrubbing(scrubbing);

    if (scrubbing) {
      setWasPaused(videoRef.current.paused);
      videoRef.current.pause();
    } else {
      videoRef.current.currentTime = percent * videoRef.current.duration;
      if (!wasPaused) videoRef.current.play();
    }

    handleTimelineUpdate(e);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setTotalTime(formatDuration(video.duration));
    };

    const handleTimeUpdate = () => {
      setCurrentTime(formatDuration(video.currentTime));
      const percent = video.currentTime / video.duration;
      if (timelineContainerRef.current) {
        timelineContainerRef.current.style.setProperty("--progress-position", percent);
      }
    };

    const handlePlay = () => {
      setIsPaused(false);
    };

    const handlePause = () => {
      setIsPaused(true);
    };

    const handleVolumeChange = () => {
      if (volumeSliderRef.current) {
        volumeSliderRef.current.value = video.volume;
      }

      let level;
      if (video.muted || video.volume === 0) {
        if (volumeSliderRef.current) volumeSliderRef.current.value = 0;
        level = "muted";
      } else if (video.volume >= 0.5) {
        level = "high";
      } else {
        level = "low";
      }
      setVolumeLevel(level);
    };

    const handleEnterPIP = () => {
      videoContainerRef.current?.classList.add("mini-player");
    };

    const handleLeavePIP = () => {
      videoContainerRef.current?.classList.remove("mini-player");
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("enterpictureinpicture", handleEnterPIP);
    video.addEventListener("leavepictureinpicture", handleLeavePIP);

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("enterpictureinpicture", handleEnterPIP);
      video.removeEventListener("leavepictureinpicture", handleLeavePIP);
    };
  }, [formatDuration]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tagName = document.activeElement?.tagName.toLowerCase();
      if (tagName === "input") return;

      switch (e.key.toLowerCase()) {
        case " ":
          if (tagName === "button") return;
        case "k":
          togglePlay();
          break;
        case "f":
          toggleFullScreenMode();
          break;
        case "t":
          toggleTheaterMode();
          break;
        case "i":
          toggleMiniPlayerMode();
          break;
        case "m":
          toggleMute();
          break;
        case "arrowleft":
        case "j":
          skip(-5);
          break;
        case "arrowright":
        case "l":
          skip(5);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleMouseUp = (e) => {
      if (isScrubbing) toggleScrubbing(e);
    };

    const handleMouseMove = (e) => {
      if (isScrubbing) handleTimelineUpdate(e);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrubbing, wasPaused]);

  useEffect(() => {
    if (!isFullScreen) {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      return;
    }

    const handleMouseMove = () => {
      setShowControls(true);

      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }

      hideControlsTimeoutRef.current = setTimeout(() => {
        if (!isPaused && isFullScreen) {
          setShowControls(false);
        }
      }, 2000);
    };

    const handleMouseLeave = () => {
      if (!isPaused && isFullScreen) {
        setShowControls(false);
      }
    };

    const container = videoContainerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [isFullScreen, isPaused]);

  const containerClasses = [
    "video-container",
    isPaused && "paused",
    isTheater && "theater",
    isFullScreen && "full-screen",
    isScrubbing && "scrubbing",
    isCaptions && "captions",
    !showControls && isFullScreen && "hide-controls",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={videoContainerRef}
      className={containerClasses}
      data-volume-level={volumeLevel}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={thumbnailImgRef} className="thumbnail-img" alt="" />
      <div className="video-controls-container">
        <div
          ref={timelineContainerRef}
          className="timeline-container"
          onMouseMove={handleTimelineUpdate}
          onMouseDown={toggleScrubbing}
          onMouseLeave={() => setShowPreview(false)}
        >
          <div className="timeline">
            <div className="thumb-indicator"></div>
          </div>
          {showPreview && (
            <video
              ref={previewVideoRef}
              className="preview-video"
              src={src}
              muted
              playsInline
            />
          )}
        </div>
        <div className="controls">
          <button className="play-pause-btn" onClick={togglePlay}>
            <svg className="play-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
            </svg>
            <svg className="pause-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
            </svg>
          </button>
          <div className="volume-container">
            <button className="mute-btn" onClick={toggleMute}>
              <svg className="volume-high-icon" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"
                />
              </svg>
              <svg className="volume-low-icon" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z"
                />
              </svg>
              <svg className="volume-muted-icon" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z"
                />
              </svg>
            </button>
            <input
              ref={volumeSliderRef}
              className="volume-slider"
              type="range"
              min="0"
              max="1"
              step="any"
              defaultValue="1"
              onChange={(e) => {
                if (videoRef.current) {
                  videoRef.current.volume = e.target.value;
                  videoRef.current.muted = e.target.value === "0";
                }
              }}
            />
          </div>
          <div className="duration-container">
            <div className="current-time">{currentTime}</div>
            /
            <div className="total-time">{totalTime}</div>
          </div>
          <button className="speed-btn wide-btn" onClick={changePlaybackSpeed}>
            {playbackSpeed}x
          </button>
          {sources && sources.length > 0 && (
            <div className="quality-container">
              <button
                className="quality-btn wide-btn"
                onClick={() => setShowQualityMenu(!showQualityMenu)}
              >
                {selectedQuality || sources[0]?.quality || "Quality"}
              </button>
              {showQualityMenu && (
                <div className="quality-menu">
                  {sources.map((source) => (
                    <button
                      key={source.quality}
                      className={`quality-option ${(selectedQuality === source.quality || (!selectedQuality && source === sources[0])) ? 'active' : ''}`}
                      onClick={() => {
                        const currentTime = videoRef.current?.currentTime;
                        const wasPlaying = !videoRef.current?.paused;
                        onQualityChange?.(source.quality);
                        setShowQualityMenu(false);
                        setTimeout(() => {
                          if (videoRef.current && currentTime) {
                            videoRef.current.currentTime = currentTime;
                            if (wasPlaying) videoRef.current.play();
                          }
                        }, 100);
                      }}
                    >
                      {source.quality}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button className="mini-player-btn" onClick={toggleMiniPlayerMode}>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9z"
              />
            </svg>
          </button>
          <button className="theater-btn" onClick={toggleTheaterMode}>
            <svg className="tall" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"
              />
            </svg>
            <svg className="wide" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"
              />
            </svg>
          </button>
          <button className="full-screen-btn" onClick={toggleFullScreenMode}>
            <svg className="open" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
              />
            </svg>
            <svg className="close" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
              />
            </svg>
          </button>
        </div>
      </div>
      <video ref={videoRef} src={src} onClick={togglePlay} />
    </div>
  );
};

export default CustomVideoPlayer;
