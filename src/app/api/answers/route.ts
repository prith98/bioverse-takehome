import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

interface AnswerPayload {
  questionId: number;
  answer: string[];
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { questionnaireId, answers } = (await req.json()) as {
    questionnaireId: number;
    answers: AnswerPayload[];
  };

  if (!questionnaireId || !answers || !Array.isArray(answers)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Validate: no empty answers, no whitespace-only strings
  for (const { answer } of answers) {
    if (!answer || answer.length === 0) {
      return NextResponse.json(
        { error: "All questions must be answered" },
        { status: 400 }
      );
    }
    for (const a of answer) {
      if (!a || a.trim().length === 0) {
        return NextResponse.json(
          { error: "Answers cannot be empty or whitespace" },
          { status: 400 }
        );
      }
    }
  }

  const userId = session.id;

  await prisma.$transaction(
    answers.map(({ questionId, answer }) =>
      prisma.userAnswer.upsert({
        where: {
          userId_questionId_questionnaireId: {
            userId,
            questionId,
            questionnaireId,
          },
        },
        update: { answer },
        create: { userId, questionId, questionnaireId, answer },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
