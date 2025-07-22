
"use client";

import { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ChevronRight, Cog } from "lucide-react";
import LoginForm from "@/components/login-form";

const machines = ['CNC machine', 'Press machine', 'VMC machine', 'lathe machine', 'milling', 'Casting', 'forging'];

const getPasswordForMachine = (machine: string) => {
    return machine.toLowerCase().replace(/\s/g, '') + '123';
}

export default function MachinePage() {
    const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
    const router = useRouter();

    const handleMachineSelect = (machine: string) => {
        setSelectedMachine(machine);
    };

    const handleLoginSuccess = () => {
        if (selectedMachine) {
            router.push(`/operator?machine=${encodeURIComponent(selectedMachine)}`);
        }
    };
    
    if (selectedMachine) {
        return (
            <LoginForm
                role={`${selectedMachine} Login`}
                correctPassword={getPasswordForMachine(selectedMachine)}
                onLoginSuccess={handleLoginSuccess}
            />
        )
    }

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-2xl"><Cog />Machine Selection</CardTitle>
            <CardDescription>Choose the machine you are operating.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            {machines.map((machine) => (
                <Button
                    key={machine}
                    variant="outline"
                    size="lg"
                    className="justify-between"
                    onClick={() => handleMachineSelect(machine)}
                >
                    {machine}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
            ))}
          </CardContent>
            <CardFooter>
                 <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to Home</Link>
                </Button>
            </CardFooter>
        </Card>
      </main>
    );
}
