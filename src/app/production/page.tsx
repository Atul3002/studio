
"use client";

import { useState } from "react";
import Link from 'next/link';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft, CalendarDays, Hash } from "lucide-react";

import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { saveSubmission } from "@/app/actions";

const chartData = [
  { day: "Monday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Tuesday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Wednesday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Thursday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Friday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Saturday", produced: Math.floor(Math.random() * 500) + 500 },
];

const chartConfig = {
  produced: {
    label: "Breakers Produced",
    color: "hsl(var(--primary))",
  },
};

function ProductionDashboard() {
  const [rejectionQuantity, setRejectionQuantity] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await saveSubmission({
        entryType: 'productionData',
        rejectionQuantity,
        maintenanceDate: maintenanceDate ? format(maintenanceDate, "PPP") : "",
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
    setRejectionQuantity("");
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
                <h1 className="font-headline text-2xl font-semibold">Production Dashboard</h1>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Daily Production Report</CardTitle>
                        <CardDescription>Total breakers produced over the last week.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartData}>
                                    <XAxis
                                        dataKey="day"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--accent) / 0.3)' }}
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar dataKey="produced" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Additional Data Entry</CardTitle>
                        <CardDescription>Submit rejection and maintenance information.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
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
                             <Button type="submit" disabled={isSubmitting || (!rejectionQuantity && !maintenanceDate)}>
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
