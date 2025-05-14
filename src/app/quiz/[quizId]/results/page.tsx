'use client';

import { LeaderboardDisplay } from '@/components/quiz/leaderboard-display';
import type { Quiz, QuizAttempt } from '@/types/quiz';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Mock quiz data (same as in player/host pages for consistency in demo)
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


export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizId) {
      // Simulate fetching quiz data
      const storedQuizData = localStorage.getItem(`quiz-${quizId}`);
      let foundQuiz: Quiz | undefined;
      if (storedQuizData) {
        try {
          foundQuiz = JSON.parse(storedQuizData) as Quiz;
        } catch (e) { console.error(e); }
      }
      if (!foundQuiz) foundQuiz = MOCK_QUIZZES.find(q => q.id === quizId || q.code === quizId);
      
      if (foundQuiz) {
        setQuiz(foundQuiz);
        // Fetch attempts from localStorage (mocking backend)
        const storedAttempts = localStorage.getItem(`attempts-${quizId}`);
        if (storedAttempts) {
          try {
            setAttempts(JSON.parse(storedAttempts) as QuizAttempt[]);
          } catch (e) {
            console.error("Failed to parse attempts from localStorage", e);
            setAttempts([]); // Default to empty if parsing fails
          }
        } else {
          setAttempts([]); // No attempts found
        }
      } else {
        setError(`Quiz with ID or code "${quizId}" not found.`);
      }
      setIsLoading(false);
    }
  }, [quizId]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl text-destructive mb-4">{error || 'Quiz results not available.'}</h2>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <LeaderboardDisplay 
        quizTitle={quiz.title} 
        attempts={attempts}
        totalQuestions={quiz.questions.length}
      />
      <div className="text-center mt-8">
        <Button onClick={() => router.push('/')} size="lg" variant="outline">Back to Home</Button>
      </div>
    </div>
  );
}
