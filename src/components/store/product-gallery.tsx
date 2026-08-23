"use client";

import { useState } from "react";
import type { MediaAsset } from "@/types";
import { cn } from "@/lib/utils/cn";
import { SafeImage } from "@/components/ui/safe-image";

export function ProductGallery({ images, name }: { images: MediaAsset[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="grid gap-4">
      <div className="relative aspect-square overflow-hidden rounded-[1.8rem] bg-[#efe6d8]">
        <SafeImage
          src={current?.url}
          alt={current?.alt || name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          fallbackLabel={name}
        />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-2xl border",
                index === active ? "border-brand" : "border-transparent",
              )}
            >
              <SafeImage src={image.url} alt={image.alt || name} fill className="object-cover" fallbackLabel={name} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
