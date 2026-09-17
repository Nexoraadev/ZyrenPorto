"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProjectImage } from "@/types/database";

interface ImageCarouselProps {
  images: ProjectImage[];
  alt: string;
  fallbackText?: string;
  className?: string;
}

export function ImageCarousel({
  images,
  alt,
  fallbackText,
  className,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = () => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startInterval();
    return () => stopInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  // 0 images — placeholder
  if (images.length === 0) {
    return (
      <div
        className={cn(
          "relative w-full h-full bg-dark-900 flex items-center justify-center",
          className
        )}
        aria-live="polite"
      >
        <div className="font-mono text-4xl font-black text-dark-800 select-none">
          {fallbackText ? fallbackText.slice(0, 2).toUpperCase() : "??"}
        </div>
      </div>
    );
  }

  // 1 image — static
  if (images.length === 1) {
    return (
      <div
        className={cn("relative w-full h-full overflow-hidden", className)}
        aria-live="polite"
      >
        <Image
          src={images[0].url}
          alt={alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    );
  }

  // >1 images — carousel
  return (
    <div
      className={cn("relative w-full h-full overflow-hidden", className)}
      aria-live="polite"
      onMouseEnter={stopInterval}
      onMouseLeave={startInterval}
    >
      {images.map((img, i) => (
        <div
          key={img.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === currentIndex ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={img.url}
            alt={`${alt} — ${i + 1}`}
            fill
            className="object-cover"
          />
        </div>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              i === currentIndex ? "bg-blood-600" : "bg-dark-700"
            )}
            aria-label={`Gambar ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
