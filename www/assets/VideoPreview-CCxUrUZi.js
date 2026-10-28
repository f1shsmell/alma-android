!(function() {
  try {
    var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
    e.SENTRY_RELEASE = { id: "alma@0.4.213" };
  } catch (e2) {
  }
})();
;
{
  try {
    (function() {
      var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {}, n = new e.Error().stack;
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "16faa814-98d6-4f06-a9b0-9bd59a7b2dd7", e._sentryDebugIdIdentifier = "sentry-dbid-16faa814-98d6-4f06-a9b0-9bd59a7b2dd7");
    })();
  } catch (e) {
  }
}
;
import { r as reactExports, j as jsxRuntimeExports } from "./index-CgjOdD6Y.js";
import { B as Button } from "./ThemeContext-DC9BEsmk.js";
import { S as Slider } from "./slider-BVnwZRlC.js";
import { P as Pause, V as VolumeX, M as Maximize } from "./App-CHUt1SP7.js";
import { P as Play } from "./overflow-container-mj8jOZ-y.js";
import { V as Volume2 } from "./PluginNotificationListener-scvFi9tf.js";
import "./createLucideIcon-3XU0ditt.js";
import "./x-CcbWXrDG.js";
import "./index-7mJnAivB.js";
import "./preload-helper-D4tMVkJm.js";
import "./index-DN2Gz6Bt.js";
import "./label-hzvhGvL9.js";
import "./wand-sparkles-BbMFNLc9.js";
import "./mermaid-NA5CF7SZ-BKZ7k0hP.js";
import "./image-m7_DgCTW.js";
import "./useLiveCoding-C7HXNyqq.js";
import "./loader-circle-DiP-R-ZO.js";
import "./artifactWorkspaceContextDef-DolVKi0N.js";
import "./pencil-DC0BaoJb.js";
import "./trash-2-RgRY4jyV.js";
import "./TwemojiIcon-CIMlZ5Vl.js";
import "./ExecutionHistory-Cj3Cvp6z.js";
import "./alma-icon-C6VWCCBG.js";
import "./apiClient-tX7iz454.js";
import "./generative-ui-block-Brez-TTi.js";
import "./en-US-CNS5Ke8U.js";
import "./addLeadingZeros-PaOGjOu2.js";
import "./PlatformContext-CrasNQRo.js";
import "./undo-2-0Mw7t7EX.js";
import "./v4-BPoTv6EE.js";
import "./ConditionalPostHogProvider-DUq_pvB0.js";
const VideoPreview = reactExports.memo(function VideoPreview2({ src, mimeType }) {
  const videoRef = reactExports.useRef(null);
  const [isPlaying, setIsPlaying] = reactExports.useState(false);
  const [isMuted, setIsMuted] = reactExports.useState(false);
  const [currentTime, setCurrentTime] = reactExports.useState(0);
  const [duration, setDuration] = reactExports.useState(0);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  const handleSeek = (value) => {
    if (videoRef.current && value[0] !== void 0) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      "Failed to load video: ",
      error
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full bg-black", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "video",
      {
        ref: videoRef,
        className: "max-w-full max-h-full",
        onTimeUpdate: handleTimeUpdate,
        onLoadedMetadata: handleLoadedMetadata,
        onEnded: () => setIsPlaying(false),
        onError: () => setError("Could not load video"),
        onPlay: () => setIsPlaying(true),
        onPause: () => setIsPlaying(false),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("source", { src, type: mimeType }),
          "Your browser does not support the video tag."
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-background/90 border-t border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8", onClick: togglePlay, children: isPlaying ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground min-w-[40px]", children: formatTime(currentTime) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { className: "flex-1", value: [currentTime], max: duration || 100, step: 0.1, onValueChange: handleSeek }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground min-w-[40px]", children: formatTime(duration) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8", onClick: toggleMute, children: isMuted ? /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8", onClick: handleFullscreen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize, { className: "size-4" }) })
    ] })
  ] });
});
export {
  VideoPreview
};
