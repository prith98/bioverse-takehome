import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const questionnaires = await prisma.questionnaire.findMany({
    select: { id: true, name: true },
    orderBy: { id: "asc" },
  });

  return NextResponse.json({ questionnaires });
}
