// ==========================================
// 🎓 Dynamic Image Serving Endpoint
// ==========================================
// Next.js Standalone IIS ortamında çalışma zamanında yüklenen görsellerin
// 404 vermeden, doğru MIME tipi ve HTTP cache başlıkları ile servis edilmesini sağlar.
// GET /api/images/[filename]

import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string[] | string }> }
) {
  try {
    const resolvedParams = await params;
    const rawSegments = Array.isArray(resolvedParams.filename)
      ? resolvedParams.filename
      : [resolvedParams.filename];

    const cleanFilename = rawSegments
      .join("/")
      .replace(/\.\./g, "") // path traversal koruması
      .replace(/^\/+/, "");

    if (!cleanFilename) {
      return new NextResponse("Not Found", { status: 404 });
    }

    let cwd = process.cwd();
    const normalized = cwd.replace(/\\/g, "/").toLowerCase();
    if (normalized.endsWith("/public")) {
      cwd = join(cwd, "..");
    }

    const candidatePaths = [
      join(cwd, "public", "uploads", cleanFilename),
      join(cwd, "public", "images", cleanFilename),
      join(cwd, "uploads", cleanFilename),
      join(cwd, "public", "public", "uploads", cleanFilename), // Fallback for any legacy uploads
    ];

    let foundPath: string | null = null;
    for (const p of candidatePaths) {
      if (existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const fileBuffer = await readFile(foundPath);
    const ext = extname(cleanFilename).toLowerCase();
    const contentType = MIME_TYPES[ext] || "image/png";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("❌ [API:images] Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
