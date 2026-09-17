"use client";

import { useEffect } from "react";

/**
 * Hides Tidio chatbot in admin area via MutationObserver.
 * Static CSS doesn't work because Tidio injects iframe after render
 * and overrides display with inline styles.
 */
export function HideTidio() {
  useEffect(() => {
    function hideTidio() {
      const el = document.getElementById("tidio-chat-iframe");
      if (el) {
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("visibility", "hidden", "important");
        el.style.setProperty("opacity", "0", "important");
        el.style.setProperty("pointer-events", "none", "important");
      }
      // Also hide the container
      const container = document.getElementById("tidio-chat");
      if (container) {
        container.style.setProperty("display", "none", "important");
      }
    }

    // Hide immediately if already exists
    hideTidio();

    // Watch for Tidio to be injected
    const observer = new MutationObserver(() => hideTidio());
    observer.observe(document.body, { childList: true, subtree: true });

    // Also listen for Tidio ready event
    const onReady = () => hideTidio();
    document.addEventListener("tidioChat-ready", onReady);

    return () => {
      observer.disconnect();
      document.removeEventListener("tidioChat-ready", onReady);
    };
  }, []);

  return null;
}
