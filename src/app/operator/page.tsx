"use client";

import { useState, type FormEvent } from "react";
import Link from 'next/link';
import { useSearchParams } from "next/navigation";

import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, Package, Hash, KeyRound } from "lucide-react";


function OperatorWorkflow() {
  const searchParams = useSearchParams();
  const machine = searchParams.get('machine') || 'Unselected';
  const productType = searchParams.get('productType') || 'Unselected';
  const station = searchParams.get('station') || 'Unselected';
  
  const [productionCount, setProductionCount] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleDataSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (parseInt(productionCount, 10) >= 0) {
      console.log(`Machine: ${machine}, Product Type: ${productType}, Station: ${station}, Production: ${productionCount}`);
      setIsSubmitted(true);
    }
  };
  
  const resetAll = () => {
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
                <CardContent className="space-y-2 text-left">
                    <p className="text-lg"><strong>Machine:</strong> {machine}</p>
                    <p className="text-lg"><strong>Product Type:</strong> {productType}</p>
                    <p className="text-lg"><strong>Station:</strong> {station}</p>
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <form onSubmit={handleDataSubmit}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Log Production</CardTitle>
            <CardDescription>
                Enter the number of breakers produced for <span className="font-bold text-primary">{machine}</span>.
            </CardDescription>
            <div className="text-sm text-muted-foreground pt-2">
                <div><strong>Product:</strong> {productType}</div>
                <div><strong>Station:</strong> {station}</div>
            </div>
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
            <Button asChild variant="outline" className="w-full">
                <Link href="/machine"><ArrowLeft className="h-4 w-4 mr-2" /> Change Machine</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}

function ProductTypeSelection({ onSelect }: { onSelect: (product: string) => void }) {
    const [productType, setProductType] = useState('');
    const productTypes = ['VCB', 'AIS', 'GIS', 'VCU', 'ET'];
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-2xl">
                 <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                        <Package className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-3xl">Select Product Type</CardTitle>
                    <CardDescription>Choose the product you are working on.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={productType} onValueChange={setProductType}>
                        <SelectTrigger className="h-12 text-lg">
                            <SelectValue placeholder="Select a product type..." />
                        </SelectTrigger>
                        <SelectContent>
                            {productTypes.map(pt => <SelectItem key={pt} value={pt}>{pt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => onSelect(productType)} disabled={!productType} className="w-full">
                        Next
                    </Button>
                </CardFooter>
            </Card>
        </main>
    )
}

function StationSelection({ onSelect }: { onSelect: (station: string) => void }) {
    const [station, setStation] = useState('');
    const stations = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                        <Hash className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-3xl">Select Station</CardTitle>
                    <CardDescription>Choose your station number.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Select value={station} onValueChange={setStation}>
                        <SelectTrigger className="h-12 text-lg">
                            <SelectValue placeholder="Select a station number..." />
                        </SelectTrigger>
                        <SelectContent>
                            {stations.map(s => <SelectItem key={s} value={s}>Station {s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </CardContent>
                <CardFooter>
                     <Button onClick={() => onSelect(station)} disabled={!station} className="w-full">
                        Next
                    </Button>
                </CardFooter>
            </Card>
        </main>
    )
}

export default function OperatorPage() {
    const [step, setStep] = useState('productType'); // productType, station, login, workflow
    const [productType, setProductType] = useState('');
    const [station, setStation] = useState('');

    const handleProductSelect = (product: string) => {
        setProductType(product);
        setStep('station');
    }

    const handleStationSelect = (selectedStation: string) => {
        setStation(selectedStation);
        setStep('login');
    }

    const handleLoginSuccess = () => {
        setStep('workflow');
    }

    if (step === 'productType') {
        return <ProductTypeSelection onSelect={handleProductSelect} />;
    }

    if (step === 'station') {
        return <StationSelection onSelect={handleStationSelect} />;
    }

    if (step === 'login') {
        return (
            <LoginForm
                role={`Operator (Station ${station})`}
                correctPassword={`op${station}123`}
                onLoginSuccess={handleLoginSuccess}
            />
        );
    }
    
    // We need to pass productType and station to the workflow component
    // but we can't just pass props directly to the page component.
    // A common pattern is to wrap the page content in another component that can receive the state.
    // Or, more simply for this case, we'll construct a new search param string and append it.
    const workflowUrl = `/operator?machine=${encodeURIComponent(useSearchParams().get('machine') || '')}&productType=${encodeURIComponent(productType)}&station=${encodeURIComponent(station)}`;
    
    // This is a bit of a hack to update the URL for the workflow component
    // A more robust solution would use Next.js's router to push the new URL state.
    if (typeof window !== 'undefined' && step === 'workflow' && window.location.search.indexOf('productType') === -1) {
        window.history.replaceState(null, '', workflowUrl);
    }

    return <OperatorWorkflow />;
}
