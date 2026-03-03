import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { QuestionJson, QuestionWithMeta } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const questionnaireId = parseInt(id);

  if (isNaN(questionnaireId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const questionnaire = await prisma.questionnaire.findUnique({
    where: { id: questionnaireId },
    include: {
      junctions: {
        include: { question: true },
        orderBy: { priority: "asc" },
      },
    },
  });

  if (!questionnaire) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const questionIds = questionnaire.junctions.map((j) => j.questionId);

  const [currentAnswers, priorAnswers] = await Promise.all([
    prisma.userAnswer.findMany({
      where: {
        userId: session.id,
        questionnaireId,
        questionId: { in: questionIds },
      },
    }),
    prisma.userAnswer.findMany({
      where: {
        userId: session.id,
        questionId: { in: questionIds },
        NOT: { questionnaireId },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const currentMap = new Map(
    currentAnswers.map((a) => [a.questionId, a.answer as string[]])
  );
  const priorMap = new Map<number, string[]>();
  for (const a of priorAnswers) {
    if (!priorMap.has(a.questionId)) priorMap.set(a.questionId, a.answer as string[]);
  }

  const questions: QuestionWithMeta[] = questionnaire.junctions.map((j) => ({
    id: j.questionId,
    questionJson: j.question.question as QuestionJson,
    priority: j.priority,
    existingAnswer: currentMap.get(j.questionId) ?? priorMap.get(j.questionId) ?? null,
  }));

  return NextResponse.json({
    questionnaire: {
      id: questionnaire.id,
      name: questionnaire.name,
      questions,
    },
  });
}
