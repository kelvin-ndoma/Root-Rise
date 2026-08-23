"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type SafeImageProps = Omit<ImageProps, "onError" | "src"> & {
  src?: ImageProps["src"] | null;
  fallbackLabel?: string;
};

export function SafeImage({ fallbackLabel, className, alt, src, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "grid h-full w-full place-items-center bg-[linear-gradient(160deg,#efe4d4_0%,#d8c3a5_55%,#5c3d2e_140%)] text-center",
          className,
        )}
        aria-hidden={fallbackLabel ? undefined : true}
      >
        <span className="px-4 font-display text-2xl tracking-[0.18em] text-brand/70">
          {fallbackLabel ?? "R&R"}
        </span>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      src={src}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
