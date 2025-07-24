
"use client";

import { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ChevronRight, Cog, CheckCircle, PlusCircle, ChevronsLeft } from "lucide-react";
import { saveSubmission } from "@/app/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const availableMachines = ['CNC machine', 'Press machine', 'VMC machine', 'lathe machine', 'milling', 'Casting', 'forging'];

interface MachineSelection {
    name: string;
    quantity: number;
}

interface MachineData {
    machineName: string;
    instanceNumber: number;
    machineNumber: string;
    machinePower: string;
    tonnage: string;
}

function MachineDataEntry({ selections, onBack, onSubmitted }: { selections: MachineSelection[], onBack: () => void, onSubmitted: () => void }) {
    const initialData = selections.flatMap(s => 
        Array.from({ length: s.quantity }, (_, i) => ({
            machineName: s.name,
            instanceNumber: i + 1,
            machineNumber: '',
            machinePower: '',
            tonnage: '',
        }))
    );
    const [machineData, setMachineData] = useState<MachineData[]>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleInputChange = (index: number, field: 'machineNumber' | 'machinePower' | 'tonnage', value: string) => {
        const newData = [...machineData];
        newData[index][field] = value;
        setMachineData(newData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        for (const data of machineData) {
             await saveSubmission({
                machine: `${data.machineName} - ${data.instanceNumber}`,
                machineNumber: data.machineNumber,
                machinePower: data.machinePower,
                tonnage: data.tonnage,
            });
        }
        setIsSubmitting(false);
        onSubmitted();
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
             <Card className="w-full max-w-2xl shadow-lg">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2 text-2xl"><Cog />Machine Details</CardTitle>
                        <CardDescription>Enter the details for each selected machine.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto p-6">
                        {machineData.map((data, index) => (
                             <div key={index} className="p-4 border rounded-lg space-y-4 bg-background/50">
                                <h3 className="font-semibold text-lg">{data.machineName} - {data.instanceNumber}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`machineNumber-${index}`}>Machine Number</Label>
                                        <Input
                                            id={`machineNumber-${index}`}
                                            value={data.machineNumber}
                                            onChange={(e) => handleInputChange(index, 'machineNumber', e.target.value)}
                                            required
                                            className="text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`machinePower-${index}`}>Machine Power (kW)</Label>
                                        <Input
                                            id={`machinePower-${index}`}
                                            type="number"
                                            value={data.machinePower}
                                            onChange={(e) => handleInputChange(index, 'machinePower', e.target.value)}
                                            required
                                            className="text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`tonnage-${index}`}>Tonnage</Label>
                                        <Input
                                            id={`tonnage-${index}`}
                                            type="number"
                                            value={data.tonnage}
                                            onChange={(e) => handleInputChange(index, 'tonnage', e.target.value)}
                                            required
                                            className="text-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <Button type="button" variant="outline" onClick={onBack}>
                           <ChevronsLeft className="h-4 w-4 mr-2" /> Back to Selection
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit All'}
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
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <CheckCircle className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Submission Successful</CardTitle>
                    <CardDescription>All machine data has been recorded.</CardDescription>
                </CardHeader>
                <CardFooter className="flex-col gap-2">
                    <Button onClick={onReset} className="w-full">
                        Enter Data for More Machines
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
    const [selections, setSelections] = useState<MachineSelection[]>([{ name: '', quantity: 0 }]);
    const [step, setStep] = useState<'selection' | 'dataEntry' | 'success'>('selection');

    const handleAddMachine = () => {
        setSelections(prev => [...prev, { name: '', quantity: 0 }]);
    };

    const handleMachineTypeChange = (index: number, name: string) => {
        setSelections(prev => {
            const newSelections = [...prev];
            newSelections[index].name = name;
            return newSelections;
        });
    };

    const handleQuantityChange = (index: number, quantity: string) => {
        const newQuantity = parseInt(quantity, 10);
        setSelections(prev => {
            const newSelections = [...prev];
            newSelections[index].quantity = newQuantity;
            return newSelections;
        });
    };
    
    const handleNext = () => {
        const hasQuantity = selections.some(s => s.quantity > 0 && s.name !== '');
        if (hasQuantity) {
            setStep('dataEntry');
        } else {
            // Maybe show a toast or alert here
            alert("Please select a machine and quantity for at least one entry.");
        }
    }

    const resetFlow = () => {
        setSelections([{ name: '', quantity: 0 }]);
        setStep('selection');
    }

    if (step === 'success') {
        return <SubmissionSuccess onReset={resetFlow} />;
    }
    
    if (step === 'dataEntry') {
        const filteredSelections = selections.filter(s => s.quantity > 0 && s.name !== '');
        return <MachineDataEntry 
                    selections={filteredSelections} 
                    onBack={() => setStep('selection')} 
                    onSubmitted={() => setStep('success')}
                />;
    }

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
                        <Select
                            value={selection.name}
                            onValueChange={(value) => handleMachineTypeChange(index, value)}
                        >
                            <SelectTrigger className="text-lg">
                                <SelectValue placeholder="Select machine type..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableMachines.map((machine) => (
                                    <SelectItem key={machine} value={machine}>{machine}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                        className={index === selections.length - 1 ? 'opacity-100' : 'opacity-0'}
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
            <Button onClick={handleNext}>
                Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
}
