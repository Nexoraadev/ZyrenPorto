"use client";

import { useState } from "react";
import { Monitor, Smartphone, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PreviewPage() {
  const [device,    setDevice   ] = useState<"desktop" | "mobile">("desktop");
  const [key,       setKey      ] = useState(0);   // force iframe reload

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "calc(100vh - 80px)" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Preview</h1>
          <p className="text-xs text-dark-500 font-mono mt-0.5">{`// tampilan website real-time`}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Device toggle */}
          <div className="flex items-center rounded-lg border border-dark-800 overflow-hidden">
            <button
              onClick={() => setDevice("desktop")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-mono transition-colors",
                device === "desktop"
                  ? "bg-blood-700 text-white"
                  : "text-dark-500 hover:text-dark-300 hover:bg-dark-900"
              )}
            >
              <Monitor size={13} /> Desktop
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-mono transition-colors",
                device === "mobile"
                  ? "bg-blood-700 text-white"
                  : "text-dark-500 hover:text-dark-300 hover:bg-dark-900"
              )}
            >
              <Smartphone size={13} /> Mobile
            </button>
          </div>

          {/* Reload */}
          <button
            onClick={() => setKey(k => k + 1)}
            className="w-8 h-8 rounded-lg border border-dark-800 bg-dark-900 flex items-center justify-center text-dark-500 hover:text-blood-400 hover:border-blood-800 transition-colors"
            aria-label="Reload preview"
          >
            <RefreshCw size={13} />
          </button>

          {/* Open in new tab */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg border border-dark-800 bg-dark-900 flex items-center justify-center text-dark-500 hover:text-blood-400 hover:border-blood-800 transition-colors"
            aria-label="Buka di tab baru"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Preview area */}
      <div
        className={cn(
          "flex-1 rounded-xl border border-dark-800 bg-dark-900 overflow-hidden",
          device === "mobile" ? "flex items-start justify-center pt-4 pb-4" : ""
        )}
        style={{ minHeight: "600px" }}
      >
        {device === "mobile" ? (
          /* Mobile frame */
          <div className="relative shrink-0" style={{ width: "390px" }}>
            {/* Phone outline */}
            <div
              className="relative rounded-[2.5rem] border-4 border-dark-700 overflow-hidden bg-black shadow-2xl"
              style={{ width: "390px", height: "844px" }}
            >
              {/* Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-dark-900 rounded-full z-10" />
              <iframe
                key={key}
                src="/"
                className="w-full h-full border-0"
                title="Mobile preview"
                style={{ width: "390px", height: "844px" }}
              />
            </div>
          </div>
        ) : (
          /* Desktop full */
          <iframe
            key={key}
            src="/"
            className="w-full h-full border-0 rounded-xl"
            title="Desktop preview"
            style={{ minHeight: "600px", height: "100%" }}
          />
        )}
      </div>

      <p className="text-[10px] text-dark-700 font-mono mt-2 text-center">
        {`// preview menampilkan versi deployed. Setelah save konten, klik refresh untuk update.`}
      </p>
    </div>
  );
}
