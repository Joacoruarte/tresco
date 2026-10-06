import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tresco · Big Pizza Colegiales",
    short_name: "Tresco",
    description: "Accesos rápidos de Big Pizza Colegiales",
    start_url: "/",
    display: "standalone",
    background_color: "#141110",
    theme_color: "#141110",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
