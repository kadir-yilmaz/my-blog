import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Determine upload directory paths with multiple fallbacks for IIS Standalone
function getUploadDirs(): string[] {
  const cwd = process.cwd();
  return [
    join(cwd, "public", "uploads"),
    join(cwd, "public", "images"),
    join(cwd, "uploads"),
  ];
}

// Helper to save image buffer to disk or MinIO (S3)
async function saveImageBuffer(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  const hasMinio = !!(
    process.env.MINIO_ENDPOINT &&
    process.env.MINIO_ACCESS_KEY &&
    process.env.MINIO_SECRET_KEY &&
    process.env.MINIO_ENDPOINT !== "http://localhost:9000" // ignore placeholder
  );

  // 1. MinIO (S3) if explicitly configured
  if (hasMinio) {
    try {
      const s3Client = new S3Client({
        region: process.env.MINIO_REGION || "us-east-1",
        endpoint: process.env.MINIO_ENDPOINT,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.MINIO_ACCESS_KEY || "",
          secretAccessKey: process.env.MINIO_SECRET_KEY || "",
        },
      });

      const bucketName = process.env.MINIO_BUCKET_NAME || "my-blog-images";
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: buffer,
        ContentType: mimeType,
      });

      await s3Client.send(command);
      const endpoint = process.env.MINIO_ENDPOINT?.replace(/\/$/, "") || "";
      return `${endpoint}/${bucketName}/${filename}`;
    } catch (s3Error) {
      console.warn("⚠️ MinIO yüklemesi başarısız oldu, yerel depolamaya yazılıyor:", s3Error);
      // Fallback to local storage below
    }
  }

  // 2. Local Disk Storage (Reliable for IIS Standalone & Local Dev)
  const uploadDirs = getUploadDirs();
  let saved = false;
  let lastError: any = null;

  for (const dir of uploadDirs) {
    try {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      const filepath = join(dir, filename);
      await writeFile(filepath, buffer);
      saved = true;
      break;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ ${dir} dizinine yazılamadı:`, err);
    }
  }

  if (!saved) {
    throw new Error(`Görsel diske kaydedilemedi: ${lastError?.message || "Yazma izni hatası"}`);
  }

  // Always return the dedicated dynamic image API route URL for guaranteed streaming in Next.js Standalone
  return `/api/images/${filename}`;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // 1. JSON Request (Remote URL or Base64)
    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      const imageUrl = body?.url as string | undefined;

      if (!imageUrl || typeof imageUrl !== "string") {
        return NextResponse.json(
          { success: 0, error: "Geçerli bir resim URL'si bulunamadı." },
          { status: 400 }
        );
      }

      // If it's already a permanent URL, return directly
      if (
        imageUrl.startsWith("/api/images/") ||
        imageUrl.startsWith("/images/") ||
        imageUrl.startsWith("/uploads/")
      ) {
        return NextResponse.json({
          success: 1,
          file: { url: imageUrl },
          url: imageUrl,
        });
      }

      let buffer: Buffer;
      let mimeType = "image/png";
      let ext = "png";

      // Handle Data URL (base64)
      if (imageUrl.startsWith("data:")) {
        const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return NextResponse.json(
            { success: 0, error: "Geçersiz Base64 resim verisi." },
            { status: 400 }
          );
        }
        mimeType = matches[1];
        ext = mimeType.split("/")[1] || "png";
        if (ext === "jpeg") ext = "jpg";
        buffer = Buffer.from(matches[2], "base64");
      } else {
        // Fetch remote image from URL
        const response = await fetch(imageUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          },
        });

        if (!response.ok) {
          throw new Error(`Uzak resim indirilemedi (HTTP ${response.status})`);
        }

        const headerMime = response.headers.get("content-type");
        if (headerMime && headerMime.startsWith("image/")) {
          mimeType = headerMime.split(";")[0].trim();
          if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = "jpg";
          else if (mimeType.includes("webp")) ext = "webp";
          else if (mimeType.includes("gif")) ext = "gif";
          else if (mimeType.includes("svg")) ext = "svg";
          else if (mimeType.includes("png")) ext = "png";
          else if (mimeType.includes("avif")) ext = "avif";
        }

        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      }

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = `${uniqueSuffix}-image.${ext}`;

      const savedUrl = await saveImageBuffer(buffer, filename, mimeType);

      return NextResponse.json({
        success: 1,
        file: { url: savedUrl },
        url: savedUrl,
      });
    }

    // 2. FormData Request (Binary File upload)
    const formData = await request.formData();
    const file: File | null = (formData.get("file") || formData.get("image")) as unknown as File;

    if (!file) {
      return NextResponse.json({ success: 0, error: "Dosya bulunamadı." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let ext = "png";
    if (file.name && file.name.includes(".")) {
      ext = file.name.split(".").pop()?.toLowerCase() || "png";
    } else if (file.type && file.type.startsWith("image/")) {
      ext = file.type.split("/")[1] || "png";
      if (ext === "jpeg") ext = "jpg";
    }

    const baseName = (file.name || "image")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}-${baseName || "img"}.${ext}`;

    const savedUrl = await saveImageBuffer(buffer, filename, file.type || `image/${ext}`);

    return NextResponse.json({
      success: 1,
      file: { url: savedUrl },
      url: savedUrl,
    });
  } catch (error: any) {
    console.error("❌ [API:upload] Upload error:", error);
    return NextResponse.json(
      {
        success: 0,
        error: "Yükleme hatası: " + (error?.message || "Bilinmeyen hata"),
      },
      { status: 500 }
    );
  }
}
