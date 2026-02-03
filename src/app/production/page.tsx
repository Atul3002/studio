
"use client";

import { useState } from "react";
import Link from 'next/link';
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft, CalendarDays, Hash, Target, FileText, Wrench, Droplets, Check, X, ClipboardList, Scale, Ruler } from "lucide-react";

import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { saveSubmission } from "@/app/actions";

function ProductionDashboard() {
  const [entryDate, setEntryDate] = useState<Date | undefined>(new Date());
  const [dailyProductionTarget, setDailyProductionTarget] = useState("");
  const [rejectionQuantity, setRejectionQuantity] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [toolWearDetails, setToolWearDetails] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState<Date | undefined>();
  const [gaugeStatus, setGaugeStatus] = useState("ok");
  const [gaugeReason, setGaugeReason] = useState("");
  const [dimensionStatus, setDimensionStatus] = useState("ok");
  const [dimensionReason, setDimensionReason] = useState("");
  const [shiftDetails, setShiftDetails] = useState("");
  const [coolantStatus, setCoolantStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await saveSubmission({
        entryType: 'productionData',
        entryDate: entryDate ? format(entryDate, "yyyy-MM-dd") : "",
        dailyProductionTarget,
        rejectionQuantity,
        rejectionReason,
        toolWearDetails,
        maintenanceDate: maintenanceDate ? format(maintenanceDate, "PPP") : "",
        gaugeStatus,
        gaugeReason,
        dimensionStatus,
        dimensionReason,
        shiftDetails,
        coolantStatus,
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    setDailyProductionTarget("");
    setRejectionQuantity("");
    setRejectionReason("");
    setToolWearDetails("");
    setMaintenanceDate(undefined);
    setGaugeStatus("ok");
    setGaugeReason("");
    setDimensionStatus("ok");
    setDimensionReason("");
    setShiftDetails("");
    setCoolantStatus("");
    setTimeout(() => setIsSubmitted(false), 3000);
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
        <div className="flex flex-col sm:gap-4 sm:py-4">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <h1 className="font-headline text-2xl font-semibold pl-20">Production Team</h1>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Production Data Entry</CardTitle>
                        <CardDescription>Submit daily production and rejection information.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <div className="space-y-2 max-w-sm">
                                <Label className="flex items-center gap-2 font-semibold"><CalendarDays /> Entry Date (For back-dating)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!entryDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {entryDate ? format(entryDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={entryDate} onSelect={setEntryDate} initialFocus/></PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="daily-production-target" className="flex items-center gap-2 font-semibold text-base"><Target />Daily Production Target</Label>
                                    <Input id="daily-production-target" type="number" value={dailyProductionTarget} onChange={(e) => setDailyProductionTarget(e.target.value)} placeholder="Enter target quantity" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rejection-quantity" className="flex items-center gap-2 font-bold text-base"><Hash />Rejection Quantity</Label>
                                    <Input id="rejection-quantity" type="number" value={rejectionQuantity} onChange={(e) => setRejectionQuantity(e.target.value)} placeholder="Enter rejected quantity" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shift-details" className="flex items-center gap-2 font-semibold text-base"><ClipboardList />Shift Details</Label>
                                    <Input id="shift-details" value={shiftDetails} onChange={(e) => setShiftDetails(e.target.value)} placeholder="e.g., A, B, C" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="coolant-status" className="flex items-center gap-2 font-bold text-base"><Droplets />Coolant Status</Label>
                                    <Input id="coolant-status" value={coolantStatus} onChange={(e) => setCoolantStatus(e.target.value)} placeholder="Status" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="rejection-reason" className="flex items-center gap-2 font-semibold text-base"><FileText />Reason for Rejection</Label>
                                    <Textarea id="rejection-reason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Description" required={parseInt(rejectionQuantity) > 0} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-stretch">
                             <Button type="submit" disabled={isSubmitting || !dailyProductionTarget || !rejectionQuantity}>
                                {isSubmitting ? "Submitting..." : "Submit Data"}
                            </Button>
                            {isSubmitted && <p className="text-green-600 text-center text-sm mt-2">Data submitted successfully!</p>}
                        </CardFooter>
                    </form>
                </Card>
            </main>
        </div>
    </div>
  );
}

export default function ProductionPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  if (!isAuthenticated) return <LoginForm role="Production Team" correctPassword="admin@123" onLoginSuccess={() => setIsAuthenticated(true)} />;
  return <ProductionDashboard />;
}
