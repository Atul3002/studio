
"use client";

import { useState } from "react";
import Link from 'next/link';
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft, CalendarDays, Hash, Target, FileText, Wrench } from "lucide-react";

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

function ProductionDashboard() {
  const [dailyProductionTarget, setDailyProductionTarget] = useState("");
  const [rejectionQuantity, setRejectionQuantity] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [toolWearDetails, setToolWearDetails] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await saveSubmission({
        entryType: 'productionData',
        dailyProductionTarget,
        rejectionQuantity,
        rejectionReason,
        toolWearDetails,
        maintenanceDate: maintenanceDate ? format(maintenanceDate, "PPP") : "",
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
    setDailyProductionTarget("");
    setRejectionQuantity("");
    setRejectionReason("");
    setToolWearDetails("");
    setMaintenanceDate(undefined);
    setTimeout(() => setIsSubmitted(false), 3000);
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button asChild variant="outline" size="icon" className="h-8 w-8">
                    <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <h1 className="font-headline text-2xl font-semibold">Production Team</h1>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Additional Data Entry</CardTitle>
                        <CardDescription>Submit rejection and maintenance information.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="daily-production-target" className="flex items-center gap-2"><Target />Daily Production Target</Label>
                                <Input 
                                    id="daily-production-target"
                                    type="number"
                                    value={dailyProductionTarget}
                                    onChange={(e) => setDailyProductionTarget(e.target.value)}
                                    placeholder="Enter target quantity"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rejection-quantity" className="flex items-center gap-2"><Hash />Rejection Quantity</Label>
                                <Input 
                                    id="rejection-quantity"
                                    type="number"
                                    value={rejectionQuantity}
                                    onChange={(e) => setRejectionQuantity(e.target.value)}
                                    placeholder="Enter quantity of rejected items"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rejection-reason" className="flex items-center gap-2"><FileText />Reason for Rejection</Label>
                                <Textarea 
                                    id="rejection-reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Describe why items were rejected"
                                    required={parseInt(rejectionQuantity) > 0}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tool-wear-details" className="flex items-center gap-2"><Wrench />Tool Wear Out Details</Label>
                                <Textarea 
                                    id="tool-wear-details"
                                    value={toolWearDetails}
                                    onChange={(e) => setToolWearDetails(e.target.value)}
                                    placeholder="Describe any tool wear and tear"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maintenance-date" className="flex items-center gap-2"><CalendarDays />Machine Maintenance Schedule</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="maintenance-date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !maintenanceDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {maintenanceDate ? format(maintenanceDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={maintenanceDate}
                                            onSelect={setMaintenanceDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
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

  if (!isAuthenticated) {
    return (
      <LoginForm
        role="Production Team"
        correctPassword="prod123"
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return <ProductionDashboard />;
}
