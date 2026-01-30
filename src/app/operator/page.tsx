
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, Package, Hash, KeyRound, Wrench, ExternalLink, Clock, PlusCircle, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { saveSubmission } from "@/app/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DimensionCheck {
    catNo: string;
    status: 'ok' | 'not-ok' | '';
    reason: string;
}

function OperatorWorkflow() {
  const searchParams = useSearchParams();
  const machine = searchParams.get('machine') || 'Unselected';
  const productType = searchParams.get('productType') || 'Unselected';
  const station = searchParams.get('station') || 'Unselected';
  
  const [formData, setFormData] = useState({
    operatorName: "",
    shiftDetails: "",
    entryTime: "",
    exitTime: "",
    serialNumber: "",
    machineSpeed: "",
    machineFeed: "",
    vibrationLevel: "",
    coolantStatus: "",
    toolWearStatus: "ok",
    toolWearReason: "",
    dimensionMeasureStatus: "ok",
    dimensionMeasureReason: "",
    problem: "",
    otherProblemReason: "",
    materialAvailability: "",
    machineFailure: "no",
    machineFailureReason: "",
    gaugeChecked: "yes",
  });

  const [dimensionChecks, setDimensionChecks] = useState<DimensionCheck[]>([
      { catNo: '', status: '', reason: '' },
  ]);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleRadioChange = (id: "toolWearStatus" | "dimensionMeasureStatus" | "machineFailure" | "gaugeChecked", value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: "problem" | "shiftDetails" | "materialAvailability", value: string) => {
    const update: any = { [id]: value };
    if (id === 'problem') {
        update.otherProblemReason = '';
    }
    setFormData(prev => ({ ...prev, ...update }));
  }

  const handleDimensionCheckChange = (index: number, field: keyof DimensionCheck, value: string) => {
      const newChecks = [...dimensionChecks];
      const currentCheck = { ...newChecks[index] };
      
      if (field === 'status') {
          currentCheck.status = value as 'ok' | 'not-ok' | '';
          if (value === 'ok') {
              currentCheck.reason = ''; // Clear reason if status is OK
          }
      } else {
        (currentCheck as any)[field] = value;
      }

      newChecks[index] = currentCheck;
      setDimensionChecks(newChecks);
  };

  const handleAddDimensionCheck = () => {
    setDimensionChecks(prev => [...prev, { catNo: '', status: '', reason: '' }]);
  };

  const handleRemoveDimensionCheck = (index: number) => {
    if (dimensionChecks.length > 1) {
        setDimensionChecks(prev => prev.filter((_, i) => i !== index));
    }
  };


  const handleDataSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await saveSubmission({
        machine,
        productType,
        station,
        ...formData,
        dimensionChecks,
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
  };
  
  const resetAll = () => {
      setFormData({
        operatorName: "",
        shiftDetails: "",
        entryTime: "",
        exitTime: "",
        serialNumber: "",
        machineSpeed: "",
        machineFeed: "",
        vibrationLevel: "",
        coolantStatus: "",
        toolWearStatus: "ok",
        toolWearReason: "",
        dimensionMeasureStatus: "ok",
        dimensionMeasureReason: "",
        problem: "",
        otherProblemReason: "",
        materialAvailability: "",
        machineFailure: "no",
        machineFailureReason: "",
        gaugeChecked: "yes",
      });
      setDimensionChecks([
          { catNo: '', status: '', reason: '' },
      ]);
      setIsSubmitted(false);
  }

  if (isSubmitted) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
             <Card className="w-full max-w-lg text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <CheckCircle className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Submission Successful</CardTitle>
                    <CardDescription>Your production data has been recorded.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-left text-sm overflow-auto max-h-[50vh]">
                    <p><strong>Machine:</strong> {machine}</p>
                    <p><strong>Product Type:</strong> {productType}</p>
                    <p><strong>Station:</strong> {station}</p>
                    <p><strong>Operator Name:</strong> {formData.operatorName}</p>
                    <p><strong>Shift Details:</strong> {formData.shiftDetails}</p>
                    <p><strong>Work Entry Time:</strong> {formData.entryTime}</p>
                    <p><strong>Work Exit Time:</strong> {formData.exitTime}</p>
                    <p><strong>Serial Number:</strong> {formData.serialNumber}</p>
                    <p><strong>Machine Speed:</strong> {formData.machineSpeed}</p>
                    <p><strong>Machine Feed:</strong> {formData.machineFeed}</p>
                    <p><strong>Vibration Level:</strong> {formData.vibrationLevel}</p>
                    <p><strong>Coolant Status:</strong> {formData.coolantStatus}</p>
                    <p><strong>Material Availability:</strong> {formData.materialAvailability}</p>
                    <p><strong>Machine Failure:</strong> {formData.machineFailure}</p>
                    {formData.machineFailure === 'yes' && <p><strong>Failure Reason:</strong> {formData.machineFailureReason}</p>}
                    <p><strong>Gauge Checked:</strong> {formData.gaugeChecked}</p>
                    <p><strong>Tool Wear & Tear:</strong> {formData.toolWearStatus}</p>
                    {formData.toolWearStatus === 'not-ok' && <p><strong>Reason:</strong> {formData.toolWearReason}</p>}
                    <p><strong>Dimension Measure:</strong> {formData.dimensionMeasureStatus}</p>
                    {dimensionChecks.map((check, index) => (
                        <div key={index}>
                            <p><strong>CAT No. {index + 1}:</strong> {check.catNo}, <strong>Status:</strong> {check.status} {check.status === 'not-ok' && `, Reason: ${check.reason}`}</p>
                        </div>
                    ))}
                    {formData.dimensionMeasureStatus === 'not-ok' && <p><strong>Reason:</strong> {formData.dimensionMeasureReason}</p>}
                    {formData.problem && <p><strong>Problem:</strong> {formData.problem}</p>}
                    {formData.problem === 'Other' && <p><strong>Other Reason:</strong> {formData.otherProblemReason}</p>}
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

  const shiftOptions = ['First', 'Second', 'Third', 'General'];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <form onSubmit={handleDataSubmit}>
          <CardHeader>
            <div className="flex items-center gap-4">
                <CardTitle className="font-headline text-2xl flex items-center gap-2"><Wrench />Operator Data Entry</CardTitle>
            </div>
            <CardDescription>
                Enter production data for <span className="font-bold text-primary">{machine}</span>.
            </CardDescription>
            <div className="text-sm text-muted-foreground pt-2">
                <div><strong>Product:</strong> {productType} | <strong>Station:</strong> {station}</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="operatorName">Operator Name</Label>
                    <Input id="operatorName" value={formData.operatorName} onChange={handleInputChange} required className="text-lg" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="shiftDetails">Shift Details</Label>
                    <Select onValueChange={(value) => handleSelectChange("shiftDetails", value)} value={formData.shiftDetails} required>
                        <SelectTrigger className="text-lg">
                            <SelectValue placeholder="Select a shift..." />
                        </SelectTrigger>
                        <SelectContent>
                            {shiftOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="entryTime" className="flex items-center gap-2"><Clock className="w-4 h-4" /> Entry Time</Label>
                    <Input id="entryTime" type="time" value={formData.entryTime} onChange={handleInputChange} required className="text-lg" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="exitTime" className="flex items-center gap-2"><Clock className="w-4 h-4" /> Exit Time</Label>
                    <Input id="exitTime" type="time" value={formData.exitTime} onChange={handleInputChange} required className="text-lg" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number of Job</Label>
                    <Input id="serialNumber" value={formData.serialNumber} onChange={handleInputChange} required className="text-lg" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="machineSpeed">Machine Speed</Label>
                    <Input id="machineSpeed" type="number" value={formData.machineSpeed} onChange={handleInputChange} required className="text-lg" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="machineFeed">Machine Feed</Label>
                    <Input id="machineFeed" type="number" value={formData.machineFeed} onChange={handleInputChange} required className="text-lg" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="vibrationLevel">Vibration Level</Label>
                    <Input id="vibrationLevel" type="number" value={formData.vibrationLevel} onChange={handleInputChange} required className="text-lg" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="coolantStatus">Coolant Status</Label>
                    <Input id="coolantStatus" value={formData.coolantStatus} onChange={handleInputChange} required className="text-lg" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="materialAvailability">Material Availability</Label>
                    <Select onValueChange={(value) => handleSelectChange("materialAvailability", value)} value={formData.materialAvailability} required>
                        <SelectTrigger className="text-lg">
                            <SelectValue placeholder="Select material status..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Not Available">Not Available</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <div className="space-y-3">
                    <Label className="font-bold">Machine Failure</Label>
                     <RadioGroup 
                        value={formData.machineFailure} 
                        onValueChange={(value) => handleRadioChange("machineFailure", value)} 
                        className="flex space-x-4"
                     >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="failure-yes" />
                            <Label htmlFor="failure-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="failure-no" />
                            <Label htmlFor="failure-no">No</Label>
                        </div>
                    </RadioGroup>
                     {formData.machineFailure === 'yes' && (
                        <div className="pl-2 pt-2 space-y-2">
                           <Label htmlFor="machineFailureReason">Reason for Failure</Label>
                           <Textarea id="machineFailureReason" value={formData.machineFailureReason} required={formData.machineFailure === 'yes'} className="text-lg" />
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <Label className="font-bold">Gauge Checked</Label>
                     <RadioGroup 
                        value={formData.gaugeChecked} 
                        onValueChange={(value) => handleRadioChange("gaugeChecked", value)} 
                        className="flex space-x-4"
                     >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="gauge-yes" />
                            <Label htmlFor="gauge-yes">Checked</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="gauge-no" />
                            <Label htmlFor="gauge-no">Not Checked</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-3">
                    <Label className="font-bold">Tool Wear and Tear</Label>
                     <RadioGroup 
                        value={formData.toolWearStatus} 
                        onValueChange={(value) => handleRadioChange("toolWearStatus", value)} 
                        className="flex space-x-4"
                     >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ok" id="tool-ok" />
                            <Label htmlFor="tool-ok">OK</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="not-ok" id="tool-not-ok" />
                            <Label htmlFor="tool-not-ok">Not OK</Label>
                        </div>
                    </RadioGroup>
                     {formData.toolWearStatus === 'not-ok' && (
                        <div className="pl-2 pt-2 space-y-2">
                           <Label htmlFor="toolWearReason">Reason if not OK</Label>
                           <Textarea id="toolWearReason" value={formData.toolWearReason} required={formData.toolWearStatus === 'not-ok'} className="text-lg" />
                        </div>
                    )}
                </div>
                 <div className="space-y-3">
                    <Label className="font-bold">Dimension Measure</Label>
                     <div className="pb-2">
                         <a href="https://shorturl.at/HyQT7" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline">
                            DRAWINGS <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                    <div className="w-full">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>CAT No.</TableHead>
                                    <TableHead className="text-center w-20">Ok</TableHead>
                                    <TableHead className="text-center w-[60%]">Not ok (Reason)</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dimensionChecks.map((check, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Input 
                                                type="text" 
                                                value={check.catNo} 
                                                onChange={(e) => handleDimensionCheckChange(index, 'catNo', e.target.value)}
                                                className="text-lg"
                                                required
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <RadioGroup 
                                                value={check.status} 
                                                onValueChange={(value) => handleDimensionCheckChange(index, 'status', value)}
                                                className="justify-center"
                                            >
                                                <RadioGroupItem value="ok" id={`dim-check-${index}-ok`} />
                                            </RadioGroup>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center gap-2">
                                                <RadioGroup 
                                                    value={check.status} 
                                                    onValueChange={(value) => handleDimensionCheckChange(index, 'status', value)}
                                                    className="justify-center"
                                                >
                                                    <RadioGroupItem value="not-ok" id={`dim-check-${index}-not-ok`} />
                                                </RadioGroup>
                                                {check.status === 'not-ok' && (
                                                    <Input
                                                        type="text"
                                                        placeholder="Reason"
                                                        value={check.reason}
                                                        onChange={(e) => handleDimensionCheckChange(index, 'reason', e.target.value)}
                                                        className="text-sm"
                                                        required
                                                    />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveDimensionCheck(index)} disabled={dimensionChecks.length === 1}>
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <Button variant="outline" size="sm" type="button" onClick={handleAddDimensionCheck} className="mt-2">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add Row
                        </Button>
                    </div>
                     <RadioGroup 
                        value={formData.dimensionMeasureStatus} 
                        onValueChange={(value) => handleRadioChange("dimensionMeasureStatus", value)}
                        className="flex space-x-4 pt-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ok" id="dim-ok" />
                            <Label htmlFor="dim-ok">Overall OK</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="not-ok" id="dim-not-ok" />
                            <Label htmlFor="dim-not-ok">Overall Not OK</Label>
                        </div>
                    </RadioGroup>
                     {formData.dimensionMeasureStatus === 'not-ok' && (
                        <div className="pl-2 pt-2 space-y-2">
                           <Label htmlFor="dimensionMeasureReason">Reason if not OK</Label>
                           <Textarea id="dimensionMeasureReason" value={formData.dimensionMeasureReason} onChange={handleInputChange} required={formData.dimensionMeasureStatus === 'not-ok'} className="text-lg" />
                        </div>
                    )}
                </div>
                 <div className="space-y-3">
                    <Label className="font-bold">Problem</Label>
                     <Select onValueChange={(value) => handleSelectChange("problem", value)} value={formData.problem}>
                        <SelectTrigger className="text-lg">
                            <SelectValue placeholder="Select a problem if any" />
                        </SelectTrigger>
                        <SelectContent>
                            {problemOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     {formData.problem === 'Other' && (
                        <div className="pl-2 pt-2 space-y-2">
                           <Label htmlFor="otherProblemReason">Please specify</Label>
                           <Textarea id="otherProblemReason" value={formData.otherProblemReason} onChange={handleInputChange} required={formData.problem === 'Other'} className="text-lg" />
                        </div>
                    )}
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Data'}
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
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl">
                 <CardHeader className="text-center">
                     <div className="flex items-center gap-4">
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                            <Package className="w-8 h-8 text-primary" />
                        </div>
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
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex items-center gap-4">
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                            <Hash className="w-8 h-8 text-primary" />
                        </div>
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
                correctPassword="admin@123"
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
