
"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';

const fullText = "Job Tracker";
const baseText = "Job ";
const wordToAnimate = "Tracker";
const dots = ".....";

function Typewriter() {
    const [text, setText] = useState('');
    const [index, setIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isInitialPhase, setIsInitialPhase] = useState(true);
    const [isTypingDots, setIsTypingDots] = useState(false);
    const [dotIndex, setDotIndex] = useState(0);

    useEffect(() => {
        if (isInitialPhase) {
            // Initial typing of "Job Tracker"
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
                    setIndex(wordToAnimate.length);
                }, 1500);
            }
        } else if (isTypingDots) {
            if (dotIndex < dots.length) {
                const timeout = setTimeout(() => {
                    setText(fullText + dots.substring(0, dotIndex + 1));
                    setDotIndex(dotIndex + 1);
                }, 200);
                return () => clearTimeout(timeout);
            } else {
                 setTimeout(() => {
                    setIsTypingDots(false);
                    setIsDeleting(true);
                    setDotIndex(0);
                    setIndex(wordToAnimate.length)
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
                        setIsTypingDots(true);
                    }
                }
            }, typeSpeed);
            return () => clearTimeout(timeout);
        }
    }, [index, isDeleting, isInitialPhase, isTypingDots, dotIndex]);

    const breakerText = text.substring(0, baseText.length);
    let trackerText = text.substring(baseText.length);
    let dotsText = '';

    if (text.length > fullText.length && !isInitialPhase) {
        trackerText = wordToAnimate;
        dotsText = text.substring(fullText.length);
    }
    

    return (
      <div className="overflow-hidden whitespace-nowrap border-r-4 border-r-primary pr-2 text-5xl font-bold text-primary animate-blink-caret-end">
        <h1 className="font-calligraphy text-7xl font-bold">
            <span className="text-primary">{isInitialPhase ? text : breakerText}</span>
            {!isInitialPhase && <span className="animate-text-gradient">{trackerText}</span>}
            {dotsText && <span className="animate-text-gradient">{dotsText}</span>}
        </h1>
      </div>
    );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <header className="absolute top-0 left-0 w-full flex justify-between items-center p-4 sm:p-6 md:hidden">
        <SidebarTrigger />
      </header>
      <div className="text-center mb-12">
        <div className="h-24 flex items-center justify-center">
            <Typewriter />
        </div>
        <p className="text-lg text-muted-foreground mt-2">Daily Production Monitoring System</p>
      </div>
    </main>
  );
}
