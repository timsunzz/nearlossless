"use client";

import { useState } from "react";
import { Film, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type DropZoneProps = {
  disabled?: boolean;
  onFile: (file: File) => void;
  error?: string | null;
};

export function DropZone({ disabled, onFile, error }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-dashed px-6 py-16 transition-colors",
          "border-white/15 bg-[oklch(0.2_0.02_75_/_0.55)]",
          dragOver && "border-primary bg-primary/10",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <input
          id="video-file"
          type="file"
          accept="video/*,.mp4,.mov,.webm,.mkv,.avi,.m4v,.mpeg,.mpg,.3gp"
          disabled={disabled}
          data-testid="video-file-input"
          aria-label="选择要压缩的视频"
          className="absolute inset-0 z-20 cursor-pointer opacity-0"
          onDragEnter={() => setDragOver(true)}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={() => setDragOver(false)}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
            event.target.value = "";
          }}
        />
        <FilmStrip className="pointer-events-none absolute inset-y-0 left-0 w-7 text-white/10" />
        <FilmStrip className="pointer-events-none absolute inset-y-0 right-0 w-7 text-white/10" />
        <div className="pointer-events-none relative mx-auto flex max-w-md flex-col items-center text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
            {dragOver ? <Film className="size-6" /> : <Upload className="size-6" />}
          </span>
          <p className="font-heading text-2xl tracking-tight text-foreground">
            把视频拖到这里
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            或点击选择 MP4、MOV、WebM、MKV。默认用接近无损的恒定质量压缩，分辨率保持不变。
          </p>
        </div>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FilmStrip({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 320"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <rect width="28" height="320" fill="currentColor" opacity="0.35" />
      {Array.from({ length: 12 }, (_, index) => (
        <rect
          key={index}
          x="6"
          y={10 + index * 26}
          width="16"
          height="14"
          rx="2"
          className="fill-background"
        />
      ))}
    </svg>
  );
}
