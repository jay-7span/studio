'use client';

import { QuizPlayerView } from '@/components/quiz/quiz-player-view';
import type { Quiz } from '@/types/quiz';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

// Mock quiz data - in a real app, this would be fetched from a backend
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


export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizId) {
      // Simulate fetching quiz data
      // Try fetching from localStorage first (if created in this session)
      const storedQuizData = localStorage.getItem(`quiz-${quizId}`);
      let foundQuiz: Quiz | undefined;

      if (storedQuizData) {
        try {
          foundQuiz = JSON.parse(storedQuizData) as Quiz;
        } catch (e) {
          console.error("Failed to parse quiz from localStorage", e);
        }
      }
      
      if (!foundQuiz) {
        // Fallback to mock data if not in localStorage or if parsing failed
        foundQuiz = MOCK_QUIZZES.find(q => q.id === quizId || q.code === quizId);
      }

      if (foundQuiz) {
        setQuiz(foundQuiz);
      } else {
        setError(`Quiz with ID or code "${quizId}" not found.`);
      }
      setIsLoading(false);
    }
  }, [quizId]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (participantName.trim()) {
      setNameSubmitted(true);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl text-destructive mb-4">{error}</h2>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );
  }
  
  if (!quiz) {
     return ( // Should ideally be caught by error state, but as a fallback
      <div className="text-center py-10">
        <h2 className="text-2xl text-destructive mb-4">Quiz not available.</h2>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );
  }

  if (!nameSubmitted) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to {quiz.title}!</CardTitle>
            <CardDescription>Please enter your name to start the quiz.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <Label htmlFor="participantName" className="text-base">Your Name</Label>
                <Input
                  id="participantName"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="text-lg py-3"
                />
              </div>
              <Button type="submit" className="w-full text-lg py-3">Start Quiz</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <QuizPlayerView quiz={quiz} participantName={participantName} />;
}
