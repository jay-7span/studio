import Link from 'next/link';
import type { ReactNode } from 'react';
import { LogoIcon } from '@/components/icons/logo-icon';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle'; // To be created

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <LogoIcon className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-primary">QuizWhiz</span>
          </Link>
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-2">
               {/* Future navigation links can go here, e.g., My Quizzes */}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 container max-w-screen-2xl py-8">{children}</main>
      <footer className="py-6 md:px-8 md:py-0 border-t border-border/40">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ by AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
