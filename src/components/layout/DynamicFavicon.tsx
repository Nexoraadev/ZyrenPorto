"use client";

import { useEffect } from "react";

export function DynamicFavicon() {
  useEffect(() => {
    fetch("/api/footer-settings")
      .then(r => r.json())
      .then(d => {
        if (!d.logo_url) return;
        // Update favicon
        const existingLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
        const link = existingLink ?? document.createElement("link");
        link.rel   = "icon";
        link.type  = "image/png";
        link.href  = d.logo_url;
        if (!existingLink) document.head.appendChild(link);

        // Also update apple-touch-icon
        const appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']")
          ?? document.createElement("link");
        appleLink.rel  = "apple-touch-icon";
        appleLink.href = d.logo_url;
        if (!document.querySelector("link[rel='apple-touch-icon']")) {
          document.head.appendChild(appleLink);
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
