import { S3Client } from "@aws-sdk/client-s3";

let cached: S3Client | null = null;

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export function getR2Client(): S3Client {
  if (cached) return cached;
  const accountId = required("R2_ACCOUNT_ID");
  cached = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    },
  });
  return cached;
}

export function r2Config() {
  return {
    bucket: required("R2_BUCKET"),
    publicUrl: required("R2_PUBLIC_URL").replace(/\/$/, ""),
  };
}
