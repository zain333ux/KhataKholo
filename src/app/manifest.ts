import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KhataKholo – Room Khata",
    short_name: "KhataKholo",
    description: "Private roommate expense splitting and khata for hostel rooms.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#059669",
    theme_color: "#059669",
    orientation: "portrait-primary",
    lang: "en",
    dir: "ltr",
    categories: ["finance", "utilities"],
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Add Expense",
        short_name: "Add",
        description: "Add a new shared expense",
        url: "/add-expense",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
      {
        name: "My Khata",
        short_name: "Khata",
        description: "View your private balances",
        url: "/khata",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
    ],
  };
}
