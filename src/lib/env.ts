export type SupabaseDatabaseEnv = {
  url: string;
  serviceRoleKey: string;
};

export type CloudinaryEnv = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export function getSupabaseDatabaseEnv(): SupabaseDatabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
}

export function getCloudinaryEnv(): CloudinaryEnv | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret };
}
