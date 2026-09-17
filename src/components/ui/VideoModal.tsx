"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { extractYouTubeId } from "@/types/database";

interface VideoModalProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ videoUrl, isOpen, onClose }: VideoModalProps) {
  const [mounted, setMounted] = useState(false);
  const videoId = extractYouTubeId(videoUrl);

  // Only mount portal client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll saat modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!videoId || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal content */}
          <motion.div
            className="relative z-10 w-full max-w-4xl"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 text-dark-300 hover:text-white transition-colors p-2 bg-dark-900/80 rounded-full"
              aria-label="Tutup video"
            >
              <X size={24} />
            </button>

            {/* YouTube iframe */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
