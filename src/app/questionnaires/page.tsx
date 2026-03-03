import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NavBar from "@/components/NavBar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function QuestionnairesPage() {
  const session = await getSession();
  if (!session.id) redirect("/login");

  const [questionnaires, userAnswers] = await Promise.all([
    prisma.questionnaire.findMany({
      include: { junctions: { select: { questionId: true } } },
      orderBy: { id: "asc" },
    }),
    prisma.userAnswer.findMany({
      where: { userId: session.id },
      select: { questionnaireId: true, questionId: true },
    }),
  ]);

  // Build a map of questionnaireId → set of answered questionIds
  const answeredByQ = new Map<number, Set<number>>();
  for (const a of userAnswers) {
    if (!answeredByQ.has(a.questionnaireId))
      answeredByQ.set(a.questionnaireId, new Set());
    answeredByQ.get(a.questionnaireId)!.add(a.questionId);
  }

  return (
    <>
      <NavBar username={session.username} />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Questionnaires
          </h1>
          <p className="text-gray-500 mt-1">
            Select a questionnaire to get started.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {questionnaires.map((q) => {
            const completed =
              (answeredByQ.get(q.id)?.size ?? 0) >= q.junctions.length;
            return (
              <Link key={q.id} href={`/questionnaires/${q.id}`}>
                <Card className="hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base capitalize">{q.name}</CardTitle>
                      {completed && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      )}
                    </div>
                    <CardDescription>Intake questionnaire</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
