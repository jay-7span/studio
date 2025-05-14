'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardEdit, LogIn } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const [quizCode, setQuizCode] = useState('');

  const handleJoinQuiz = (e: FormEvent) => {
    e.preventDefault();
    if (quizCode.trim()) {
      router.push(`/quiz/${quizCode.trim()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12">
      <section className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
          Welcome to QuizWhiz!
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The most engaging platform to create, share, and play quizzes. Unleash your knowledge and challenge your friends!
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-2">
              <ClipboardEdit className="w-10 h-10 text-primary" />
              <CardTitle className="text-3xl">Create a Quiz</CardTitle>
            </div>
            <CardDescription>
              Craft your own engaging quizzes with various question types and share them with the world.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Create a Quiz Illustration" 
              width={600} 
              height={400} 
              className="rounded-lg object-cover aspect-video"
              data-ai-hint="quiz creation education" 
            />
          </CardContent>
          <CardFooter>
            <Button asChild size="lg" className="w-full text-lg py-6">
              <Link href="/create">
                <ClipboardEdit className="mr-2 h-6 w-6" /> Start Creating
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-2">
              <LogIn className="w-10 h-10 text-secondary" />
              <CardTitle className="text-3xl">Join a Quiz</CardTitle>
            </div>
            <CardDescription>
              Enter a quiz code to join an existing quiz and test your knowledge.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <form onSubmit={handleJoinQuiz} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="quizCode" className="text-lg">Quiz Code</Label>
                <Input
                  id="quizCode"
                  type="text"
                  placeholder="Enter code..."
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value)}
                  className="text-lg py-6"
                  required
                />
              </div>
              <Button type="submit" size="lg" variant="secondary" className="w-full text-lg py-6">
                <LogIn className="mr-2 h-6 w-6" /> Join Quiz
              </Button>
            </form>
          </CardContent>
           <CardFooter className="mt-4">
             <p className="text-sm text-muted-foreground">Ask the quiz host for the code to join.</p>
           </CardFooter>
        </Card>
      </div>
    </div>
  );
}
