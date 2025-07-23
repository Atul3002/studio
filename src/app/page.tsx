
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldCheck, BarChart3, Wrench, ArrowRight, Cog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navItems = [
  {
    title: 'Admin',
    description: 'Manage users and settings.',
    href: '/admin',
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Production Team',
    description: 'View production reports.',
    href: '/production',
    icon: <BarChart3 className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Machine Selection',
    description: 'Select a machine to operate.',
    href: '/machine',
    icon: <Cog className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Operator',
    description: 'Input daily production data.',
    href: '/operator',
    icon: <Wrench className="w-8 h-8 text-primary" />,
  },
];

const fullText = "Breaker Tracker";
const baseText = "Breaker ";
const wordToAnimate = "Tracker";

function Typewriter() {
    const [text, setText] = useState('');
    const [index, setIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isInitialPhase, setIsInitialPhase] = useState(true);

    useEffect(() => {
        if (isInitialPhase) {
            // Initial typing of "Breaker Tracker"
            if (index < fullText.length) {
                const timeout = setTimeout(() => {
                    setText(fullText.substring(0, index + 1));
                    setIndex(index + 1);
                }, 150);
                return () => clearTimeout(timeout);
            } else {
                // End of initial phase, pause and then start the loop
                setTimeout(() => {
                    setIsInitialPhase(false);
                    setIsDeleting(true);
                    setIndex(wordToAnimate.length); // Set index for deleting "Tracker"
                }, 1500);
            }
        } else {
            // Loop phase for "Tracker"
            const typeSpeed = isDeleting ? 100 : 200;
            const timeout = setTimeout(() => {
                if (isDeleting) {
                    if (index > 0) {
                        setText(baseText + wordToAnimate.substring(0, index - 1));
                        setIndex(index - 1);
                    } else {
                        setIsDeleting(false);
                    }
                } else {
                    if (index < wordToAnimate.length) {
                        setText(baseText + wordToAnimate.substring(0, index + 1));
                        setIndex(index + 1);
                    } else {
                        setTimeout(() => setIsDeleting(true), 1500); // Pause before deleting
                    }
                }
            }, typeSpeed);
            return () => clearTimeout(timeout);
        }
    }, [index, isDeleting, isInitialPhase]);

    return (
      <div className="overflow-hidden whitespace-nowrap border-r-4 border-r-primary pr-2 text-5xl font-bold text-primary animate-blink-caret-end">
        <h1 className="font-calligraphy text-7xl font-bold text-primary">{text}</h1>
      </div>
    );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="text-center mb-12 h-24 flex items-center">
        <Typewriter />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {navItems.map((item) => (
          <Link href={item.href} key={item.title} legacyBehavior passHref>
            <a className={cn(
              "block transform hover:scale-105 transition-transform duration-300 rounded-lg",
              "animated-border-hover"
            )}>
              <Card className={cn(
                "h-full flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden",
                "relative z-10"
                )}>
                <CardHeader className="flex flex-row items-center gap-4">
                  {item.icon}
                  <div>
                    <CardTitle className="font-headline text-2xl">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end items-center text-sm font-medium text-primary hover:text-primary/80">
                    Go to {item.title} <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </main>
  );
}
