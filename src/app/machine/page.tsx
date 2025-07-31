
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

const availableMachines = ['CNC machine', 'Press machine', 'VMC machine', 'lathe machine', 'milling', 'Casting', 'forging', 'Moulding', 'Grinding', 'cutting', 'Other'];

interface MachineSelection {
    name: string;
    quantity: number;
    otherName?: string;
}

interface MachineData {
    machineName: string;
    instanceNumber: number;
    machineNumber: string;
    machinePower: string;
    tonnage: string;
    machineCapacity: string;
    settingTime: string;
    machineSpeed: string;
    strokesPerMin?: string;
    hydraulicPressure?: string;
    cavityCount?: string;
    airPressure?: string;
    temperature?: string;
    preheatingTime?: string;
    curingTime?: string;
    heaterCount?: string;
    zone1Temp?: string;
    zone2Temp?: string;
    zone3Temp?: string;
    zone4Temp?: string;
    zone5Temp?: string;
    zone6Temp?: string;
    fillingPressure?: string;
    topCorePressure?: string;
    bottomCorePressure?: string;
    nozzlePressure?: string;
}

function MachineDataEntry({ selections, onBack, onSubmitted }: { selections: MachineSelection[], onBack: () => void, onSubmitted: () => void }) {
    const initialData = selections.flatMap(s => 
        Array.from({ length: s.quantity }, (_, i) => ({
            machineName: s.name === 'Other' ? s.otherName || 'Other' : s.name,
            instanceNumber: i + 1,
            machineNumber: '',
            machinePower: '',
            tonnage: '',
            machineCapacity: '',
            settingTime: '',
            machineSpeed: '',
            strokesPerMin: '',
            hydraulicPressure: '',
            cavityCount: '',
            airPressure: '',
            temperature: '',
            preheatingTime: '',
            curingTime: '',
            heaterCount: '',
            zone1Temp: '',
            zone2Temp: '',
            zone3Temp: '',
            zone4Temp: '',
            zone5Temp: '',
            zone6Temp: '',
            fillingPressure: '',
            topCorePressure: '',
            bottomCorePressure: '',
            nozzlePressure: '',
        }))
    );
    const [machineData, setMachineData] = useState<MachineData[]>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleInputChange = (index: number, field: keyof MachineData, value: string) => {
        const newData = [...machineData];
        (newData[index] as any)[field] = value;
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
                machineCapacity: data.machineCapacity,
                settingTime: data.settingTime,
                machineSpeed: data.machineSpeed,
                strokesPerMin: data.strokesPerMin,
                hydraulicPressure: data.hydraulicPressure,
                cavityCount: data.cavityCount,
                airPressure: data.airPressure,
                temperature: data.temperature,
                preheatingTime: data.preheatingTime,
                curingTime: data.curingTime,
                heaterCount: data.heaterCount,
                zone1Temp: data.zone1Temp,
                zone2Temp: data.zone2Temp,
                zone3Temp: data.zone3Temp,
                zone4Temp: data.zone4Temp,
                zone5Temp: data.zone5Temp,
                zone6Temp: data.zone6Temp,
                fillingPressure: data.fillingPressure,
                topCorePressure: data.topCorePressure,
                bottomCorePressure: data.bottomCorePressure,
                nozzlePressure: data.nozzlePressure,
            });
        }
        setIsSubmitting(false);
        onSubmitted();
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
             <Card className="w-full max-w-4xl shadow-lg">
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
                                        <Label htmlFor={`machinePower-${index}`}>Machine Power (kW) / Consumption</Label>
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
                                     <div className="space-y-2">
                                        <Label htmlFor={`machineCapacity-${index}`}>Machine Capacity</Label>
                                        <Input
                                            id={`machineCapacity-${index}`}
                                            value={data.machineCapacity}
                                            onChange={(e) => handleInputChange(index, 'machineCapacity', e.target.value)}
                                            required
                                            className="text-lg"
                                        />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor={`settingTime-${index}`}>Setting Time (Min)</Label>
                                        <Input
                                            id={`settingTime-${index}`}
                                            type="number"
                                            value={data.settingTime}
                                            onChange={(e) => handleInputChange(index, 'settingTime', e.target.value)}
                                            required
                                            className="text-lg"
                                        />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor={`machineSpeed-${index}`}>Speed of Machine</Label>
                                        <Input
                                            id={`machineSpeed-${index}`}
                                            type="number"
                                            value={data.machineSpeed}
                                            onChange={(e) => handleInputChange(index, 'machineSpeed', e.target.value)}
                                            required
                                            className="text-lg"
                                        />
                                    </div>
                                    {(data.machineName === 'Press machine' || data.machineName === 'forging') && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor={`strokesPerMin-${index}`}>Number of Strokes Per min</Label>
                                                <Input
                                                    id={`strokesPerMin-${index}`}
                                                    type="number"
                                                    value={data.strokesPerMin}
                                                    onChange={(e) => handleInputChange(index, 'strokesPerMin', e.target.value)}
                                                    required
                                                    className="text-lg"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`hydraulicPressure-${index}`}>Hydraulic Pressure (kg/cm²)</Label>
                                                <Input
                                                    id={`hydraulicPressure-${index}`}
                                                    type="number"
                                                    value={data.hydraulicPressure}
                                                    onChange={(e) => handleInputChange(index, 'hydraulicPressure', e.target.value)}
                                                    required
                                                    className="text-lg"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`cavityCount-${index}`}>Number of Cavities</Label>
                                                <Input
                                                    id={`cavityCount-${index}`}
                                                    type="number"
                                                    value={data.cavityCount}
                                                    onChange={(e) => handleInputChange(index, 'cavityCount', e.target.value)}
                                                    required
                                                    className="text-lg"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`airPressure-${index}`}>Air Pressure (kg/cm²)</Label>
                                                <Input
                                                    id={`airPressure-${index}`}
                                                    type="number"
                                                    value={data.airPressure}
                                                    onChange={(e) => handleInputChange(index, 'airPressure', e.target.value)}
                                                    required
                                                    className="text-lg"
                                                />
                                            </div>
                                        </>
                                    )}
                                     {(data.machineName === 'Moulding' || data.machineName === 'Casting') && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor={`temperature-${index}`}>Temperature (°C)</Label>
                                                <Input id={`temperature-${index}`} type="number" value={data.temperature} onChange={(e) => handleInputChange(index, 'temperature', e.target.value)} required className="text-lg" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`preheatingTime-${index}`}>Preheating Time (min)</Label>
                                                <Input id={`preheatingTime-${index}`} type="number" value={data.preheatingTime} onChange={(e) => handleInputChange(index, 'preheatingTime', e.target.value)} required className="text-lg" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`curingTime-${index}`}>Curing/Holding Time (min)</Label>
                                                <Input id={`curingTime-${index}`} type="number" value={data.curingTime} onChange={(e) => handleInputChange(index, 'curingTime', e.target.value)} required className="text-lg" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`heaterCount-${index}`}>Number of heaters</Label>
                                                <Input id={`heaterCount-${index}`} type="number" value={data.heaterCount} onChange={(e) => handleInputChange(index, 'heaterCount', e.target.value)} required className="text-lg" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`zone1Temp-${index}`}>Zone 1 Temperature</Label>
                                                <Input id={`zone1Temp-${index}`} type="number" value={data.zone1Temp} onChange={(e) => handleInputChange(index, 'zone1Temp', e.target.value)} required className="text-lg" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`zone2Temp-${index}`}>Zone 2 Temperature</Label>
                                                <Input id={`zone2Temp-${index}`} type="number" value={data.zone2Temp} onChange={(e) => handleInputChange(index, 'zone2Temp', e.target.value)} required className="text-lg" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`zone3Temp-${index}`}>Zone 3 Temperature</Label>
                                                <Input id={`zone3Temp-${index}`} type="number" value={data.zone3Temp} onChange={(e) => handleInputChange(index, 'zone3Temp', e.target.value)} required className="text-lg" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`zone4Temp-${index}`}>Zone 4 Temperature</Label>
                                                <Input id={`zone4Temp-${index}`} type="number" value={data.zone4Temp} onChange={(e) => handleInputChange(index, 'zone4Temp', e.target.value)} required className="text-lg" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`zone5Temp-${index}`}>Zone 5 Temperature</Label>
                                                <Input id={`zone5Temp-${index}`} type="number" value={data.zone5Temp} onChange={(e) => handleInputChange(index, 'zone5Temp', e.target.value)} required className="text-lg" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`zone6Temp-${index}`}>Zone 6 Temperature</Label>
                                                <Input id={`zone6Temp-${index}`} type="number" value={data.zone6Temp} onChange={(e) => handleInputChange(index, 'zone6Temp', e.target.value)} required className="text-lg" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`fillingPressure-${index}`}>Filling Pressure (kg/cm²)</Label>
                                                <Input id={`fillingPressure-${index}`} type="number" value={data.fillingPressure} onChange={(e) => handleInputChange(index, 'fillingPressure', e.target.value)} required className="text-lg" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`topCorePressure-${index}`}>Top core Pressure</Label>
                                                <Input id={`topCorePressure-${index}`} type="number" value={data.topCorePressure} onChange={(e) => handleInputChange(index, 'topCorePressure', e.target.value)} required className="text-lg" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`bottomCorePressure-${index}`}>Bottom core pressure</Label>
                                                <Input id={`bottomCorePressure-${index}`} type="number" value={data.bottomCorePressure} onChange={(e) => handleInputChange(index, 'bottomCorePressure', e.target.value)} required className="text-lg" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`nozzlePressure-${index}`}>Nozzle Pressure</Label>
                                                <Input id={`nozzlePressure-${index}`} type="number" value={data.nozzlePressure} onChange={(e) => handleInputChange(index, 'nozzlePressure', e.target.value)} required className="text-lg" />
                                            </div>
                                        </>
                                    )}
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
    const [selections, setSelections] = useState<MachineSelection[]>([{ name: '', quantity: 0, otherName: '' }]);
    const [step, setStep] = useState<'selection' | 'dataEntry' | 'success'>('selection');

    const handleAddMachine = () => {
        setSelections(prev => [...prev, { name: '', quantity: 0, otherName: '' }]);
    };

    const handleMachineTypeChange = (index: number, name: string) => {
        setSelections(prev => {
            const newSelections = [...prev];
            newSelections[index].name = name;
            if (name !== 'Other') {
                newSelections[index].otherName = '';
            }
            return newSelections;
        });
    };

    const handleOtherNameChange = (index: number, otherName: string) => {
        setSelections(prev => {
            const newSelections = [...prev];
            newSelections[index].otherName = otherName;
            return newSelections;
        });
    }

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
        setSelections([{ name: '', quantity: 0, otherName: '' }]);
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
                <div key={index} className="space-y-2">
                    <div className="flex items-center gap-4">
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
                     {selection.name === 'Other' && (
                        <div className="pl-1 pr-1">
                            <Input
                                placeholder="Please specify machine type"
                                value={selection.otherName}
                                onChange={(e) => handleOtherNameChange(index, e.target.value)}
                                className="text-lg"
                                required
                            />
                        </div>
                    )}
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

