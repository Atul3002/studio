
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart, Truck, X, CheckCircle, Circle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubmissions } from "@/app/actions";

interface TimelineStep {
    name: string;
    completed: boolean;
}

interface ProcessedTimeline {
    catNo: string;
    steps: TimelineStep[];
}

function getProcessedTimelines(submissions: any[]): ProcessedTimeline[] {
    const supplierSubmissions = submissions.filter(s => s.entryType === 'supplierData');
    
    return supplierSubmissions.map(sub => ({
        catNo: sub.catNo || 'N/A',
        steps: [
            { name: "Customer Qty", completed: !!sub.customerQuantity && sub.customerQuantity !== '0' },
            { name: "Inspection", completed: !!sub.inspection && sub.inspection !== '0' },
            { name: "Packing", completed: !!sub.packing && sub.packing !== '0' },
            { name: "Dispatch", completed: !!sub.dispatch && sub.dispatch !== '0' },
        ]
    }));
}

function ProcessTimeline({ timeline }: { timeline: ProcessedTimeline }) {
    return (
        <div className="p-4 border-b">
            <h4 className="font-semibold text-md mb-4">CAT No: {timeline.catNo}</h4>
            <div className="relative flex items-center justify-between w-full">
                {/* Timeline line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" />
                
                {timeline.steps.map((step, index) => (
                    <div key={index} className="relative z-10 flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-primary' : 'bg-muted border-2 border-primary'}`}>
                            {step.completed ? (
                                <CheckCircle className="h-5 w-5 text-primary-foreground" />
                            ) : (
                                <Circle className="h-4 w-4 text-primary/50" />
                            )}
                        </div>
                        <p className="text-xs text-center mt-2 w-20">{step.name}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

function SupplierDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [timelines, setTimelines] = useState<ProcessedTimeline[]>([]);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2023, 2024, 2025];

  useEffect(() => {
    getSubmissions().then(data => {
        const supplierSubmissions = data.filter(s => s.entryType === 'supplierData');

        const filteredData = supplierSubmissions.filter(s => {
             const submissionDate = new Date(s.customerDate);
             const monthMatch = selectedMonth !== null ? submissionDate.getMonth() === selectedMonth : true;
             const yearMatch = selectedYear !== null ? submissionDate.getFullYear() === selectedYear : true;
             return monthMatch && yearMatch;
        });
        
        const processed = getProcessedTimelines(filteredData);
        setTimelines(processed);
    })
  }, [selectedMonth, selectedYear]);

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
  };
  
  const clearFilters = () => {
    setSelectedMonth(null);
    setSelectedYear(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border/40 bg-background/95 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2 pl-20">
          <BarChart className="h-6 w-6" />
          <div>
            <h1 className="text-xl font-semibold">ADMIN DASHBOARD</h1>
          </div>
        </div>
        <nav className="flex-1 text-center">
            <Link href="/admin" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Overall</Link>
            <Link href="/admin/sales" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Sales</Link>
            <Link href="/admin/quality" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Quality</Link>
            <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Production</Link>
            <Link href="/admin/machine" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Machine</Link>
            <Link href="/admin/inventory" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Inventory</Link>
            <Link href="/admin/oee" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">OEE</Link>
            <Link href="/admin/skill-matrix" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Skill Matrix</Link>
        </nav>
      </header>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 md:grid-cols-[240px_1fr]">
        <aside className="py-4 space-y-4">
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Yearly Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                {years.map((year) => (
                  <Button
                    key={year}
                    variant={selectedYear === year ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => handleYearSelect(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Monthly Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                {months.map((month, index) => (
                  <Button
                    key={month}
                    variant={selectedMonth === index ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => handleMonthSelect(index)}
                  >
                    {month}
                  </Button>
                ))}
              </div>
            </CardContent>
            {(selectedMonth !== null || selectedYear !== null) && (
               <CardHeader className="pt-0">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
               </CardHeader>
            )}
          </Card>
        </aside>
        <div className="py-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Truck /> {selectedYear ? `${selectedYear} ` : ''}{selectedMonth !== null ? `${months[selectedMonth]} ` : ''}Supplier Process Tracking</CardTitle>
                    <CardDescription>Visual timeline of key process checkpoints for each supplier entry.</CardDescription>
                </CardHeader>
                <CardContent>
                    {timelines.length > 0 ? (
                        <div className="space-y-6">
                            {timelines.map((timeline, index) => (
                                <ProcessTimeline key={index} timeline={timeline} />
                            ))}
                        </div>
                    ) : (
                         <div className="flex items-center justify-center h-48">
                            <p>No supplier data found for the selected period.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}

export default function SupplierAdminPage() {
    return <SupplierDashboard />
}

    