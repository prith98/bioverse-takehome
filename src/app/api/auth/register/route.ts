import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { username, password, role } = await req.json();

    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    const assignedRole = role === "admin" ? "admin" : "user";

    await prisma.user.create({
      data: { username, password, role: assignedRole },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
