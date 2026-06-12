import { v2 as cloudinary } from "cloudinary";

import { getCloudinaryEnv } from "@/lib/env";

export type CloudinarySignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
};

export function createCloudinaryUploadSignature(folder = "khatakholo/receipts"): CloudinarySignature | null {
  const env = getCloudinaryEnv();

  if (!env) {
    return null;
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      folder,
      timestamp,
    },
    env.apiSecret,
  );

  return {
    cloudName: env.cloudName,
    apiKey: env.apiKey,
    folder,
    timestamp,
    signature,
  };
}

