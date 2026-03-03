import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NavBar from "@/components/NavBar";
import QuestionnaireForm from "@/components/QuestionnaireForm";
import type { QuestionJson, QuestionWithMeta } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionnairePage({ params }: PageProps) {
  const session = await getSession();
  if (!session.id) redirect("/login");

  const { id } = await params;
  const questionnaireId = parseInt(id);
  if (isNaN(questionnaireId)) notFound();

  const questionnaire = await prisma.questionnaire.findUnique({
    where: { id: questionnaireId },
    include: {
      junctions: {
        include: { question: true },
        orderBy: { priority: "asc" },
      },
    },
  });

  if (!questionnaire) notFound();

  const questionIds = questionnaire.junctions.map((j) => j.questionId);
  const userId = session.id;

  const [currentAnswers, priorAnswers] = await Promise.all([
    prisma.userAnswer.findMany({
      where: { userId, questionnaireId, questionId: { in: questionIds } },
    }),
    prisma.userAnswer.findMany({
      where: {
        userId,
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

  return (
    <>
      <NavBar username={session.username} />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href="/questionnaires"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 capitalize">
            {questionnaire.name}
          </h1>
          <p className="text-gray-500 mt-1">
            Please answer all questions below.
          </p>
        </div>
        <QuestionnaireForm
          questionnaire={{ id: questionnaire.id, name: questionnaire.name, questions }}
        />
      </main>
    </>
  );
}
