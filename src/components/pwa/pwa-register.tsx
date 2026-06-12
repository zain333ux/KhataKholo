"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        // Check for updates in the background
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            // When a new SW is installed and the page is already controlled,
            // skip waiting so it activates immediately on next navigation.
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      } catch {
        // SW registration failing is non-fatal — app still works without it.
      }
    };

    // Defer registration until after page load to not block rendering
    if (document.readyState === "complete") {
      void registerSW();
    } else {
      window.addEventListener("load", () => void registerSW(), { once: true });
    }
  }, []);

  return null;
}
