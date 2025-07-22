
"use client";

import { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ChevronRight, Cog, CheckCircle } from "lucide-react";
import LoginForm from "@/components/login-form";
import { saveSubmission } from "@/app/actions";

const machines = ['CNC machine', 'Press machine', 'VMC machine', 'lathe machine', 'milling', 'Casting', 'forging'];

const getPasswordForMachine = (machine: string) => {
    return machine.toLowerCase().replace(/\s/g, '') + '123';
}

function MachineDataEntry({ machine, onSubmitted }: { machine: string, onSubmitted: () => void }) {
    const [machineNumber, setMachineNumber] = useState('');
    const [machinePower, setMachinePower] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await saveSubmission({
            machine: machine,
            machineNumber: machineNumber,
            machinePower: machinePower,
        });
        setIsSubmitting(false);
        onSubmitted();
    }
    
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-lg shadow-lg">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-2xl"><Cog />Machine Details</CardTitle>
                <CardDescription>Enter the details for the selected machine: <span className="font-bold text-primary">{machine}</span></CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="machineNumber">Machine Number</Label>
                  <Input 
                    id="machineNumber" 
                    value={machineNumber} 
                    onChange={(e) => setMachineNumber(e.target.value)} 
                    required 
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="machinePower">Machine Power (kW)</Label>
                  <Input 
                    id="machinePower" 
                    type="number" 
                    value={machinePower} 
                    onChange={(e) => setMachinePower(e.target.value)} 
                    required 
                    className="text-lg"
                  />
                </div>
              </CardContent>
              <CardFooter>
                 <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </CardFooter>
            </form>
        </Card>
      </main>
    )
}

function SubmissionSuccess({ onReset }: { onReset: () => void }) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-lg text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Submission Successful</CardTitle>
                    <CardDescription>Your machine data has been recorded.</CardDescription>
                </CardHeader>
                <CardFooter className="flex-col gap-2">
                    <Button onClick={onReset} className="w-full">
                        Enter Data for Another Machine
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}

export default function MachinePage() {
    const [step, setStep] = useState<'selection' | 'login' | 'dataEntry' | 'submitted'>('selection');
    const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

    const handleMachineSelect = (machine: string) => {
        setSelectedMachine(machine);
        setStep('login');
    };

    const handleLoginSuccess = () => {
        setStep('dataEntry');
    };
    
    const handleDataSubmitted = () => {
        setStep('submitted');
    }

    const reset = () => {
        setSelectedMachine(null);
        setStep('selection');
    }

    if (step === 'login' && selectedMachine) {
        return (
            <LoginForm
                role={`${selectedMachine} Login`}
                correctPassword={getPasswordForMachine(selectedMachine)}
                onLoginSuccess={handleLoginSuccess}
            />
        )
    }

    if (step === 'dataEntry' && selectedMachine) {
        return <MachineDataEntry machine={selectedMachine} onSubmitted={handleDataSubmitted} />
    }
    
    if (step === 'submitted') {
        return <SubmissionSuccess onReset={reset} />
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
