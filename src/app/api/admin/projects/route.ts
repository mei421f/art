import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const {
    slug,
    order,
    titleFa,
    titleEn,
    taglineFa,
    taglineEn,
    descriptionFa,
    descriptionEn,
    category,
    year,
    coverImage,
    published
  } = body;

  if (!slug || !titleFa || !titleEn || !category || !year) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const project = await prisma.project.create({
      data: {
        slug: String(slug).trim(),
        order: Number(order) || 0,
        titleFa: String(titleFa),
        titleEn: String(titleEn),
        taglineFa: String(taglineFa || ""),
        taglineEn: String(taglineEn || ""),
        descriptionFa: String(descriptionFa || ""),
        descriptionEn: String(descriptionEn || ""),
        category: String(category),
        year: String(year),
        coverImage: coverImage ? String(coverImage) : null,
        published: published !== false
      }
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "slug_taken" }, { status: 409 });
    }
    console.error("admin_project_create_error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
