import Link from "next/link";
import { redirect } from "next/navigation";
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

  const questionnaires = await prisma.questionnaire.findMany({
    select: { id: true, name: true },
    orderBy: { id: "asc" },
  });

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
          {questionnaires.map((q) => (
            <Link key={q.id} href={`/questionnaires/${q.id}`}>
              <Card className="hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-base capitalize">{q.name}</CardTitle>
                  <CardDescription>Intake questionnaire</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
