export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

export interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: AnswerOption[]; // For multiple-choice
  // For true/false, correctAnswer is 'true' or 'false'.
  // For short-answer, correctAnswer is the expected string.
  // For multiple-choice, this is not directly used, rely on options' isCorrect.
  correctAnswer?: string; 
  hint?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  code?: string; // Join code, can be same as id for simplicity
}

export interface Participant {
  id: string;
  name: string;
  score: number;
  quizId: string;
}

// Represents a participant's answer to a question
export interface QuizAttempt {
  quizId: string;
  participantName: string;
  answers: { questionId: string; answer: string | string[] }[]; // string for T/F, ShortAnswer; string[] for MCQ option IDs
  score: number;
  submittedAt: Date;
}
