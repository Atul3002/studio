
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { BarChart, Download, X, Cog, Star, Trophy, AlertTriangle, TrendingDown, Clock, Truck, ShieldAlert, PackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubmissions } from "@/app/actions";
import { ChartTypeSwitcher } from "@/components/chart-type-switcher";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const change = payload[0].value - payload[1].value;
    const isTotal = payload[0].payload.name === 'Actual Output' || payload[0].payload.name === 'Production Target';

    return (
      <div className="p-2 bg-background/80 border border-border rounded-lg shadow-lg">
        <p className="label text-sm text-foreground font-semibold">{`${label}`}</p>
         {payload.map((pld: any, index: number) => (
             <p key={index} className="intro text-xs" style={{ color: pld.color || pld.fill }}>{`${pld.name}: ${pld.value.toLocaleString()}`}</p>
        ))}
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

const initialLineData = [
  { month: 'Jan', defectRate: 2.5, availability: 98, leadTime: 5 },
  { month: 'Feb', defectRate: 2.1, availability: 95, leadTime: 6 },
  { month: 'Mar', defectRate: 2.3, availability: 96, leadTime: 5.5 },
  { month: 'Apr', defectRate: 1.9, availability: 99, leadTime: 4.8 },
  { month: 'May', defectRate: 1.5, availability: 97, leadTime: 5.2 },
  { month: 'Jun', defectRate: 1.8, availability: 94, leadTime: 6.5 },
];

const initialSupplierDefectData = [
    { name: 'Supplier A', defectRate: 1.2, type: 'Material' },
    { name: 'Supplier B', defectRate: 0.8, type: 'Cosmetic' },
    { name: 'Supplier C', defectRate: 2.1, type: 'Functional' },
    { name: 'Supplier D', defectRate: 0.5, type: 'Packaging' },
];

const initialDeliveryTimeData = [
    { supplier: 'Supplier A', value: 5 },
    { supplier: 'Supplier B', value: 7 },
    { supplier: 'Supplier C', value: 4 },
    { supplier: 'Supplier D', value: 6 },
];

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function ProductionDashboard() {
    const [waterfallData, setWaterfallData] = useState<WaterfallData[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [totalJobs, setTotalJobs] = useState(0);
    const [performance, setPerformance] = useState(0);
    const [topMachine, setTopMachine] = useState({ type: 'N/A', count: 0 });
    const [topProblem, setTopProblem] = useState({ type: 'N/A', count: 0 });
    const [lineChartData, setLineChartData] = useState(initialLineData);
    const [supplierDefectData, setSupplierDefectData] = useState(initialSupplierDefectData);
    const [deliveryTimeData, setDeliveryTimeData] = useState(initialDeliveryTimeData);

    const [defectRateChartType, setDefectRateChartType] = useState<'line' | 'bar'>('line');
    const [availabilityChartType, setAvailabilityChartType] = useState<'line' | 'bar'>('line');
    const [leadTimeChartType, setLeadTimeChartType] = useState<'line' | 'bar'>('line');
    const [supplierDefectChartType, setSupplierDefectChartType] = useState<'bar' | 'pie'>('bar');
    const [deliveryTimeChartType, setDeliveryTimeChartType] = useState<'bar' | 'pie'>('bar');


    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

    useEffect(() => {
        getSubmissions().then(allData => {
            const filteredData = allData.filter(s => {
                const submissionDate = new Date(s.id);
                const monthMatch = selectedMonth !== null ? submissionDate.getMonth() === selectedMonth : true;
                const yearMatch = selectedYear !== null ? submissionDate.getFullYear() === selectedYear : true;
                return monthMatch && yearMatch;
            });
            
             if (selectedMonth !== null || selectedYear !== null) {
                // In a real app, you'd fetch and filter data. Here, we'll just randomize for visual effect.
                 setLineChartData(initialLineData.map(item => ({
                    ...item,
                    defectRate: parseFloat((Math.random() * 3).toFixed(1)),
                    availability: Math.floor(Math.random() * (99 - 90 + 1)) + 90,
                    leadTime: parseFloat((Math.random() * (7 - 4) + 4).toFixed(1))
                })));
                setSupplierDefectData(initialSupplierDefectData.map(item => ({...item, defectRate: parseFloat((Math.random() * 3).toFixed(1)) })));
                setDeliveryTimeData(initialDeliveryTimeData.map(item => ({...item, value: Math.floor(Math.random() * (8 - 3) + 3) })))
            } else {
                setLineChartData(initialLineData);
                setSupplierDefectData(initialSupplierDefectData);
                setDeliveryTimeData(initialDeliveryTimeData);
            }

            // Waterfall Chart Logic
            const productionSubmissions = filteredData.filter(s => s.entryType === 'productionData');
            
            let totalTarget = 0;
            let totalRejection = 0;
            
            productionSubmissions.forEach(s => {
                totalTarget += parseInt(s.dailyProductionTarget || 0, 10);
                totalRejection += parseInt(s.rejectionQuantity || 0, 10);
            });
            
            const goodParts = totalTarget - totalRejection;

            const waterfallChartData = [
                { name: 'Production Target', value: totalTarget },
                { name: 'Rejections', value: -totalRejection },
                { name: 'Actual Output', value: goodParts },
            ];

            let cumulative = 0;
            const processedData = waterfallChartData.map((d, index) => {
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

            // KPI Cards Logic
            const operatorSubmissions = filteredData.filter(s => s.operatorName);
            const jobsProduced = operatorSubmissions.filter(s => s.serialNumber).length;
            setTotalJobs(jobsProduced);

            // Performance Calculation
            const PLANNED_PRODUCTION_TIME = 8 * 60; // 8 hours in minutes
            const IDEAL_CYCLE_TIME = 5; // 5 minutes per job
            const downtime = operatorSubmissions.reduce((acc, curr) => {
              if (curr.problem && curr.problem !== 'Other' && curr.problem !== 'Operator not available') {
                 return acc + 30; // Assuming 30 mins downtime per problem
              }
              return acc;
            }, 0);
            const runTime = PLANNED_PRODUCTION_TIME - downtime;
            const calculatedPerformance = runTime > 0 ? ((jobsProduced * IDEAL_CYCLE_TIME) / runTime) * 100 : 0;
            setPerformance(parseFloat(calculatedPerformance.toFixed(2)) || 0);

            // Top Machine Calculation
            const machineSubmissions = filteredData.filter(s => s.machine && s.machine !== 'Unselected');
            const machineCounts = machineSubmissions.reduce((acc, curr) => {
                const machineType = curr.machine.split(' - ')[0];
                acc[machineType] = (acc[machineType] || 0) + 1;
                return acc;
            }, {} as {[key: string]: number});
            
            if (Object.keys(machineCounts).length > 0) {
                 const top = Object.entries(machineCounts).sort(([, a], [, b]) => b - a)[0];
                 setTopMachine({ type: top[0], count: top[1] });
            } else {
                 setTopMachine({ type: 'N/A', count: 0 });
            }
            
            // Top Problem Calculation
            const problemCounts = operatorSubmissions.reduce((acc, curr) => {
                if (curr.problem) {
                  acc[curr.problem] = (acc[curr.problem] || 0) + 1;
                }
                return acc;
            }, {} as {[key: string]: number});
            
            if (Object.keys(problemCounts).length > 0) {
                 const top = Object.entries(problemCounts).sort(([, a], [, b]) => b - a)[0];
                 setTopProblem({ type: top[0], count: top[1] });
            } else {
                 setTopProblem({ type: 'N/A', count: 0 });
            }
        });
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
                <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground shadow-sm">Production</Link>
                <Link href="/admin/machine" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Machine</Link>
                <Link href="/admin/inventory" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Inventory</Link>
                <Link href="/admin/oee" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">OEE</Link>
                <Link href="/admin/skill-matrix" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Skill Matrix</Link>
                <Link href="/admin/supplier" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Supplier</Link>
            </nav>
             <div className="ml-auto">
                 <Button size="sm" className="gap-1" disabled>
                    <Download className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Download CSV</span>
                 </Button>
            </div>
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
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Cog /> TOTAL JOBS</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-3xl font-bold">{totalJobs}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Star /> PERFORMANCE</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-3xl font-bold">{performance}%</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Trophy />TOP MACHINE</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-bold">{topMachine.type}</p>
                            <p className="text-xs text-muted-foreground">{topMachine.count} submissions</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-card/80">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><AlertTriangle />TOP PROBLEM</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-xl font-bold">{topProblem.type}</p>
                            <p className="text-xs text-muted-foreground">{topProblem.count} reports</p>
                        </CardContent>
                    </Card>
                </div>
                <Card className="bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">{selectedYear ? `${selectedYear} ` : ''}{selectedMonth !== null ? `${months[selectedMonth]} ` : ''}Production Waterfall Chart</CardTitle>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-base"><TrendingDown /> Defect Rate</CardTitle>
                             </div>
                             <ChartTypeSwitcher currentType={defectRateChartType} onTypeChange={setDefectRateChartType} availableTypes={['line', 'bar']} />
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                {defectRateChartType === 'line' ? (
                                    <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line type="monotone" dataKey="defectRate" name="Defect Rate (%)" stroke="hsl(var(--destructive))" />
                                    </LineChart>
                                ) : (
                                    <RechartsBarChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="defectRate" name="Defect Rate (%)" fill="hsl(var(--destructive))" />
                                    </RechartsBarChart>
                                )}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-base"><Star /> Availability</CardTitle>
                            </div>
                            <ChartTypeSwitcher currentType={availabilityChartType} onTypeChange={setAvailabilityChartType} availableTypes={['line', 'bar']} />
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                {availabilityChartType === 'line' ? (
                                    <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line type="monotone" dataKey="availability" name="Availability (%)" stroke="hsl(var(--chart-2))" />
                                    </LineChart>
                                ) : (
                                    <RechartsBarChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="availability" name="Availability (%)" fill="hsl(var(--chart-2))" />
                                    </RechartsBarChart>
                                )}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card>
                         <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-base"><Clock /> Lead Time</CardTitle>
                            </div>
                            <ChartTypeSwitcher currentType={leadTimeChartType} onTypeChange={setLeadTimeChartType} availableTypes={['line', 'bar']} />
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                               {leadTimeChartType === 'line' ? (
                                <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="leadTime" name="Lead Time (Days)" stroke="hsl(var(--chart-4))" />
                                </LineChart>
                               ) : (
                                <RechartsBarChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="leadTime" name="Lead Time (Days)" fill="hsl(var(--chart-4))" />
                                </RechartsBarChart>
                               )}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-base"><ShieldAlert /> Supplier Defect Analysis</CardTitle>
                            </div>
                            <ChartTypeSwitcher currentType={supplierDefectChartType} onTypeChange={setSupplierDefectChartType} availableTypes={['bar', 'pie']} />
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                {supplierDefectChartType === 'bar' ? (
                                    <RechartsBarChart data={supplierDefectData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="defectRate" name="Defect Rate (%)" fill="hsl(var(--destructive))" />
                                    </RechartsBarChart>
                                ) : (
                                    <PieChart>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Pie data={supplierDefectData} dataKey="defectRate" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                             {supplierDefectData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                )}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-base"><Truck /> Delivery Time Analysis</CardTitle>
                            </div>
                            <ChartTypeSwitcher currentType={deliveryTimeChartType} onTypeChange={setDeliveryTimeChartType} availableTypes={['bar', 'pie']} />
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                {deliveryTimeChartType === 'bar' ? (
                                    <RechartsBarChart layout="vertical" data={deliveryTimeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis dataKey="supplier" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="value" name="Delivery Time (Days)" fill="hsl(var(--chart-5))" />
                                    </RechartsBarChart>
                                ) : (
                                    <PieChart>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Pie data={deliveryTimeData} dataKey="value" nameKey="supplier" cx="50%" cy="50%" outerRadius={80} label>
                                             {deliveryTimeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                )}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    </div>
  );
}


export default function ProductionPage() {
  return <ProductionDashboard />;
}

    

    
