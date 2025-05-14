'use server';

import { generateQuizHints, type GenerateQuizHintsInput, type GenerateQuizHintsOutput } from '@/ai/flows/generate-quiz-hints';
import { z } from 'zod';

const GetAIHintsActionInputSchema = z.object({
  questions: z.array(z.string().min(1, "Question text cannot be empty.")).min(1, "At least one question is required."),
});

export async function getAIHintsAction(input: { questions: string[] }): Promise<{ hints?: string[]; error?: string }> {
  const validationResult = GetAIHintsActionInputSchema.safeParse(input);
  if (!validationResult.success) {
    return { error: validationResult.error.flatten().fieldErrors.questions?.join(", ") || "Invalid input." };
  }

  try {
    const aiInput: GenerateQuizHintsInput = { questions: validationResult.data.questions };
    const result: GenerateQuizHintsOutput = await generateQuizHints(aiInput);
    return { hints: result.hints };
  } catch (e) {
    console.error("Error generating AI hints:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while generating hints.";
    return { error: errorMessage };
  }
}
