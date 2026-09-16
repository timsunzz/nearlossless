"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type CompareSliderProps = {
  originalUrl: string;
  compressedUrl: string;
};

export function CompareSlider({
  originalUrl,
  compressedUrl,
}: CompareSliderProps) {
  const originalRef = useRef<HTMLVideoElement>(null);
  const compressedRef = useRef<HTMLVideoElement>(null);
  const [split, setSplit] = useState(50);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const original = originalRef.current;
    const compressed = compressedRef.current;
    if (!original || !compressed) return;

    const sync = () => {
      if (Math.abs(compressed.currentTime - original.currentTime) > 0.12) {
        compressed.currentTime = original.currentTime;
      }
    };

    original.addEventListener("timeupdate", sync);
    return () => original.removeEventListener("timeupdate", sync);
  }, [originalUrl, compressedUrl]);

  async function togglePlay() {
    const original = originalRef.current;
    const compressed = compressedRef.current;
    if (!original || !compressed) return;
    if (playing) {
      original.pause();
      compressed.pause();
      setPlaying(false);
      return;
    }
    compressed.currentTime = original.currentTime;
    await Promise.all([original.play(), compressed.play()]);
    setPlaying(true);
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
        <video
          ref={originalRef}
          src={originalUrl}
          className="aspect-video w-full object-contain"
          playsInline
          muted
          onEnded={() => setPlaying(false)}
        />
        <video
          ref={compressedRef}
          src={compressedUrl}
          className="pointer-events-none absolute inset-0 aspect-video h-full w-full object-contain"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
          playsInline
          muted
        />
        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-px bg-primary"
          style={{ left: `${split}%` }}
        >
          <span className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-lg" />
        </div>
        <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] tracking-wide text-white/85">
          压缩后
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] tracking-wide text-white/85">
          原片
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" size="sm" variant="secondary" onClick={togglePlay}>
          {playing ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}
          {playing ? "暂停" : "同步播放"}
        </Button>
        <Slider
          min={0}
          max={100}
          value={[split]}
          onValueChange={(value) => {
            const next = Array.isArray(value) ? value[0] : 50;
            setSplit(next ?? 50);
          }}
          aria-label="对比滑杆"
        />
      </div>
    </div>
  );
}
