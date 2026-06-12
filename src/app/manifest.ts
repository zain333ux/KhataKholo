import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Room Khata",
    short_name: "KhataKholo",
    description: "Private roommate khata for hostel shared expenses.",
    start_url: "/home",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#047857",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

