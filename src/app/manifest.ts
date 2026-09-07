import type { MetadataRoute } from "next";

// Installable PWA (SPEC "Icon & PWA"): Add to Home Screen yields a standalone
// app with the crate icon. Served at /manifest.webmanifest and linked by Next.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cards",
    short_name: "Cards",
    description: "Your loyalty cards, ready at the till.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F3E5",
    theme_color: "#F8F3E5",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
