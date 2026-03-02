import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GigaCoffee",
    short_name: "GigaCoffee",
    description: "당신의 하루를 위로하는 한 잔의 커피",
    start_url: "/",
    display: "standalone",
    background_color: "#1c1c1e",
    theme_color: "#f59e0b",
    orientation: "portrait",
    icons: [
      {
        src: "/app-icon-512.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
