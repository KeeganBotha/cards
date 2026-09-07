"use client";

import { useEffect } from "react";

// Registers /sw.js on every page load so the app is installable and an
// existing push subscription keeps its worker. Renders nothing. Silent on
// browsers without service workers.
export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failing (private mode, unsupported) is not an app error.
    });
  }, []);
  return null;
}
