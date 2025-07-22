"use client";

import { useState, type FormEvent } from "react";
import Link from 'next/link';

import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, ChevronRight, Cog } from "lucide-react";

const machines = ['Breaker Press A1', 'Breaker Press A2', 'CNC Mill B1', 'Assembly Line 3', 'Molding Machine X5', 'Molding Machine X6'];

function OperatorWorkflow() {
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [productionCount, setProductionCount] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleDataSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (parseInt(productionCount, 10) >= 0) {
      console.log(`Machine: ${selectedMachine}, Production: ${productionCount}`);
      setIsSubmitted(true);
    }
  };
  
  const resetAll = () => {
      setSelectedMachine(null);
      setProductionCount("");
      setIsSubmitted(false);
  }

  if (isSubmitted) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
             <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Submission Successful</CardTitle>
                    <CardDescription>Your production data has been recorded.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-lg"><strong>Machine:</strong> {selectedMachine}</p>
                    <p className="text-lg"><strong>Breakers Produced:</strong> {productionCount}</p>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button onClick={resetAll} className="w-full">
                        Submit Another Entry
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </CardFooter>
            </Card>
        </main>
    )
  }

  if (!selectedMachine) {
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
                onClick={() => setSelectedMachine(machine)}
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <form onSubmit={handleDataSubmit}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Log Production</CardTitle>
            <CardDescription>Enter the number of breakers produced for <span className="font-bold text-primary">{selectedMachine}</span>.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="production-count" className="text-base">Breakers Produced Today</Label>
            <Input
              id="production-count"
              type="number"
              min="0"
              value={productionCount}
              onChange={(e) => setProductionCount(e.target.value)}
              placeholder="e.g., 1540"
              required
              className="mt-2 h-14 text-center text-3xl font-bold"
            />
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full font-bold">Submit Data</Button>
            <Button variant="outline" onClick={() => setSelectedMachine(null)} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" /> Change Machine
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}

export default function OperatorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <LoginForm
        role="Operator"
        correctPassword="op123"
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return <OperatorWorkflow />;
}
