
'use client';

import { QuizHostView } from '@/components/quiz/quiz-host-view';
import type { Quiz } from '@/types/quiz';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Mock quiz data (same as in player page for consistency in demo)
const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'history101',
    title: 'World History Trivia',
    description: 'Test your knowledge of world history!',
    code: 'HIST101',
    questions: [
      { id: 'q1', type: 'multiple-choice', text: 'Who was the first President of the United States?', options: [{id: 'opt1', text: 'Thomas Jefferson', isCorrect: false}, {id: 'opt2', text: 'George Washington', isCorrect: true}, {id: 'opt3', text: 'Abraham Lincoln', isCorrect: false}], hint: 'He was a general in the Revolutionary War.' },
      { id: 'q2', type: 'true-false', text: 'The Roman Empire fell in 476 AD.', correctAnswer: 'true', hint: 'It marks the beginning of the Dark Ages in Europe.' },
      { id: 'q3', type: 'short-answer', text: 'In which country did the Renaissance begin?', correctAnswer: 'Italy', hint: 'A country known for its art and cuisine, shaped like a boot.' },
    ],
  },
   {
    id: 'science202',
    title: 'General Science Quiz',
    code: 'SCI202',
    questions: [
      { id: 's1', type: 'multiple-choice', text: 'What is the chemical symbol for water?', options: [{id: 'sopt1', text: 'O2', isCorrect: false}, {id: 'sopt2', text: 'H2O', isCorrect: true}, {id: 'sopt3', text: 'CO2', isCorrect: false}], hint: 'Two hydrogen atoms and one oxygen atom.' },
      { id: 's2', type: 'true-false', text: 'The Earth is flat.', correctAnswer: 'false', hint: 'Think about how ships disappear over the horizon.' },
    ],
  }
];

export default function QuizHostPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizId) {
        setIsLoading(true);
        let foundQuizData: Quiz | undefined = undefined;

        // 1. Check MOCK_QUIZZES first
        foundQuizData = MOCK_QUIZZES.find(q => q.id === quizId || q.code === quizId);

        // 2. If not found in mocks, check localStorage for user-created quizzes
        if (!foundQuizData) {
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('quiz-')) { // Convention for stored quiz keys
                        const item = localStorage.getItem(key);
                        if (item) {
                            const storedQuiz = JSON.parse(item) as Quiz;
                            // Check if the URL parameter (quizId) matches the stored quiz's ID or its code
                            if (storedQuiz.id === quizId || storedQuiz.code === quizId) {
                                foundQuizData = storedQuiz;
                                break; // Found a match
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Error while searching localStorage for quiz:", e);
            }
        }
        
        if (foundQuizData) {
            setQuiz(foundQuizData);
            setError(null);
        } else {
            setError(`Quiz with ID or code "${quizId}" not found. Please verify the code/ID or ensure the quiz has been properly saved and is available.`);
            setQuiz(null);
        }
        setIsLoading(false);
    } else {
        setError("No quiz ID or code specified in the URL.");
        setIsLoading(false);
        setQuiz(null);
    }
  }, [quizId]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl text-destructive mb-4">{error || 'Quiz not available for hosting.'}</h2>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );
  }

  return <QuizHostView quiz={quiz} />;
}
