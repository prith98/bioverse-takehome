export type QuestionType = "input" | "mcq";

export interface QuestionJson {
  type: QuestionType;
  question: string;
  options?: string[];
}

export interface QuestionWithMeta {
  id: number;
  questionJson: QuestionJson;
  priority: number;
  existingAnswer: string[] | null;
}

export interface QuestionnaireWithQuestions {
  id: number;
  name: string;
  questions: QuestionWithMeta[];
}

export interface UserRow {
  id: number;
  username: string;
  completedCount: number;
}

export interface AnsweredQuestion {
  questionText: string;
  answer: string[];
}

export interface AnsweredQuestionnaire {
  questionnaireName: string;
  questions: AnsweredQuestion[];
}
