import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let cached: S3Client | null = null;

/** R2 activé si bucket + credentials + URL publique sont présents */
export function isR2Enabled(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL
  );
}

export function r2Bucket(): string {
  const name = process.env.R2_BUCKET_NAME;
  if (!name) throw new Error("R2_BUCKET_NAME manquant");
  return name;
}

/** Client S3-compatible Cloudflare R2 */
export function getR2Client(): S3Client {
  if (cached) return cached;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Credentials R2 manquants (ACCOUNT_ID / ACCESS_KEY / SECRET)");
  }
  cached = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cached;
}

/** URL signée PUT (upload navigateur / script) */
export async function createR2SignedUploadUrl(
  storagePath: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: r2Bucket(),
    Key: storagePath,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn });
}

/** Vérifie qu’un objet existe */
export async function r2ObjectExists(storagePath: string): Promise<boolean> {
  try {
    await getR2Client().send(
      new HeadObjectCommand({ Bucket: r2Bucket(), Key: storagePath })
    );
    return true;
  } catch {
    return false;
  }
}

/** Supprime un objet (ignore si déjà absent) */
export async function deleteR2Object(storagePath: string): Promise<void> {
  await getR2Client().send(
    new DeleteObjectCommand({ Bucket: r2Bucket(), Key: storagePath })
  );
}

/** Upload buffer (scripts de migration / import) */
export async function putR2Object(
  storagePath: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<void> {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: r2Bucket(),
      Key: storagePath,
      Body: body,
      ContentType: contentType,
    })
  );
}
