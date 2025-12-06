
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Truck, CheckCircle, Cog } from "lucide-react";

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
    customerDate: undefined as Date | undefined,
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
};


function SupplierDashboard() {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, customerDate: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { finishQty, ...submissionData } = formData;
    await saveSubmission({
      entryType: 'supplierData',
      ...submissionData,
      customerDate: formData.customerDate ? format(formData.customerDate, "PPP") : "",
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
  };
  
  const resetForm = () => {
    setFormData(initialFormState);
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
                      <CardDescription>Supplier data has been recorded.</CardDescription>
                  </CardHeader>
                  <CardFooter>
                      <Button onClick={resetForm} className="w-full">
                          Enter More Supplier Data
                      </Button>
                  </CardFooter>
              </Card>
          </main>
      )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
        <div className="flex flex-col sm:gap-4 sm:py-4">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <h1 className="font-headline text-2xl font-semibold pl-20">Supplier Data Entry</h1>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2 text-2xl"><Truck />New Supplier Entry</CardTitle>
                            <CardDescription>Fill in the details for the new supplier data record.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                           <div className="space-y-4 pt-4">
                                <h3 className="text-lg font-semibold">Product & Customer Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div className="space-y-2">
                                        <Label htmlFor="srNo">Sr No</Label>
                                        <Input id="srNo" value={formData.srNo} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="catNo">CAT No</Label>
                                        <Input id="catNo" value={formData.catNo} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea id="description" value={formData.description} onChange={handleInputChange} required />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-lg font-semibold">Process Tracking</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customerQuantity">Customer Quantity</Label>
                                        <Input id="customerQuantity" value={formData.customerQuantity} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customerDate">Customer Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button id="customerDate" variant={"outline"} className={cn("w-full justify-start text-left font-normal",!formData.customerDate && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.customerDate ? format(formData.customerDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.customerDate} onSelect={handleDateChange} initialFocus/></PopoverContent>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        correctPassword="supplier123"
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return <SupplierDashboard />;
}

    