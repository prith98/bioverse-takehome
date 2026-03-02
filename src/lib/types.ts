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

export interface QuestionnaireRow {
  id: number;
  name: string;
}

export interface UserRow {
  id: number;
  username: string;
  completedByQuestionnaire: Record<number, boolean>;
}

export interface AnsweredQuestion {
  questionText: string;
  answer: string[];
}

export interface AnsweredQuestionnaire {
  questionnaireId: number;
  questionnaireName: string;
  questions: AnsweredQuestion[];
}
