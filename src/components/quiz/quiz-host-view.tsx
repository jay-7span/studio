'use client';

import type { Quiz, Question } from '@/types/quiz';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Users, ClipboardCheck, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';

interface QuizHostViewProps {
  quiz: Quiz;
}

export function QuizHostView({ quiz }: QuizHostViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  // Mock participant count
  const [participantCount, setParticipantCount] = useState(0);

  const { toast } = useToast();

  useEffect(() => {
    // Simulate participants joining
    const interval = setInterval(() => {
      if (quizStarted && !quizEnded) {
        setParticipantCount(prev => prev + Math.floor(Math.random() * 3));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [quizStarted, quizEnded]);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleStartQuiz = () => {
    setQuizStarted(true);
    toast({ title: "Quiz Started!", description: "Participants can now see the first question." });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setQuizEnded(true);
      toast({ title: "Quiz Ended!", description: "All questions have been presented." });
    }
  };
  
  const copyJoinInfo = () => {
    const joinLink = `${window.location.origin}/quiz/${quiz.id}`;
    const textToCopy = `Join my QuizWhiz: "${quiz.title}"\nCode: ${quiz.code || quiz.id}\nLink: ${joinLink}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: "Copied!", description: "Join info copied to clipboard." }))
      .catch(() => toast({ title: "Copy Failed", variant: "destructive" }));
  };

  if (!quizStarted) {
    return (
      <Card className="w-full max-w-3xl mx-auto text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-4xl">Get Ready to Host: {quiz.title}</CardTitle>
          <CardDescription className="text-lg">{quiz.description || "Prepare for an exciting quiz session!"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-primary/10 rounded-lg border border-primary">
            <p className="text-xl font-semibold">Quiz Code: <span className="text-3xl text-primary font-bold tracking-wider">{quiz.code || quiz.id}</span></p>
            <p className="text-muted-foreground mt-1">Share this code or link with your participants.</p>
            <Button onClick={copyJoinInfo} className="mt-4" variant="outline">
              <ClipboardCheck className="mr-2 h-5 w-5" /> Copy Join Info
            </Button>
          </div>
          <Image 
            src="https://placehold.co/600x300.png" 
            alt="Host waiting screen" 
            width={600} 
            height={300} 
            className="mx-auto rounded-lg shadow-md"
            data-ai-hint="presentation audience screen"
          />
          <p className="text-lg"><Users className="inline mr-2 h-6 w-6 text-primary" /> <span className="font-bold">{participantCount}</span> participants waiting...</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartQuiz} size="lg" className="w-full text-xl py-7">
            Start Quiz Now
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (quizEnded) {
    return (
       <Card className="w-full max-w-2xl mx-auto text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-4xl">Quiz Ended!</CardTitle>
          <CardDescription>Thank you for hosting "{quiz.title}".</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <CheckCircle className="h-24 w-24 text-green-500 mx-auto my-4" />
          <p className="text-xl">Total Participants: {participantCount}</p>
          <p className="text-lg">You can now view the results and leaderboard.</p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button asChild size="lg">
            <Link href={`/quiz/${quiz.id}/results`}>View Leaderboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (!currentQuestion) return <div className="text-center text-xl">Loading question...</div>;

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-3xl md:text-4xl">{quiz.title} - Host View</CardTitle>
            <div className="text-right">
                <p className="text-lg font-semibold text-primary">Question {currentQuestionIndex + 1} / {quiz.questions.length}</p>
                <p className="text-sm text-muted-foreground"><Users className="inline mr-1 h-4 w-4" /> {participantCount} Participants</p>
            </div>
          </div>
          <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} className="w-full h-3" />
        </CardHeader>
        <CardContent className="space-y-6 py-8 px-6 md:px-10 min-h-[300px] flex flex-col justify-center">
          <p className="text-3xl font-semibold text-center leading-tight">{currentQuestion.text}</p>
          
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {currentQuestion.options.map(option => (
                <div key={option.id} className={`p-4 border rounded-lg text-xl text-center ${option.isCorrect ? 'border-green-500 bg-green-500/10 font-semibold text-green-700 dark:text-green-300' : 'border-border'}`}>
                  {option.text}
                  {option.isCorrect && <CheckCircle className="inline ml-2 h-6 w-6 text-green-500" />}
                </div>
              ))}
            </div>
          )}

          {currentQuestion.type === 'true-false' && (
            <div className="text-center mt-6 space-x-4">
                <span className={`p-4 border rounded-lg text-2xl ${currentQuestion.correctAnswer === 'true' ? 'border-green-500 bg-green-500/10 font-semibold text-green-700 dark:text-green-300' : 'border-border'}`}>True {currentQuestion.correctAnswer === 'true' && <CheckCircle className="inline ml-2 h-6 w-6 text-green-500" />}</span>
                <span className={`p-4 border rounded-lg text-2xl ${currentQuestion.correctAnswer === 'false' ? 'border-green-500 bg-green-500/10 font-semibold text-green-700 dark:text-green-300' : 'border-border'}`}>False {currentQuestion.correctAnswer === 'false' && <CheckCircle className="inline ml-2 h-6 w-6 text-green-500" />}</span>
            </div>
          )}

           {currentQuestion.type === 'short-answer' && currentQuestion.correctAnswer && (
            <div className="text-center mt-6">
              <p className="text-muted-foreground text-lg">Correct Answer:</p>
              <p className="p-4 border rounded-lg text-2xl border-green-500 bg-green-500/10 font-semibold text-green-700 dark:text-green-300 inline-block">
                {currentQuestion.correctAnswer} <CheckCircle className="inline ml-2 h-6 w-6 text-green-500" />
              </p>
            </div>
          )}
          
          {/* Placeholder for real-time answer distribution chart */}
          <div className="mt-8 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto my-2" />
            <p className="text-muted-foreground">(Real-time answer statistics would appear here)</p>
          </div>

        </CardContent>
        <CardFooter className="p-6">
          <Button onClick={handleNextQuestion} size="lg" className="w-full text-xl py-6">
            {currentQuestionIndex < quiz.questions.length - 1 ? "Next Question" : "End Quiz"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
