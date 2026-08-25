import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

// Helper to save image buffer to either local storage or MinIO
async function saveImageBuffer(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  const isLocal = process.env.NODE_ENV === "development" || !process.env.MINIO_ENDPOINT;

  if (isLocal) {
    const uploadDir = join(process.cwd(), "public", "images");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);
    return `/images/${filename}`;
  }

  // Production - MinIO (S3)
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

      // If it's already a local permanent URL, return directly
      if (imageUrl.startsWith("/images/") || imageUrl.startsWith("/uploads/")) {
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
    const file: File | null = formData.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: 0, error: "Dosya bulunamadı." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name && file.name.includes(".")
      ? file.name.split(".").pop()?.toLowerCase() || "png"
      : file.type ? file.type.split("/")[1] || "png" : "png";

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
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: 0,
        error: "Yükleme hatası: " + (error?.message || "Bilinmeyen hata"),
      },
      { status: 500 }
    );
  }
}
