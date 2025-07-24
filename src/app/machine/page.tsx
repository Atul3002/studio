
"use client";

import { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ChevronRight, Cog, CheckCircle, PlusCircle } from "lucide-react";
import LoginForm from "@/components/login-form";
import { saveSubmission } from "@/app/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const allMachines = ['CNC machine', 'Press machine', 'VMC machine', 'lathe machine', 'milling', 'Casting', 'forging'];

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

const availableMachines = ['CNC machine', 'Press machine', 'VMC machine', 'lathe machine', 'milling', 'Casting', 'forging'];

interface MachineSelection {
    name: string;
    quantity: number;
}

export default function MachinePage() {
    const [selections, setSelections] = useState<MachineSelection[]>([{ name: 'CNC machine', quantity: 0 }]);

    const handleAddMachine = () => {
        const nextMachineIndex = selections.length;
        if (nextMachineIndex < availableMachines.length) {
            setSelections(prev => [...prev, { name: availableMachines[nextMachineIndex], quantity: 0 }]);
        }
    };

    const handleQuantityChange = (index: number, quantity: string) => {
        const newQuantity = parseInt(quantity, 10);
        setSelections(prev => {
            const newSelections = [...prev];
            newSelections[index].quantity = newQuantity;
            return newSelections;
        });
    };
    
    // The rest of the page logic for login and data entry is removed for this new UI
    // If needed, the logic for handling machine login can be re-integrated.
    // For now, focusing on the new selection UI.

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-2xl"><Cog />Machine Selection</CardTitle>
            <CardDescription>Choose the machines you are operating and their quantities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selections.map((selection, index) => (
                <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                        <Input value={selection.name} readOnly className="text-lg font-semibold" />
                    </div>
                    <div className="w-48">
                       <Select
                            value={selection.quantity.toString()}
                            onValueChange={(value) => handleQuantityChange(index, value)}
                        >
                            <SelectTrigger className="text-lg">
                                <SelectValue placeholder="Select quantity..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 11 }, (_, i) => (
                                    <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleAddMachine}
                        disabled={selections.length >= availableMachines.length && index !== selections.length - 1}
                     >
                        <PlusCircle className="h-6 w-6" />
                    </Button>
                </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
             <Button asChild variant="link" className="p-0 h-auto">
                <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to Home</Link>
            </Button>
            <Button>
                Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
}
