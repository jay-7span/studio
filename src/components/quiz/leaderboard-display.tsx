'use client';

import type { Participant, QuizAttempt } from '@/types/quiz';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Medal, Trophy } from 'lucide-react';
import Image from 'next/image';

interface LeaderboardDisplayProps {
  quizTitle: string;
  attempts: QuizAttempt[]; // Using QuizAttempt which contains score and participant name
  totalQuestions: number;
}

export function LeaderboardDisplay({ quizTitle, attempts, totalQuestions }: LeaderboardDisplayProps) {
  
  const sortedParticipants = [...attempts]
    .sort((a, b) => b.score - a.score || new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()); // Sort by score, then by submission time

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="h-6 w-6 text-yellow-400" />;
    if (rank === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-orange-400" />; // Bronze
    return null;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader className="text-center">
        <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
        <CardTitle className="text-4xl">Leaderboard</CardTitle>
        <CardDescription className="text-xl">Results for "{quizTitle}"</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedParticipants.length === 0 ? (
          <div className="text-center py-10">
            <Image src="https://placehold.co/300x200.png" alt="No participants yet" width={300} height={200} className="mx-auto rounded-lg mb-4" data-ai-hint="empty state data" />
            <p className="text-muted-foreground text-lg">No participants have completed the quiz yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center text-base">Rank</TableHead>
                <TableHead className="text-base">Participant</TableHead>
                <TableHead className="text-right text-base">Score</TableHead>
                <TableHead className="text-right text-base">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedParticipants.map((participant, index) => (
                <TableRow key={`${participant.participantName}-${index}`} className={index < 3 ? 'font-semibold' : ''}>
                  <TableCell className="text-center text-lg">
                    <div className="flex items-center justify-center space-x-2">
                       {getRankIcon(index)}
                       <span>{index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-lg">{participant.participantName}</TableCell>
                  <TableCell className="text-right text-lg">{participant.score} / {totalQuestions}</TableCell>
                  <TableCell className="text-right text-lg">
                    {totalQuestions > 0 ? ((participant.score / totalQuestions) * 100).toFixed(0) : 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
