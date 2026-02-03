"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import Papa from 'papaparse';
import { Calendar as CalendarIcon, Truck, CheckCircle, Cog, Upload } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { saveSubmission } from "@/app/actions";

const initialFormState = {
    srNo: "",
    catNo: "",
    description: "",
    customerQuantity: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    completionDate: undefined as Date | undefined,
    rmDescription: "",
    rmRate: "",
    scrapKg: "",
    rmLeadTime: "",
    blankCutting: "",
    tapping: "",
    finishing: "",
    inspection: "",
    packing: "",
    dispatch: "",
    machineName: "",
    machineNumber: "",
    machinePower: "",
    tonnage: "",
    machineCapacity: "",
    settingTime: "",
    machineSpeed: "",
    cnc1: "",
    cnc2: "",
    cnc3: "",
    vmc1: "",
    vmc2: "",
};

function SupplierFileUpload({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const processAndSave = async (records: any[]) => {
    const expectedKeys = Object.keys(initialFormState);
    const keyMap = new Map<string, string>();
    expectedKeys.forEach(key => {
        keyMap.set(key.toLowerCase().replace(/\s/g, ''), key);
    });

    for (const record of records) {
        const submissionRecord: { [key: string]: any } = { entryType: 'supplierData' };
        let hasData = false;

        for (const header in record) {
            const normalizedHeader = header.trim().toLowerCase().replace(/\s/g, '');
            if (keyMap.has(normalizedHeader)) {
                const originalKey = keyMap.get(normalizedHeader)!;
                let value = record[header];
                
                if (['startDate', 'endDate', 'completionDate', 'entryDate'].includes(originalKey)) {
                    if (value) {
                        let dateObj;
                        if (value instanceof Date) {
                            dateObj = value;
                        } else {
                            dateObj = new Date(value);
                        }
                        
                        if (dateObj && !isNaN(dateObj.getTime())) {
                            submissionRecord[originalKey] = format(dateObj, "yyyy-MM-dd");
                        } else {
                            submissionRecord[originalKey] = value;
                        }
                    } else {
                         submissionRecord[originalKey] = value;
                    }
                } else {
                    submissionRecord[originalKey] = value;
                }

                if (submissionRecord[originalKey] !== null && submissionRecord[originalKey] !== '') {
                    hasData = true;
                }
            }
        }
        
        if (hasData) {
           await saveSubmission(submissionRecord);
        }
    }
  };

  const handleProcessFile = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error("Failed to read file.");
        }

        let records: any[] = [];
        if (file.name.toLowerCase().endsWith('.csv')) {
          const result = Papa.parse(data as string, { header: true, skipEmptyLines: true });
          if (result.errors.length > 0) {
              console.error("CSV Parsing errors: ", result.errors);
              throw new Error("Failed to parse CSV file. For dates, please use a format like YYYY-MM-DD.");
          }
          records = result.data;
        } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
          const { read, utils } = await import('xlsx');
          const workbook = read(data, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          records = utils.sheet_to_json(worksheet, {raw: false});
        } else {
           throw new Error("Unsupported file type. Please upload a CSV or Excel file.");
        }

        if (records.length > 0) {
            await processAndSave(records);
            onUploadSuccess();
        } else {
            setError("No data found in the file.");
        }

      } catch (err: any) {
        setError(err.message || "An error occurred during file processing.");
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
        setIsUploading(false);
        setError("Failed to read the file.");
    }

    if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-2xl"><Upload /> Upload Bulk Data</CardTitle>
        <CardDescription>Upload an Excel (.xlsx, .xls) or CSV file for bulk supplier data entry.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Data File</Label>
          <Input id="file-upload" type="file" accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileChange} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={handleProcessFile} disabled={!file || isUploading} className="w-full">
          {isUploading ? "Processing..." : "Upload and Process File"}
        </Button>
      </CardFooter>
    </Card>
  );
}


function SubmissionSuccess({ onReset }: { onReset: () => void }) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="w-full max-w-lg text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <CheckCircle className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Submission Successful</CardTitle>
                    <CardDescription>Supplier data has been recorded.</CardDescription>
                </CardHeader>
                <CardFooter className="flex-col gap-2">
                    <Button onClick={onReset} className="w-full">
                        Enter More Supplier Data
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/admin/supplier">View Supplier Dashboard</Link>
                    </Button>
                </CardFooter>
            </Card>
        </main>
    )
}

function SupplierDashboard() {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [entryDate, setEntryDate] = useState<Date | undefined>(new Date());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleDateChange = (fieldName: 'startDate' | 'endDate' | 'completionDate', date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [fieldName]: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await saveSubmission({
      entryType: 'supplierData',
      entryDate: entryDate ? format(entryDate, "yyyy-MM-dd") : "",
      ...formData,
      startDate: formData.startDate ? format(formData.startDate, "yyyy-MM-dd") : "",
      endDate: formData.endDate ? format(formData.endDate, "yyyy-MM-dd") : "",
      completionDate: formData.completionDate ? format(formData.completionDate, "yyyy-MM-dd") : "",
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
  };
  
  const resetForm = () => {
    setFormData(initialFormState);
    setEntryDate(new Date());
    setIsSubmitted(false);
  }

  if (isSubmitted) {
      return <SubmissionSuccess onReset={resetForm} />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
        <div className="flex flex-col sm:gap-4 sm:py-4">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <h1 className="font-headline text-2xl font-semibold pl-20">Supplier Data Entry</h1>
            </header>
            <main className="grid flex-1 items-start gap-8 p-4 sm:px-6 sm:py-0 md:gap-8">
                <SupplierFileUpload onUploadSuccess={() => setIsSubmitted(true)} />
                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2 text-2xl"><Truck />New Supplier Entry</CardTitle>
                            <CardDescription>Fill in the details for the new supplier data record.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-2">
                                <Label htmlFor="entryDate">Entry Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button id="entryDate" variant={"outline"} className={cn("w-full max-w-sm justify-start text-left font-normal",!entryDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {entryDate ? format(entryDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={entryDate} onSelect={setEntryDate} initialFocus/></PopoverContent>
                                </Popover>
                            </div>
                           <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-lg font-semibold">Product & Customer Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                   <div className="space-y-2">
                                        <Label htmlFor="srNo">Sr No</Label>
                                        <Input id="srNo" value={formData.srNo} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="catNo">CAT No</Label>
                                        <Input id="catNo" value={formData.catNo} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea id="description" value={formData.description} onChange={handleInputChange} required />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-lg font-semibold">Process Tracking</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customerQuantity">Customer Quantity</Label>
                                        <Input id="customerQuantity" value={formData.customerQuantity} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button id="startDate" variant={"outline"} className={cn("w-full justify-start text-left font-normal",!formData.startDate && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.startDate} onSelect={(date) => handleDateChange('startDate', date)} initialFocus/></PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">End Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button id="endDate" variant={"outline"} className={cn("w-full justify-start text-left font-normal",!formData.endDate && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.endDate} onSelect={(date) => handleDateChange('endDate', date)} initialFocus/></PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="completionDate">Completion Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button id="completionDate" variant={"outline"} className={cn("w-full justify-start text-left font-normal",!formData.completionDate && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.completionDate ? format(formData.completionDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.completionDate} onSelect={(date) => handleDateChange('completionDate', date)} initialFocus/></PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="blankCutting">Blank Cutting</Label>
                                        <Input id="blankCutting" value={formData.blankCutting} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tapping">Tapping</Label>
                                        <Input id="tapping" value={formData.tapping} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="finishing">Finishing</Label>
                                        <Input id="finishing" value={formData.finishing} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="inspection">Inspection</Label>
                                        <Input id="inspection" value={formData.inspection} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="packing">Packing</Label>
                                        <Input id="packing" value={formData.packing} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dispatch">Dispatch</Label>
                                        <Input id="dispatch" value={formData.dispatch} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>
                             <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-lg font-semibold">Raw Material Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="rmDescription">RM Description</Label>
                                        <Input id="rmDescription" value={formData.rmDescription} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rmRate">RM Rate</Label>
                                        <Input id="rmRate" type="number" value={formData.rmRate} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="scrapKg">Scrap in kg</Label>
                                        <Input id="scrapKg" type="number" value={formData.scrapKg} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rmLeadTime">RM Lead Time (Days)</Label>
                                        <Input id="rmLeadTime" type="number" value={formData.rmLeadTime} onChange={handleInputChange} required />
                                    </div>
                                </div>
                            </div>
                             <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-lg font-semibold flex items-center gap-2"><Cog />Machine Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="machineName">Machine Name</Label>
                                        <Input id="machineName" value={formData.machineName} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="machineNumber">Machine Number</Label>
                                        <Input id="machineNumber" value={formData.machineNumber} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="machinePower">Machine Power (kW)</Label>
                                        <Input id="machinePower" type="number" value={formData.machinePower} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tonnage">Tonnage</Label>
                                        <Input id="tonnage" type="number" value={formData.tonnage} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="machineCapacity">Machine Capacity</Label>
                                        <Input id="machineCapacity" value={formData.machineCapacity} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="settingTime">Setting Time (min)</Label>
                                        <Input id="settingTime" type="number" value={formData.settingTime} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="machineSpeed">Machine Speed</Label>
                                        <Input id="machineSpeed" type="number" value={formData.machineSpeed} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cnc1">CNC1</Label>
                                        <Input id="cnc1" value={formData.cnc1} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cnc2">CNC2</Label>
                                        <Input id="cnc2" value={formData.cnc2} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cnc3">CNC3</Label>
                                        <Input id="cnc3" value={formData.cnc3} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vmc1">VMC1</Label>
                                        <Input id="vmc1" value={formData.vmc1} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vmc2">VMC2</Label>
                                        <Input id="vmc2" value={formData.vmc2} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Submit Supplier Data"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </main>
        </div>
    </div>
  );
}

export default function SupplierPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <LoginForm
        role="Supplier Team"
        correctPassword="admin@123"
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return <SupplierDashboard />;
}
