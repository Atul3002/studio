
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine } from "recharts";
import { BarChart, Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubmissions } from "@/app/actions";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const change = payload[0].value - payload[1].value;
    const isTotal = payload[0].payload.name === 'Actual Output' || payload[0].payload.name === 'Production Target';

    return (
      <div className="p-2 bg-background/80 border border-border rounded-lg shadow-lg">
        <p className="label text-sm text-foreground font-semibold">{`${label}`}</p>
        <p className="intro text-xs" style={{ color: isTotal || change > 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }}>
          {isTotal ? `Total: ${payload[1].value.toLocaleString()}` : `Change: ${change.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

interface WaterfallData {
    name: string;
    value: number;
    start?: number;
    end?: number;
    fill: string;
}

function ProductionDashboard() {
    const [waterfallData, setWaterfallData] = useState<WaterfallData[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        getSubmissions().then(allData => {
            const filteredData = selectedMonth !== null 
                ? allData.filter(s => new Date(s.id).getMonth() === selectedMonth)
                : allData;

            const productionSubmissions = filteredData.filter(s => s.entryType === 'productionData');
            
            let totalTarget = 0;
            let totalRejection = 0;
            
            productionSubmissions.forEach(s => {
                totalTarget += parseInt(s.dailyProductionTarget || 0, 10);
                totalRejection += parseInt(s.rejectionQuantity || 0, 10);
            });
            
            const goodParts = totalTarget - totalRejection;

            const chartData = [
                { name: 'Production Target', value: totalTarget },
                { name: 'Rejections', value: -totalRejection },
                { name: 'Actual Output', value: goodParts },
            ];

            let cumulative = 0;
            const processedData = chartData.map((d, index) => {
                const isTotal = d.name === 'Production Target' || d.name === 'Actual Output';
                const start = cumulative;
                let end;
                let fill;
                
                if (isTotal) {
                    end = d.value;
                    cumulative = d.value;
                    fill = 'hsl(var(--primary))';
                } else {
                    cumulative += d.value;
                    end = cumulative;
                    fill = d.value >= 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))';
                }

                return {
                    name: d.name,
                    value: d.value,
                    start: Math.min(start, end),
                    end: Math.max(start, end),
                    bar: [Math.min(start, end), Math.max(start, end)],
                    fill: fill
                };
            });

            setWaterfallData(processedData as any);
        });
    }, [selectedMonth]);

    const handleMonthSelect = (monthIndex: number) => {
        setSelectedMonth(monthIndex);
    };
    
    const clearFilter = () => {
        setSelectedMonth(null);
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
                <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground shadow-sm">Production</Link>
                <Link href="/admin/inventory" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Inventory</Link>
                <Link href="/admin/oee" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">OEE</Link>
                <Link href="/admin/skill-matrix" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Skill Matrix</Link>
                <Link href="/admin/quality" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Quality</Link>
            </nav>
             <div className="ml-auto">
                 <Button size="sm" className="gap-1" disabled>
                    <Download className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Download CSV</span>
                 </Button>
            </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 md:grid-cols-[240px_1fr]">
             <aside className="py-4">
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
                {selectedMonth !== null && (
                   <CardHeader className="pt-0">
                      <Button variant="outline" size="sm" onClick={clearFilter}>
                        <X className="w-4 h-4 mr-2" />
                        Clear Filter
                      </Button>
                   </CardHeader>
                )}
              </Card>
            </aside>
            <div className="py-4">
                <Card className="bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">{selectedMonth !== null ? `${months[selectedMonth]} ` : ''}Production Waterfall Chart</CardTitle>
                        <CardDescription>Shows the flow from production target to actual output.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                             <RechartsBarChart 
                                data={waterfallData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                             >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine y={0} stroke="hsl(var(--border))" />
                                <Bar dataKey="bar" stackId="a">
                                    {waterfallData.map((entry, index) => (
                                        <Bar key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                                 <Bar dataKey="start" stackId="a" fill="transparent" />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}


export default function ProductionPage() {
  return <ProductionDashboard />;
}
