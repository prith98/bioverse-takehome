import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clear existing data in FK-safe order
  await prisma.userAnswer.deleteMany();
  await prisma.questionnaireJunction.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionnaire.deleteMany();
  await prisma.user.deleteMany();

  // Users
  await prisma.user.createMany({
    data: [
      { id: 1, username: "user", password: "user", role: "user" },
      { id: 2, username: "admin", password: "admin", role: "admin" },
    ],
  });

  // Questionnaires
  await prisma.questionnaire.createMany({
    data: [
      { id: 1, name: "semaglutide" },
      { id: 2, name: "nad-injection" },
      { id: 3, name: "metformin" },
    ],
  });

  // Questions
  await prisma.question.createMany({
    data: [
      {
        id: 1,
        question: {
          type: "mcq",
          question: "Why are you interested in this product? Select all that apply.",
          options: [
            "Improve blood pressure",
            "Reduce risk of future cardiac events",
            "Support lifestyle changes",
            "Longevity benefits",
          ],
        },
      },
      {
        id: 2,
        question: {
          type: "input",
          question:
            "Tell us anything else you'd like your provider to know when prescribing your medication.",
        },
      },
      {
        id: 3,
        question: {
          type: "input",
          question: "What is your current weight?",
        },
      },
      {
        id: 4,
        question: {
          type: "mcq",
          question:
            "Which of the following have you tried in the past? Select all that apply.",
          options: [
            "Keto or low carb",
            "Plant-based",
            "Macro or calorie counting",
            "Weight Watchers",
            "Noom",
            "Calibrate",
            "Found",
            "Alpha",
            "Push Health",
          ],
        },
      },
      {
        id: 5,
        question: {
          type: "mcq",
          question: "What's your weight loss goal?",
          options: [
            "Losing 1-15 pounds",
            "Losing 16-50 pounds",
            "Losing 51+ pounds",
            "Not sure, I just need to lose weight",
          ],
        },
      },
      {
        id: 6,
        question: {
          type: "input",
          question: "Please list any new medications you are taking.",
        },
      },
    ],
  });

  // Questionnaire Junctions
  await prisma.questionnaireJunction.createMany({
    data: [
      { id: 1, questionId: 1, questionnaireId: 1, priority: 0 },
      { id: 2, questionId: 2, questionnaireId: 1, priority: 10 },
      { id: 3, questionId: 4, questionnaireId: 1, priority: 20 },
      { id: 4, questionId: 1, questionnaireId: 2, priority: 0 },
      { id: 5, questionId: 2, questionnaireId: 2, priority: 10 },
      { id: 6, questionId: 3, questionnaireId: 2, priority: 20 },
      { id: 7, questionId: 1, questionnaireId: 3, priority: 0 },
      { id: 8, questionId: 5, questionnaireId: 3, priority: 10 },
      { id: 9, questionId: 6, questionnaireId: 3, priority: 20 },
    ],
  });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
