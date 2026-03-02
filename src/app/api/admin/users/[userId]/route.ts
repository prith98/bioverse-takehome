import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { QuestionJson } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session.id || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const uid = parseInt(userId);

  if (isNaN(uid)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const answers = await prisma.userAnswer.findMany({
    where: { userId: uid },
    include: {
      question: true,
      questionnaire: true,
    },
    orderBy: [{ questionnaireId: "asc" }, { questionId: "asc" }],
  });

  // Group by questionnaire
  const grouped = new Map<
    number,
    { questionnaireId: number; questionnaireName: string; questions: { questionText: string; answer: string[] }[] }
  >();

  for (const a of answers) {
    if (!grouped.has(a.questionnaireId)) {
      grouped.set(a.questionnaireId, {
        questionnaireId: a.questionnaireId,
        questionnaireName: a.questionnaire.name,
        questions: [],
      });
    }
    const qJson = a.question.question as unknown as QuestionJson;
    grouped.get(a.questionnaireId)!.questions.push({
      questionText: qJson.question,
      answer: a.answer as string[],
    });
  }

  return NextResponse.json({
    questionnaires: Array.from(grouped.values()),
  });
}
