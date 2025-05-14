// use server'

/**
 * @fileOverview AI agent that generates hints for quiz questions.
 *
 * - generateQuizHints - A function that generates hints for a list of quiz questions.
 * - GenerateQuizHintsInput - The input type for the generateQuizHints function.
 * - GenerateQuizHintsOutput - The return type for the generateQuizHints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizHintsInputSchema = z.object({
  questions: z.array(
    z.string().describe('A quiz question to generate a hint for.')
  ).describe('A list of quiz questions.'),
});
export type GenerateQuizHintsInput = z.infer<typeof GenerateQuizHintsInputSchema>;

const GenerateQuizHintsOutputSchema = z.object({
  hints: z.array(
    z.string().describe('A hint for the corresponding quiz question.')
  ).describe('A list of hints for the quiz questions.'),
});
export type GenerateQuizHintsOutput = z.infer<typeof GenerateQuizHintsOutputSchema>;

export async function generateQuizHints(input: GenerateQuizHintsInput): Promise<GenerateQuizHintsOutput> {
  return generateQuizHintsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizHintsPrompt',
  input: {schema: GenerateQuizHintsInputSchema},
  output: {schema: GenerateQuizHintsOutputSchema},
  prompt: `You are an AI quiz assistant that is helping create quizzes.

You are provided a list of quiz questions. For each question, you will generate a hint that can help the user answer the question without giving away the answer.

Here are the questions:

{{#each questions}}
  Question {{@index}}: {{{this}}}
{{/each}}

Return the hints in the same order as the questions were provided.

Ensure the hints are helpful but not too obvious.

Here is the output format:
{
  "hints": [
    "hint 1",
    "hint 2",
    ...
  ]
}
`,
});

const generateQuizHintsFlow = ai.defineFlow(
  {
    name: 'generateQuizHintsFlow',
    inputSchema: GenerateQuizHintsInputSchema,
    outputSchema: GenerateQuizHintsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
