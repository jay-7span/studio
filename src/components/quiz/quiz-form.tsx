'use client';

import type { Quiz, Question, QuestionType } from '@/types/quiz';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionEditor } from './question-editor';
import { PlusCircle, Save, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Helper to generate a simple unique ID
const generateId = () => Date.now().toString();

export function QuizForm() {
  const [quiz, setQuiz] = useState<Quiz>({
    id: generateId(),
    title: '',
    description: '',
    questions: [],
    code: '', // Will be set on save
  });
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleQuizMetaChange = (field: keyof Pick<Quiz, 'title' | 'description'>, value: string) => {
    setQuiz(prevQuiz => ({ ...prevQuiz, [field]: value }));
    setIsSaved(false);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: generateId(),
      type: 'multiple-choice', // Default type
      text: '',
      options: [{ id: generateId(), text: '', isCorrect: false }], // Default one option for MCQ
      correctAnswer: '', // Reset for new question
      hint: '',
    };
    setQuiz(prevQuiz => ({ ...prevQuiz, questions: [...prevQuiz.questions, newQuestion] }));
    setIsSaved(false);
  };

  const updateQuestion = (updatedQuestion: Question) => {
    setQuiz(prevQuiz => ({
      ...prevQuiz,
      questions: prevQuiz.questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    }));
    setIsSaved(false);
  };

  const removeQuestion = (questionId: string) => {
    setQuiz(prevQuiz => ({
      ...prevQuiz,
      questions: prevQuiz.questions.filter(q => q.id !== questionId)
    }));
    setIsSaved(false);
  };

  const validateQuiz = (): boolean => {
    if (!quiz.title.trim()) {
      toast({ title: "Validation Error", description: "Quiz title cannot be empty.", variant: "destructive" });
      return false;
    }
    if (quiz.questions.length === 0) {
      toast({ title: "Validation Error", description: "Quiz must have at least one question.", variant: "destructive" });
      return false;
    }
    for (const q of quiz.questions) {
      if (!q.text.trim()) {
        toast({ title: "Validation Error", description: `Question "${q.text || 'Untitled Question'}" text cannot be empty.`, variant: "destructive" });
        return false;
      }
      if (q.type === 'multiple-choice') {
        if (!q.options || q.options.length === 0) {
          toast({ title: "Validation Error", description: `Question "${q.text}" must have options.`, variant: "destructive" });
          return false;
        }
        if (!q.options.some(opt => opt.isCorrect)) {
          toast({ title: "Validation Error", description: `Question "${q.text}" must have at least one correct option.`, variant: "destructive" });
          return false;
        }
        if (q.options.some(opt => !opt.text.trim())) {
          toast({ title: "Validation Error", description: `Question "${q.text}" has an empty option.`, variant: "destructive" });
          return false;
        }
      } else if (q.type === 'true-false') {
        if (q.correctAnswer !== 'true' && q.correctAnswer !== 'false') {
          toast({ title: "Validation Error", description: `Question "${q.text}" (True/False) must have a correct answer selected.`, variant: "destructive" });
          return false;
        }
      } else if (q.type === 'short-answer') {
        if (!q.correctAnswer || !q.correctAnswer.trim()) {
          toast({ title: "Validation Error", description: `Question "${q.text}" (Short Answer) must have a correct answer.`, variant: "destructive" });
          return false;
        }
      }
    }
    return true;
  };

  const handleSaveQuiz = () => {
    if (!validateQuiz()) return;

    // In a real app, this would save to a backend.
    // For now, we'll simulate saving and generate a code.
    const quizCode = quiz.id.substring(quiz.id.length - 6).toUpperCase(); // Simple code from quiz ID
    const updatedQuiz = { ...quiz, code: quizCode };
    setQuiz(updatedQuiz);
    
    // Store in local storage for persistence across sessions in this demo
    localStorage.setItem(`quiz-${updatedQuiz.id}`, JSON.stringify(updatedQuiz));
    
    setIsSaved(true);
    toast({
      title: "Quiz Saved!",
      description: `Your quiz "${updatedQuiz.title}" has been saved. Code: ${updatedQuiz.code}`,
      duration: 5000,
    });
  };

  const handleShareQuiz = () => {
    if (!isSaved || !quiz.code) {
      toast({ title: "Save First", description: "Please save the quiz before sharing.", variant: "destructive"});
      return;
    }
    const joinLink = `${window.location.origin}/quiz/${quiz.id}`; // Using quizId as it's unique
    navigator.clipboard.writeText(`Join my QuizWhiz: ${quiz.title}\nCode: ${quiz.code}\nLink: ${joinLink}`)
      .then(() => {
        toast({ title: "Copied to Clipboard!", description: "Quiz code and join link copied." });
      })
      .catch(() => {
        toast({ title: "Copy Failed", description: "Could not copy to clipboard.", variant: "destructive" });
      });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-4xl font-bold text-primary">Create New Quiz</CardTitle>
        <CardDescription>Fill in the details below to create your awesome quiz.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4 p-6 bg-background rounded-lg border">
          <h2 className="text-2xl font-semibold">Quiz Details</h2>
          <div className="space-y-2">
            <Label htmlFor="quiz-title" className="text-lg">Quiz Title</Label>
            <Input
              id="quiz-title"
              placeholder="Enter quiz title (e.g., World Capitals Trivia)"
              value={quiz.title}
              onChange={(e) => handleQuizMetaChange('title', e.target.value)}
              className="text-lg py-3"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quiz-description" className="text-lg">Description (Optional)</Label>
            <Textarea
              id="quiz-description"
              placeholder="Briefly describe your quiz..."
              value={quiz.description || ''}
              onChange={(e) => handleQuizMetaChange('description', e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <div className="space-y-4 p-6 bg-background rounded-lg border">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Questions</h2>
                <Button onClick={addQuestion} variant="outline">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add Question
                </Button>
            </div>
            {quiz.questions.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No questions yet. Click "Add Question" to start!</p>
            )}
            <div className="space-y-6">
            {quiz.questions.map((q, index) => (
                <QuestionEditor
                key={q.id}
                question={q}
                onQuestionChange={updateQuestion}
                onRemoveQuestion={removeQuestion}
                index={index}
                />
            ))}
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 p-6">
        <Button onClick={handleSaveQuiz} size="lg" className="w-full sm:w-auto">
          <Save className="mr-2 h-5 w-5" /> {isSaved ? "Quiz Saved!" : "Save Quiz"}
        </Button>
        {isSaved && quiz.code && (
            <>
                <Button onClick={handleShareQuiz} variant="outline" size="lg" className="w-full sm:w-auto">
                    <Share2 className="mr-2 h-5 w-5" /> Share (Code: {quiz.code})
                </Button>
                 <Button onClick={() => router.push(`/quiz/${quiz.id}/host`)} variant="secondary" size="lg" className="w-full sm:w-auto">
                    Start Hosting
                </Button>
            </>
        )}
      </CardFooter>
    </Card>
  );
}
