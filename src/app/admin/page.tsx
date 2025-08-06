
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle, MoreHorizontal, Download, BarChart, PieChart, TrendingUp, Zap, ShieldCheck, Star } from "lucide-react";
import Papa from "papaparse";
import { Bar, BarChart as RechartsBarChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts";

import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getSubmissions } from "@/app/actions";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

const productionChartConfig = {
  produced: {
    label: "Jobs Produced",
    color: "hsl(var(--primary))",
  },
};

const oeeChartConfig = {
  value: {
    label: "Value",
  },
}


function AdminDashboard() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [machineChartData, setMachineChartData] = useState<any[]>([]);
    const [operatorProblemData, setOperatorProblemData] = useState<any[]>([]);
    const [productionChartData, setProductionChartData] = useState<any[]>([]);
    const [oeeData, setOeeData] = useState({ oee: 0, availability: 0, performance: 0, quality: 0 });


    useEffect(() => {
        getSubmissions().then(data => {
            setSubmissions(data);

            const machineSubmissions = data.filter(s => s.tonnage !== undefined);
            const machineCountsByDay: { [key: number]: { [key: string]: number } } = {};
            
            machineSubmissions.forEach(s => {
                const day = new Date(s.id).getDate();
                const machineType = s.machine.split(' - ')[0];
                if (!machineCountsByDay[day]) {
                    machineCountsByDay[day] = {};
                }
                machineCountsByDay[day][machineType] = (machineCountsByDay[day][machineType] || 0) + 1;
            });

            const machineChartDataFormatted: any[] = [];
            for (let i = 1; i <= 31; i++) {
                const dayData: any = { day: i };
                if (machineCountsByDay[i]) {
                    Object.assign(dayData, machineCountsByDay[i]);
                }
                machineChartDataFormatted.push(dayData);
            }
            setMachineChartData(machineChartDataFormatted);
            
            const operatorSubmissions = data.filter(s => s.operatorName);
            const problemCounts = operatorSubmissions.reduce((acc, curr) => {
                if (curr.problem) {
                  acc[curr.problem] = (acc[curr.problem] || 0) + 1;
                }
                return acc;
            }, {} as {[key: string]: number});
            setOperatorProblemData(Object.keys(problemCounts).map(key => ({ name: key, value: problemCounts[key] })));

            const productionData: { [key: number]: number } = {};
            data.forEach(s => {
                if (s.serialNumber) { // Assuming operator entry with serialNumber is a produced breaker
                    const day = new Date(s.id).getDate();
                    productionData[day] = (productionData[day] || 0) + 1;
                }
            });

            const productionChartDataFormatted = [];
            for (let i = 1; i <= 31; i++) {
                productionChartDataFormatted.push({ day: i, produced: productionData[i] || 0 });
            }
            setProductionChartData(productionChartDataFormatted);

            // OEE Calculation
            const PLANNED_PRODUCTION_TIME = 8 * 60; // 8 hours in minutes
            const IDEAL_CYCLE_TIME = 5; // 5 minutes per job
            
            const downtime = operatorSubmissions.reduce((acc, curr) => {
              if (curr.problem && curr.problem !== 'Other' && curr.problem !== 'Operator not available') {
                 // Assuming each problem causes 30 mins downtime for simplicity
                 return acc + 30;
              }
              return acc;
            }, 0);

            const runTime = PLANNED_PRODUCTION_TIME - downtime;
            const availability = runTime > 0 ? (runTime / PLANNED_PRODUCTION_TIME) * 100 : 0;
            
            const totalJobsProduced = operatorSubmissions.filter(s => s.serialNumber).length;
            const performance = runTime > 0 ? ((totalJobsProduced * IDEAL_CYCLE_TIME) / runTime) * 100 : 0;

            const goodJobs = operatorSubmissions.filter(s => s.dimensionMeasureStatus === 'ok' && s.toolWearStatus === 'ok').length;
            const quality = totalJobsProduced > 0 ? (goodJobs / totalJobsProduced) * 100 : 0;
            
            const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;

            setOeeData({
                oee: parseFloat(oee.toFixed(2)),
                availability: parseFloat(availability.toFixed(2)),
                performance: parseFloat(performance.toFixed(2)),
                quality: parseFloat(quality.toFixed(2)),
            });

        });
    }, [])

    const downloadCSV = () => {
        const dataForCSV = submissions.map(s => {
            const date = new Date(s.id);
            const baseData = {
                Date: s.date || date.toLocaleDateString(),
                Time: date.toLocaleTimeString(),
            };

            const emptyFields = {
                'Entry Type': '',
                Machine: '', 'Machine Number': '', 'Machine Power (kW) / Consumption': '', 'Tonnage': '',
                'Machine Capacity': '', 'Setting Time (Min)': '', 'Speed of Machine': '', 'Strokes Per Min': '',
                'Hydraulic Pressure (kg/cm²)': '', 'Number of Cavities': '', 'Air Pressure (kg/cm²)': '',
                'Temperature (°C)': '', 'Preheating Time (min)': '', 'Curing/Holding Time (min)': '',
                'Number of heaters': '', 'Zone 1 Temp': '', 'Zone 2 Temp': '', 'Zone 3 Temp': '', 'Zone 4 Temp': '',
                'Zone 5 Temp': '', 'Zone 6 Temp': '', 'Filling Pressure (kg/cm²)': '', 'Top core Pressure': '',
                'Bottom core pressure': '', 'Nozzle Pressure': '', 'Number of axis': '', 'Machine RPM': '',
                'Coolant Availability': '', 'Machine Tool Condition': '',
                Operator: '', Product: '', Station: '', 'Serial #': '',
                'Machine Speed': '', 'Machine Feed': '', 'Vibration Level': '',
                'Coolant Status': '', 'Tool Wear Status': '', 'Tool Wear Reason': '',
                'Dimension Measure Status': '', 'Dimension Measure Reason': '',
                Problem: '', 'Other Problem Reason': '',
                'Raw Material Type': '', 'Raw Material Thickness': '',
                'Raw Material Opening Stock': '', 'Raw Material Closing Stock': '',
                'In-Process Opening Stock': '', 'In-Process Closing Stock': '',
                'Finished Goods Opening Stock': '', 'Finished Goods Closing Stock': '',
            };

            if (s.entryType === 'storeData') { // This is a store entry
                return {
                    ...emptyFields,
                    ...baseData,
                    'Entry Type': 'Store Data',
                    'Raw Material Type': s.rawMaterialType,
                    'Raw Material Thickness': s.rawMaterialThickness,
                    'Raw Material Opening Stock': s.rawMaterialOpening,
                    'Raw Material Closing Stock': s.rawMaterialClosing,
                    'In-Process Opening Stock': s.inProcessOpening,
                    'In-Process Closing Stock': s.inProcessClosing,
                    'Finished Goods Opening Stock': s.finishGoodsOpening,
                    'Finished Goods Closing Stock': s.finishGoodsClosing,
                };
            } else if (s.tonnage !== undefined) { // This is a machine entry
                return {
                    ...emptyFields,
                    ...baseData,
                    'Entry Type': 'Machine Data',
                    Machine: s.machine,
                    'Machine Number': s.machineNumber,
                    'Machine Power (kW) / Consumption': s.machinePower,
                    'Tonnage': s.tonnage,
                    'Machine Capacity': s.machineCapacity,
                    'Setting Time (Min)': s.settingTime,
                    'Speed of Machine': s.machineSpeed,
                    'Strokes Per Min': s.strokesPerMin,
                    'Hydraulic Pressure (kg/cm²)': s.hydraulicPressure,
                    'Number of Cavities': s.cavityCount,
                    'Air Pressure (kg/cm²)': s.airPressure,
                    'Temperature (°C)': s.temperature,
                    'Preheating Time (min)': s.preheatingTime,
                    'Curing/Holding Time (min)': s.curingTime,
                    'Number of heaters': s.heaterCount,
                    'Zone 1 Temp': s.zone1Temp,
                    'Zone 2 Temp': s.zone2Temp,
                    'Zone 3 Temp': s.zone3Temp,
                    'Zone 4 Temp': s.zone4Temp,
                    'Zone 5 Temp': s.zone5Temp,
                    'Zone 6 Temp': s.zone6Temp,
                    'Filling Pressure (kg/cm²)': s.fillingPressure,
                    'Top core Pressure': s.topCorePressure,
                    'Bottom core pressure': s.bottomCorePressure,
                    'Nozzle Pressure': s.nozzlePressure,
                    'Number of axis': s.numberOfAxis,
                    'Machine RPM': s.machineRPM,
                    'Coolant Availability': s.coolantAvailability,
                    'Machine Tool Condition': s.machineToolCondition,
                };
            } else { // This is an operator entry
                return {
                    ...emptyFields,
                    ...baseData,
                    'Entry Type': 'Operator Data',
                    Machine: s.machine,
                    Operator: s.operatorName,
                    Product: s.productType,
                    Station: s.station,
                    'Serial #': s.serialNumber,
                    'Machine Speed': s.machineSpeed,
                    'Machine Feed': s.machineFeed,
                    'Vibration Level': s.vibrationLevel,
                    'Coolant Status': s.coolantStatus,
                    'Tool Wear Status': s.toolWearStatus,
                    'Tool Wear Reason': s.toolWearStatus === 'not-ok' ? s.toolWearReason : '',
                    'Dimension Measure Status': s.dimensionMeasureStatus,
                    'Dimension Measure Reason': s.dimensionMeasureStatus === 'not-ok' ? s.dimensionMeasureReason : '',
                    Problem: s.problem,
                    'Other Problem Reason': s.problem === 'Other' ? s.otherProblemReason : '',
                }
            }
        });

        const csv = Papa.unparse(dataForCSV);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'submissions.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const machineTypes = [...new Set(submissions.filter(s => s.tonnage !== undefined).map(s => s.machine.split(' - ')[0]))];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="font-headline text-2xl font-semibold">Admin Dashboard</h1>
           <div className="ml-auto">
             <Button size="sm" className="gap-1" onClick={downloadCSV} disabled={submissions.length === 0}>
                <Download className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Download CSV</span>
             </Button>
           </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2 text-2xl"><TrendingUp /> OEE</CardTitle>
                        <CardDescription>Overall Equipment Effectiveness</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={oeeChartConfig} className="min-h-[200px] w-full">
                            <RechartsPieChart>
                                <Pie data={[{name: 'OEE', value: oeeData.oee, fill: 'hsl(var(--primary))'}, {name: 'Remaining', value: 100 - oeeData.oee, fill: 'hsl(var(--muted))'}]} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} startAngle={90} endAngle={450}>
                                </Pie>
                                <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-3xl font-bold">
                                    {oeeData.oee}%
                                </text>
                            </RechartsPieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2 text-2xl"><Zap /> Availability</CardTitle>
                        <CardDescription>Percentage of time the machine is operational.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ChartContainer config={oeeChartConfig} className="min-h-[200px] w-full">
                            <RechartsPieChart>
                                <Pie data={[{name: 'Availability', value: oeeData.availability, fill: 'hsl(var(--primary))'}, {name: 'Remaining', value: 100 - oeeData.availability, fill: 'hsl(var(--muted))'}]} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} startAngle={90} endAngle={450}>
                                </Pie>
                                <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                 <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-3xl font-bold">
                                    {oeeData.availability}%
                                </text>
                            </RechartsPieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2 text-2xl"><Star /> Performance</CardTitle>
                        <CardDescription>Speed as a percentage of its designed speed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={oeeChartConfig} className="min-h-[200px] w-full">
                            <RechartsPieChart>
                                <Pie data={[{name: 'Performance', value: oeeData.performance, fill: 'hsl(var(--primary))'}, {name: 'Remaining', value: 100 - oeeData.performance, fill: 'hsl(var(--muted))'}]} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} startAngle={90} endAngle={450}>
                                </Pie>
                                <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                 <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-3xl font-bold">
                                    {oeeData.performance}%
                                </text>
                            </RechartsPieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2 text-2xl"><ShieldCheck /> Quality</CardTitle>
                        <CardDescription>Percentage of good parts produced.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={oeeChartConfig} className="min-h-[200px] w-full">
                            <RechartsPieChart>
                                <Pie data={[{name: 'Quality', value: oeeData.quality, fill: 'hsl(var(--primary))'}, {name: 'Remaining', value: 100 - oeeData.quality, fill: 'hsl(var(--muted))'}]} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} startAngle={90} endAngle={450}>
                                </Pie>
                                <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-3xl font-bold">
                                    {oeeData.quality}%
                                </text>
                            </RechartsPieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2 text-2xl"><BarChart className="animate-rotate-slow" />Machine Submissions</CardTitle>
                        <CardDescription>Count of each machine type submitted per day.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsBarChart data={machineChartData}>
                                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}/>
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                    {machineTypes.map((type, index) => (
                                        <Bar key={type} dataKey={type} stackId="a" fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
                                    ))}
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <CardTitle className="font-headline flex items-center gap-2 text-2xl"><PieChart className="animate-rotate-slow" />Operator Reported Problems</CardTitle>
                        <CardDescription>Distribution of problems reported by operators.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="min-h-[300px] w-full">
                             <ResponsiveContainer width="100%" height={300}>
                                <RechartsPieChart>
                                    <Pie
                                        data={operatorProblemData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={(props) => `${props.name} (${props.value})`}
                                    >
                                        {operatorProblemData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Daily Production Report</CardTitle>
                        <CardDescription>Total Jobs produced over the month.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={productionChartConfig} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsBarChart data={productionChartData}>
                                    <XAxis
                                        dataKey="day"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
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
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            
           
        </main>
      </div>
    </div>
  );
}


export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <LoginForm
        role="Admin"
        correctPassword="admin123"
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return <AdminDashboard />;
}
