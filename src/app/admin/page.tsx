import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NavBar from "@/components/NavBar";
import AdminTable from "@/components/AdminTable";

export default async function AdminPage() {
  const session = await getSession();
  if (!session.id || session.role !== "admin") redirect("/login");

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
    const answersByQ = new Map<number, Set<number>>();
    for (const a of user.answers) {
      if (!answersByQ.has(a.questionnaireId))
        answersByQ.set(a.questionnaireId, new Set());
      answersByQ.get(a.questionnaireId)!.add(a.questionId);
    }
    let completedCount = 0;
    for (const q of questionnaires) {
      if ((answersByQ.get(q.id)?.size ?? 0) >= q.junctions.length)
        completedCount++;
    }
    return { id: user.id, username: user.username, completedCount };
  });

  return (
    <>
      <NavBar username={session.username} />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-1">
            Click a user to view their questionnaire responses.
          </p>
        </div>
        <AdminTable users={userRows} />
      </main>
    </>
  );
}
