import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const allowed = [
    "slug",
    "order",
    "titleFa",
    "titleEn",
    "taglineFa",
    "taglineEn",
    "descriptionFa",
    "descriptionEn",
    "category",
    "year",
    "coverImage",
    "published"
  ] as const;

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = key === "order" ? Number(body[key]) : body[key];
  }

  try {
    const project = await prisma.project.update({
      where: { id: params.id },
      data
    });
    return NextResponse.json({ project });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "slug_taken" }, { status: 409 });
    }
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    console.error("admin_project_update_error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    await prisma.project.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    console.error("admin_project_delete_error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
