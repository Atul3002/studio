
"use client";

import { useState } from "react";
import Link from 'next/link';
import { format } from "date-fns";
import { Calendar as CalendarIcon, DollarSign, Building, Wrench, FileText, CalendarDays } from "lucide-react";

import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { saveSubmission, getSubmissions } from "@/app/actions";

function FinanceDashboard() {
  const [operatorDate, setOperatorDate] = useState<Date | undefined>();
  const [operatorAmount, setOperatorAmount] = useState("");
  const [operatorDesc, setOperatorDesc] = useState("");

  const [factoryDate, setFactoryDate] = useState<Date | undefined>();
  const [factoryAmount, setFactoryAmount] = useState("");
  const [factoryDesc, setFactoryDesc] = useState("");
  
  const [machineDate, setMachineDate] = useState<Date | undefined>();
  const [machine, setMachine] = useState("");
  const [machineAmount, setMachineAmount] = useState("");
  const [machineDesc, setMachineDesc] = useState("");
  
  const [machines, setMachines] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  useState(() => {
    getSubmissions().then(data => {
        const machineNames = [...new Set(data.filter(s => s.machine).map(s => s.machine as string))];
        setMachines(machineNames);
    });
  });

  const handleSubmit = async (type: 'operator' | 'factory' | 'machine') => {
    setIsSubmitting(type);
    let submissionData = {};
    if (type === 'operator') {
        submissionData = {
            entryType: 'finance-operator',
            date: operatorDate ? format(operatorDate, "PPP") : "",
            amount: operatorAmount,
            description: operatorDesc,
        };
        await saveSubmission(submissionData);
        setOperatorDate(undefined);
        setOperatorAmount("");
        setOperatorDesc("");

    } else if (type === 'factory') {
         submissionData = {
            entryType: 'finance-factory',
            date: factoryDate ? format(factoryDate, "PPP") : "",
            amount: factoryAmount,
            description: factoryDesc,
        };
        await saveSubmission(submissionData);
        setFactoryDate(undefined);
        setFactoryAmount("");
        setFactoryDesc("");
    } else if (type === 'machine') {
         submissionData = {
            entryType: 'finance-machine',
            date: machineDate ? format(machineDate, "PPP") : "",
            machine,
            amount: machineAmount,
            description: machineDesc,
        };
        await saveSubmission(submissionData);
        setMachineDate(undefined);
        setMachine("");
        setMachineAmount("");
        setMachineDesc("");
    }
    
    setIsSubmitting(null);
    // Maybe show a success toast
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
        <div className="flex flex-col sm:gap-4 sm:py-4">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <h1 className="font-headline text-2xl font-semibold pl-20">Finance Team</h1>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2 text-2xl"><DollarSign />Operator Expenses</CardTitle>
                            <CardDescription>Enter daily expenses related to operators.</CardDescription>
                        </CardHeader>
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit('operator')}}>
                            <CardContent className="space-y-4">
                               <div className="space-y-2">
                                    <Label htmlFor="operator-date" className="flex items-center gap-2 font-semibold"><CalendarDays /> Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button id="operator-date" variant={"outline"} className={cn("w-full justify-start text-left font-normal",!operatorDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {operatorDate ? format(operatorDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={operatorDate} onSelect={setOperatorDate} initialFocus/></PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="operator-amount" className="font-semibold">Amount</Label>
                                    <Input id="operator-amount" type="number" value={operatorAmount} onChange={(e) => setOperatorAmount(e.target.value)} required placeholder="Enter amount" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="operator-desc" className="font-semibold">Description</Label>
                                    <Textarea id="operator-desc" value={operatorDesc} onChange={(e) => setOperatorDesc(e.target.value)} required placeholder="Expense details..."/>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isSubmitting === 'operator'}>{isSubmitting === 'operator' ? "Submitting..." : "Submit Operator Expense"}</Button>
                            </CardFooter>
                        </form>
                    </Card>
                     <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2 text-2xl"><Building/>Factory Expenses</CardTitle>
                            <CardDescription>Enter general day-wise factory expenses.</CardDescription>
                        </CardHeader>
                         <form onSubmit={(e) => { e.preventDefault(); handleSubmit('factory')}}>
                            <CardContent className="space-y-4">
                               <div className="space-y-2">
                                    <Label htmlFor="factory-date" className="flex items-center gap-2 font-semibold"><CalendarDays /> Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button id="factory-date" variant={"outline"} className={cn("w-full justify-start text-left font-normal",!factoryDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {factoryDate ? format(factoryDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={factoryDate} onSelect={setFactoryDate} initialFocus/></PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="factory-amount" className="font-semibold">Amount</Label>
                                    <Input id="factory-amount" type="number" value={factoryAmount} onChange={(e) => setFactoryAmount(e.target.value)} required placeholder="Enter amount"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="factory-desc" className="font-semibold">Description</Label>
                                    <Textarea id="factory-desc" value={factoryDesc} onChange={(e) => setFactoryDesc(e.target.value)} required placeholder="Expense details..." />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isSubmitting === 'factory'}>{isSubmitting === 'factory' ? "Submitting..." : "Submit Factory Expense"}</Button>
                            </CardFooter>
                        </form>
                    </Card>
                     <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2 text-2xl"><Wrench/>Machine-wise Expenses</CardTitle>
                            <CardDescription>Enter expenses related to a specific machine.</CardDescription>
                        </CardHeader>
                         <form onSubmit={(e) => { e.preventDefault(); handleSubmit('machine')}}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="machine" className="font-semibold">Machine</Label>
                                    <Select value={machine} onValueChange={setMachine} required>
                                        <SelectTrigger><SelectValue placeholder="Select a machine..." /></SelectTrigger>
                                        <SelectContent>
                                            {machines.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                               <div className="space-y-2">
                                    <Label htmlFor="machine-date" className="flex items-center gap-2 font-semibold"><CalendarDays /> Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button id="machine-date" variant={"outline"} className={cn("w-full justify-start text-left font-normal",!machineDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {machineDate ? format(machineDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={machineDate} onSelect={setMachineDate} initialFocus/></PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="machine-amount" className="font-semibold">Amount</Label>
                                    <Input id="machine-amount" type="number" value={machineAmount} onChange={(e) => setMachineAmount(e.target.value)} required placeholder="Enter amount"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="machine-desc" className="font-semibold">Description</Label>
                                    <Textarea id="machine-desc" value={machineDesc} onChange={(e) => setMachineDesc(e.target.value)} required placeholder="Expense details..."/>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isSubmitting === 'machine'}>{isSubmitting === 'machine' ? "Submitting..." : "Submit Machine Expense"}</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </main>
        </div>
    </div>
  );
}

export default function FinancePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <LoginForm
        role="Finance Team"
        correctPassword="finance123"
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return <FinanceDashboard />;
}
