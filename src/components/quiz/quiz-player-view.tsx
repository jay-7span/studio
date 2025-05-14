'use client';

import type { Quiz, Question, AnswerOption, QuizAttempt } from '@/types/quiz';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Lightbulb, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface QuizPlayerViewProps {
  quiz: Quiz;
  participantName: string;
}

type SelectedAnswersMap = { [questionId: string]: string | string[] }; // string for T/F, SA; string[] for MCQ

export function QuizPlayerView({ quiz, participantName }: QuizPlayerViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswersMap>({});
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{ [questionId: string]: { correct: boolean; message: string } }>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // Example: 30 seconds per question
  const [timerActive, setTimerActive] = useState(true);

  const { toast } = useToast();
  const router = useRouter();

  const currentQuestion = quiz.questions[currentQuestionIndex];

  useEffect(() => {
    // Reset timer for new question or if quiz finished
    if (!quizFinished) {
      setTimeLeft(30); 
      setTimerActive(true);
      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleNextQuestion(true); // Auto-submit or move to next
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, quizFinished]);


  const handleAnswerChange = (questionId: string, answer: string | string[], questionType: Question['type']) => {
    if (questionType === 'multiple-choice') {
      const currentSelection = (selectedAnswers[questionId] as string[] || []);
      const newSelection = currentSelection.includes(answer as string)
        ? currentSelection.filter(item => item !== answer)
        : [...currentSelection, answer as string];
      setSelectedAnswers(prev => ({ ...prev, [questionId]: newSelection }));
    } else {
      setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
    }
    setTimerActive(false); // Stop timer on interaction
  };

  const handleSubmitAnswer = () => {
    const selectedAnswer = selectedAnswers[currentQuestion.id];
    if (selectedAnswer === undefined || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)) {
      toast({ title: "No Answer Selected", description: "Please select an answer.", variant: "destructive" });
      return;
    }

    let isCorrect = false;
    let message = '';

    if (currentQuestion.type === 'multiple-choice') {
      const correctOptionIds = currentQuestion.options?.filter(opt => opt.isCorrect).map(opt => opt.id) || [];
      const selectedOptionIds = selectedAnswer as string[];
      isCorrect = correctOptionIds.length === selectedOptionIds.length && correctOptionIds.every(id => selectedOptionIds.includes(id));
    } else if (currentQuestion.type === 'true-false') {
      isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'short-answer') {
      // Simple case-sensitive comparison for short answers
      isCorrect = (selectedAnswer as string).trim() === currentQuestion.correctAnswer?.trim();
    }
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      message = "Correct!";
    } else {
      message = `Incorrect. The correct answer was: ${currentQuestion.type === 'multiple-choice' ? currentQuestion.options?.filter(o => o.isCorrect).map(o=>o.text).join(', ') : currentQuestion.correctAnswer || 'N/A'}`;
    }

    setFeedback(prev => ({ ...prev, [currentQuestion.id]: { correct: isCorrect, message } }));
    setTimerActive(false); // Ensure timer is stopped
  };

  const handleNextQuestion = (autoNext = false) => {
    if (!feedback[currentQuestion.id] && !autoNext) { // if answer not submitted yet
        handleSubmitAnswer(); // Submit then move next
        // Wait a bit for feedback to show
        setTimeout(() => {
            moveToNext();
        }, 1500);
    } else {
        moveToNext();
    }
  };

  const moveToNext = () => {
    setShowHint(false);
    setFeedback(prev => ({...prev, [currentQuestion.id]: prev[currentQuestion.id] || {correct: false, message: "Time's up!"}})); // Mark unanswered if time ran out
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setQuizFinished(true);
      saveAttempt();
    }
  }

  const saveAttempt = () => {
    const attempt: QuizAttempt = {
      quizId: quiz.id,
      participantName,
      answers: Object.entries(selectedAnswers).map(([questionId, answer]) => ({ questionId, answer })),
      score,
      submittedAt: new Date(),
    };
    // In a real app, send this to a backend
    // For demo, store in localStorage
    const attempts = JSON.parse(localStorage.getItem(`attempts-${quiz.id}`) || '[]');
    attempts.push(attempt);
    localStorage.setItem(`attempts-${quiz.id}`, JSON.stringify(attempts));
    console.log("Quiz attempt saved:", attempt);
  };


  if (quizFinished) {
    return (
      <Card className="w-full max-w-2xl mx-auto text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-4xl">Quiz Finished!</CardTitle>
          <CardDescription>Well done, {participantName}!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-2xl font-semibold">Your Score: {score} / {quiz.questions.length}</p>
          <Image src="https://placehold.co/400x300.png" alt="Quiz Completion" width={400} height={300} className="mx-auto rounded-lg" data-ai-hint="celebration trophy" />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button onClick={() => router.push(`/quiz/${quiz.id}/results`)} size="lg">View Leaderboard</Button>
          <Button onClick={() => router.push('/')} variant="outline" size="lg">Back to Home</Button>
        </CardFooter>
      </Card>
    );
  }

  if (!currentQuestion) return <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto my-10" />;
  
  const questionFeedback = feedback[currentQuestion.id];

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl">{quiz.title}</CardTitle>
            <span className="text-lg font-semibold text-primary">{currentQuestionIndex + 1} / {quiz.questions.length}</span>
          </div>
          <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} className="w-full h-3 mt-2" />
           <div className="text-center mt-2 text-2xl font-mono text-accent">Time Left: {timeLeft}s</div>
        </CardHeader>
        <CardContent className="space-y-6 py-8 px-6 md:px-10">
          <p className="text-2xl font-semibold leading-relaxed">{currentQuestion.text}</p>

          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map(option => (
                <div key={option.id} className={`flex items-center space-x-3 p-4 border rounded-lg transition-all ${ (selectedAnswers[currentQuestion.id] as string[] || []).includes(option.id) ? 'bg-primary/10 border-primary shadow-md' : 'hover:bg-muted/50' } ${questionFeedback && (option.isCorrect ? 'border-green-500 bg-green-500/10' : ((selectedAnswers[currentQuestion.id] as string[] || []).includes(option.id) && !option.isCorrect ? 'border-red-500 bg-red-500/10' : '')) }`}>
                  <Checkbox
                    id={`option-${option.id}`}
                    checked={(selectedAnswers[currentQuestion.id] as string[] || []).includes(option.id)}
                    onCheckedChange={() => handleAnswerChange(currentQuestion.id, option.id, 'multiple-choice')}
                    disabled={!!questionFeedback}
                  />
                  <Label htmlFor={`option-${option.id}`} className="text-lg font-normal flex-grow cursor-pointer">{option.text}</Label>
                   {questionFeedback && option.isCorrect && <CheckCircle className="h-6 w-6 text-green-500" />}
                   {questionFeedback && (selectedAnswers[currentQuestion.id] as string[] || []).includes(option.id) && !option.isCorrect && <XCircle className="h-6 w-6 text-red-500" />}
                </div>
              ))}
            </div>
          )}

          {currentQuestion.type === 'true-false' && (
            <RadioGroup
              value={selectedAnswers[currentQuestion.id] as string || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value, 'true-false')}
              className="space-y-3"
              disabled={!!questionFeedback}
            >
              {['true', 'false'].map(value => (
                 <div key={value} className={`flex items-center space-x-3 p-4 border rounded-lg transition-all ${ selectedAnswers[currentQuestion.id] === value ? 'bg-primary/10 border-primary shadow-md' : 'hover:bg-muted/50' } ${questionFeedback && (value === currentQuestion.correctAnswer ? 'border-green-500 bg-green-500/10' : (selectedAnswers[currentQuestion.id] === value && value !== currentQuestion.correctAnswer ? 'border-red-500 bg-red-500/10' : '')) }`}>
                    <RadioGroupItem value={value} id={`${currentQuestion.id}-${value}`} disabled={!!questionFeedback}/>
                    <Label htmlFor={`${currentQuestion.id}-${value}`} className="text-lg font-normal flex-grow cursor-pointer capitalize">{value}</Label>
                    {questionFeedback && value === currentQuestion.correctAnswer && <CheckCircle className="h-6 w-6 text-green-500" />}
                    {questionFeedback && selectedAnswers[currentQuestion.id] === value && value !== currentQuestion.correctAnswer && <XCircle className="h-6 w-6 text-red-500" />}
                 </div>
              ))}
            </RadioGroup>
          )}
          
          {currentQuestion.type === 'short-answer' && (
            <Input
              type="text"
              placeholder="Your answer..."
              value={selectedAnswers[currentQuestion.id] as string || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, 'short-answer')}
              className="text-lg py-3"
              disabled={!!questionFeedback}
            />
          )}

          {currentQuestion.hint && (
            <div className="mt-4">
              <Button variant="outline" onClick={() => setShowHint(!showHint)} className="text-accent border-accent hover:bg-accent/10">
                <Lightbulb className="mr-2 h-5 w-5" /> {showHint ? "Hide Hint" : "Show Hint"}
              </Button>
              {showHint && (
                <p className="mt-2 p-3 bg-accent/10 border border-accent/30 rounded-md text-accent-foreground italic">{currentQuestion.hint}</p>
              )}
            </div>
          )}

        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4 p-6">
           {questionFeedback && (
            <div className={`p-4 rounded-md w-full text-center text-lg font-semibold ${questionFeedback.correct ? 'bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-500/20 text-red-700 dark:text-red-300'}`}>
                {questionFeedback.correct ? <CheckCircle className="inline mr-2 h-6 w-6" /> : <XCircle className="inline mr-2 h-6 w-6" /> } 
                {questionFeedback.message}
            </div>
          )}
          <Button 
            onClick={() => handleNextQuestion()} 
            size="lg" 
            className="w-full text-lg py-4"
            disabled={!selectedAnswers[currentQuestion.id] && !questionFeedback} // Disable if no answer and no feedback yet
          >
            {questionFeedback ? (currentQuestionIndex < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz") : "Submit Answer"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
