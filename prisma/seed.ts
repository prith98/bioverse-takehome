import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function readCsv(filename: string): Record<string, string>[] {
  const content = readFileSync(
    path.join(process.cwd(), "public", filename),
    "utf-8"
  );
  return parse(content, { columns: true, skip_empty_lines: true, bom: true });
}

async function main() {
  console.log("Seeding database...");

  // Clear existing data in FK-safe order
  await prisma.userAnswer.deleteMany();
  await prisma.questionnaireJunction.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionnaire.deleteMany();
  await prisma.user.deleteMany();

  // Users (demo credentials — not from CSV)
  await prisma.user.createMany({
    data: [
      { id: 1, username: "user", password: "user", role: "user" },
      { id: 2, username: "admin", password: "admin", role: "admin" },
    ],
  });

  // Questionnaires — sourced from questionnaire_questionnaires.csv
  const questionnaires = readCsv("questionnaire_questionnaires.csv").map(
    (row) => ({ id: parseInt(row.id), name: row.name })
  );
  await prisma.questionnaire.createMany({ data: questionnaires });

  // Questions — sourced from questionnaire_questions.csv
  // The `question` column is a JSON string (RFC 4180 quoting)
  const questions = readCsv("questionnaire_questions.csv").map((row) => ({
    id: parseInt(row.id),
    question: JSON.parse(row.question),
  }));
  await prisma.question.createMany({ data: questions });

  // Junctions — sourced from questionnaire_junction.csv
  // CSV uses snake_case column names: question_id, questionnaire_id
  const junctions = readCsv("questionnaire_junction.csv").map((row) => ({
    id: parseInt(row.id),
    questionId: parseInt(row.question_id),
    questionnaireId: parseInt(row.questionnaire_id),
    priority: parseInt(row.priority),
  }));
  await prisma.questionnaireJunction.createMany({ data: junctions });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
