import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, budget, message, locale } = body ?? {};

    if (!name || !email || !message) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const created = await prisma.contactMessage.create({
      data: {
        name: String(name).slice(0, 200),
        email: String(email).slice(0, 200),
        budget: budget ? String(budget).slice(0, 200) : null,
        message: String(message).slice(0, 5000),
        locale: locale === "en" ? "en" : "fa"
      }
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    console.error("contact_post_error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// Submitted messages are read from the admin panel at /admin, via
// /api/admin/messages (cookie-protected) — see src/app/api/admin/.
