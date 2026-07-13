import { v2 as cloudinary } from "cloudinary";

import { getCloudinaryEnv } from "./env";

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

export function validateCloudinaryReceiptReference(
  receiptUrl: string | null,
  receiptPublicId: string | null,
  cloudName: string,
): string | null {
  if (!receiptUrl && !receiptPublicId) return null;
  if (!receiptUrl || !receiptPublicId) return "Receipt upload details are incomplete. Please upload it again.";
  if (!receiptPublicId.startsWith("khatakholo/receipts/") || receiptPublicId.length > 255) {
    return "Receipt upload is not from the approved receipt folder.";
  }

  try {
    const url = new URL(receiptUrl);
    const expectedPrefix = `/${cloudName}/image/upload/`;
    if (
      url.protocol !== "https:"
      || url.hostname !== "res.cloudinary.com"
      || !url.pathname.startsWith(expectedPrefix)
      || !url.pathname.includes("/khatakholo/receipts/")
      || url.username
      || url.password
    ) {
      return "Receipt upload URL is invalid.";
    }
  } catch {
    return "Receipt upload URL is invalid.";
  }

  return null;
}
