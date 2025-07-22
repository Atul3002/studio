
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
import { ArrowLeft, CheckCircle, Package, Hash, KeyRound, Wrench } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";


function OperatorWorkflow() {
  const searchParams = useSearchParams();
  const machine = searchParams.get('machine') || 'Unselected';
  const productType = searchParams.get('productType') || 'Unselected';
  const station = searchParams.get('station') || 'Unselected';
  
  const [formData, setFormData] = useState({
    operatorName: "",
    serialNumber: "",
    machineSpeed: "",
    machineFeed: "",
    vibrationLevel: "",
    coolantStatus: "",
    toolWearOk: true,
    toolWearReason: "",
    dimensionMeasureOk: true,
    dimensionMeasureReason: "",
    problem: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: "toolWearOk" | "dimensionMeasureOk", checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };
  
  const handleSelectChange = (id: "problem", value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  }

  const handleDataSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log({
        machine,
        productType,
        station,
        ...formData
    });
    setIsSubmitted(true);
  };
  
  const resetAll = () => {
      setFormData({
        operatorName: "",
        serialNumber: "",
        machineSpeed: "",
        machineFeed: "",
        vibrationLevel: "",
        coolantStatus: "",
        toolWearOk: true,
        toolWearReason: "",
        dimensionMeasureOk: true,
        dimensionMeasureReason: "",
        problem: "",
      });
      setIsSubmitted(false);
  }

  if (isSubmitted) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
             <Card className="w-full max-w-lg text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Submission Successful</CardTitle>
                    <CardDescription>Your production data has been recorded.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-left text-sm overflow-auto max-h-[50vh]">
                    <p><strong>Machine:</strong> {machine}</p>
                    <p><strong>Product Type:</strong> {productType}</p>
                    <p><strong>Station:</strong> {station}</p>
                    <p><strong>Operator Name:</strong> {formData.operatorName}</p>
                    <p><strong>Serial Number:</strong> {formData.serialNumber}</p>
                    <p><strong>Machine Speed:</strong> {formData.machineSpeed}</p>
                    <p><strong>Machine Feed:</strong> {formData.machineFeed}</p>
                    <p><strong>Vibration Level:</strong> {formData.vibrationLevel}</p>
                    <p><strong>Coolant Status:</strong> {formData.coolantStatus}</p>
                    <p><strong>Tool Wear & Tear:</strong> {formData.toolWearOk ? 'OK' : 'Not OK'}</p>
                    {!formData.toolWearOk && <p><strong>Reason:</strong> {formData.toolWearReason}</p>}
                    <p><strong>Dimension Measure:</strong> {formData.dimensionMeasureOk ? 'OK' : 'Not OK'}</p>
                    {!formData.dimensionMeasureOk && <p><strong>Reason:</strong> {formData.dimensionMeasureReason}</p>}
                    {formData.problem && <p><strong>Problem:</strong> {formData.problem}</p>}
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

  const problemOptions = [
    'Operator not available',
    'Tool breakdown',
    'Power failure',
    'Material not available',
    'Failure',
    'Other'
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <form onSubmit={handleDataSubmit}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><Wrench />Operator Data Entry</CardTitle>
            <CardDescription>
                Enter production data for <span className="font-bold text-primary">{machine}</span>.
            </CardDescription>
            <div className="text-sm text-muted-foreground pt-2">
                <div><strong>Product:</strong> {productType} | <strong>Station:</strong> {station}</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[65vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="operatorName">Operator Name</Label>
                    <Input id="operatorName" value={formData.operatorName} onChange={handleInputChange} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number of Breaker</Label>
                    <Input id="serialNumber" value={formData.serialNumber} onChange={handleInputChange} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="machineSpeed">Machine Speed</Label>
                    <Input id="machineSpeed" type="number" value={formData.machineSpeed} onChange={handleInputChange} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="machineFeed">Machine Feed</Label>
                    <Input id="machineFeed" type="number" value={formData.machineFeed} onChange={handleInputChange} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="vibrationLevel">Vibration Level</Label>
                    <Input id="vibrationLevel" type="number" value={formData.vibrationLevel} onChange={handleInputChange} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="coolantStatus">Coolant Status</Label>
                    <Input id="coolantStatus" value={formData.coolantStatus} onChange={handleInputChange} required />
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <div className="space-y-3">
                    <Label className="font-bold">Tool Wear and Tear</Label>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="toolWearOk" checked={formData.toolWearOk} onCheckedChange={(checked) => handleCheckboxChange("toolWearOk", checked as boolean)} />
                        <label htmlFor="toolWearOk" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            OK
                        </label>
                    </div>
                     {!formData.toolWearOk && (
                        <div className="pl-6 space-y-2">
                           <Label htmlFor="toolWearReason">Reason if not OK</Label>
                           <Textarea id="toolWearReason" value={formData.toolWearReason} onChange={handleInputChange} required />
                        </div>
                    )}
                </div>
                 <div className="space-y-3">
                    <Label className="font-bold">Dimension Measure</Label>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="dimensionMeasureOk" checked={formData.dimensionMeasureOk} onCheckedChange={(checked) => handleCheckboxChange("dimensionMeasureOk", checked as boolean)} />
                        <label htmlFor="dimensionMeasureOk" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            OK
                        </label>
                    </div>
                     {!formData.dimensionMeasureOk && (
                        <div className="pl-6 space-y-2">
                           <Label htmlFor="dimensionMeasureReason">Reason if not OK</Label>
                           <Textarea id="dimensionMeasureReason" value={formData.dimensionMeasureReason} onChange={handleInputChange} required />
                        </div>
                    )}
                </div>
                 <div className="space-y-3">
                    <Label className="font-bold">Problem</Label>
                     <Select onValueChange={(value) => handleSelectChange("problem", value)} value={formData.problem}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a problem if any" />
                        </SelectTrigger>
                        <SelectContent>
                            {problemOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4 pt-6">
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
    const searchParams = useSearchParams();

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
    const machine = searchParams.get('machine') || '';
    const workflowUrl = `/operator?machine=${encodeURIComponent(machine)}&productType=${encodeURIComponent(productType)}&station=${encodeURIComponent(station)}`;
    
    // This is a bit of a hack to update the URL for the workflow component
    // A more robust solution would use Next.js's router to push the new URL state.
    if (typeof window !== 'undefined' && step === 'workflow' && window.location.search.indexOf('productType') === -1) {
        window.history.replaceState(null, '', workflowUrl);
    }

    return <OperatorWorkflow />;
}
