import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.id || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [users, questionnaires] = await Promise.all([
    prisma.user.findMany({
      where: { role: "user" },
      include: {
        answers: { select: { questionnaireId: true, questionId: true } },
      },
    }),
    prisma.questionnaire.findMany({
      include: { junctions: { select: { questionId: true } } },
    }),
  ]);

  const userRows = users.map((user) => {
    const answersByQuestionnaire = new Map<number, Set<number>>();
    for (const a of user.answers) {
      if (!answersByQuestionnaire.has(a.questionnaireId)) {
        answersByQuestionnaire.set(a.questionnaireId, new Set());
      }
      answersByQuestionnaire.get(a.questionnaireId)!.add(a.questionId);
    }

    let completedCount = 0;
    for (const q of questionnaires) {
      const totalQuestions = q.junctions.length;
      const answeredQuestions = answersByQuestionnaire.get(q.id)?.size ?? 0;
      if (answeredQuestions >= totalQuestions) completedCount++;
    }

    return { id: user.id, username: user.username, completedCount };
  });

  return NextResponse.json({ users: userRows });
}
