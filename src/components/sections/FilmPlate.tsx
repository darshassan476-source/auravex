"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaAsset } from "@/lib/types";
import { Icon } from "../ui/Icon";

/**
 * The product film, in place of the video plate: its poster until pressed,
 * then the real MP4 with the browser's own controls.
 */
export function FilmPlate({ video, accent, caption }: { video: MediaAsset; accent: string; caption: string }) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playing) return;
    ref.current?.play().catch(() => setPlaying(false));
  }, [playing]);

  return (
    <div className="relative flex h-full min-h-[300px] overflow-hidden rounded-2xl border border-[var(--ax-line)] bg-black">
      <video
        ref={ref}
        src={video.src}
        poster={video.poster}
        controls={playing}
        playsInline
        preload="metadata"
        onEnded={() => setPlaying(false)}
        className="absolute inset-0 h-full w-full object-cover"
        aria-label={video.alt}
      />
      {!playing && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="ax-focus group relative flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center"
          aria-label={`Play ${video.alt}`}
        >
          <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,15,0.18),rgba(4,7,15,0.62))]" />
          <span className="relative grid size-[62px] place-items-center rounded-full border border-white/40 bg-black/45 text-white backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
            <span
              aria-hidden
              className="absolute size-[62px] animate-[pulse-ring_2.8s_ease-out_infinite] rounded-full"
              style={{ boxShadow: `0 0 0 1px ${accent}66` }}
            />
            <Icon name="play" className="ml-0.5 size-5" strokeWidth={2.2} />
          </span>
          <span className="ax-display relative max-w-[16ch] text-[19px] leading-snug text-white">{caption}</span>
        </button>
      )}
    </div>
  );
}
