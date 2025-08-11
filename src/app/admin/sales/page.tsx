
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { Bar, BarChart as RechartsBarChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell, Line, LineChart as RechartsLineChart, Area, AreaChart as RechartsAreaChart, Treemap } from "recharts";
import { Download, BarChart, PieChart, TrendingUp, Zap, ShieldCheck, Star, Trophy, AlertTriangle, ShoppingCart, User, Cog, X } from "lucide-react";

import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { getSubmissions } from "@/app/actions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];
const TREEMAP_COLORS = ["#8889DD", "#9597E4", "#8DC77B", "#A5D297", "#E2CF45", "#F8C12D"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 border border-border rounded-lg shadow-lg">
        <p className="label text-sm text-foreground">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
            <p key={index} className="intro text-xs" style={{ color: pld.color }}>{`${pld.name}: ${pld.value}`}</p>
        ))}
      </div>
    );
  }

  return null;
};

function SalesDashboard() {
    const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);
    const [machineChartData, setMachineChartData] = useState<any[]>([]);
    const [operatorProblemData, setOperatorProblemData] = useState<any[]>([]);
    const [productionChartData, setProductionChartData] = useState<any[]>([]);
    const [dailySubmissionsData, setDailySubmissionsData] = useState<any[]>([]);
    const [oeeData, setOeeData] = useState({ oee: 0, availability: 0, performance: 0, quality: 0 });
    const [totalJobsProduced, setTotalJobsProduced] = useState(0);

    const [topMachine, setTopMachine] = useState({ type: 'N/A', count: 0 });
    const [topProblem, setTopProblem] = useState({ type: 'N/A', count: 0 });
    
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        getSubmissions().then(data => {
            setAllSubmissions(data);
            setFilteredSubmissions(data);
        });
    }, [])

    useEffect(() => {
        const dataToProcess = selectedMonth !== null
            ? allSubmissions.filter(s => new Date(s.id).getMonth() === selectedMonth)
            : allSubmissions;

        setFilteredSubmissions(dataToProcess);

        const machineSubmissions = dataToProcess.filter(s => s.machine && s.tonnage !== undefined);
        
        const machineCounts = machineSubmissions.reduce((acc, curr) => {
            const machineType = curr.machine.split(' - ')[0];
            acc[machineType] = (acc[machineType] || 0) + 1;
            return acc;
        }, {} as {[key: string]: number});
        
        setMachineChartData(Object.keys(machineCounts).map(key => ({ name: key, size: machineCounts[key] })));

        if (Object.keys(machineCounts).length > 0) {
             const top = Object.entries(machineCounts).sort(([, a], [, b]) => b - a)[0];
             setTopMachine({ type: top[0], count: top[1] });
        } else {
             setTopMachine({ type: 'N/A', count: 0 });
        }

        const operatorSubmissions = dataToProcess.filter(s => s.operatorName);
        const problemCounts = operatorSubmissions.reduce((acc, curr) => {
            if (curr.problem) {
              acc[curr.problem] = (acc[curr.problem] || 0) + 1;
            }
            return acc;
        }, {} as {[key: string]: number});
        
        setOperatorProblemData(Object.keys(problemCounts).map(key => ({ name: key, value: problemCounts[key] })));
        
         if (Object.keys(problemCounts).length > 0) {
             const top = Object.entries(problemCounts).sort(([, a], [, b]) => b - a)[0];
             setTopProblem({ type: top[0], count: top[1] });
        } else {
             setTopProblem({ type: 'N/A', count: 0 });
        }

        const productionData: { [key: number]: number } = {};
        let totalProduced = 0;
        dataToProcess.forEach(s => {
            if (s.serialNumber) {
                const month = new Date(s.id).getMonth(); // Assuming all data is for one year.
                productionData[month] = (productionData[month] || 0) + 1;
                totalProduced++;
            }
        });
        setTotalJobsProduced(totalProduced);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const productionChartDataFormatted = monthNames.map((monthName, i) => ({
            month: monthName,
            produced: productionData[i] || 0
        }));
        setProductionChartData(productionChartDataFormatted);

        const dailyCounts: { [key: number]: number } = {};
        dataToProcess.forEach(s => {
            const day = new Date(s.id).getDate();
            dailyCounts[day] = (dailyCounts[day] || 0) + 1;
        });
        const dailyDataFormatted = Array.from({ length: 31 }, (_, i) => ({
            day: i + 1,
            submissions: dailyCounts[i + 1] || 0
        }));
        setDailySubmissionsData(dailyDataFormatted);

        // OEE Calculation
        const PLANNED_PRODUCTION_TIME = 8 * 60; // 8 hours in minutes
        const IDEAL_CYCLE_TIME = 5; // 5 minutes per job
        
        const downtime = operatorSubmissions.reduce((acc, curr) => {
          if (curr.problem && curr.problem !== 'Other' && curr.problem !== 'Operator not available') {
             return acc + 30; // Assuming 30 mins downtime per problem
          }
          return acc;
        }, 0);

        const runTime = PLANNED_PRODUCTION_TIME - downtime;
        const availability = runTime > 0 ? (runTime / PLANNED_PRODUCTION_TIME) * 100 : 0;
        
        const jobsProduced = operatorSubmissions.filter(s => s.serialNumber).length;
        const performance = runTime > 0 ? ((jobsProduced * IDEAL_CYCLE_TIME) / runTime) * 100 : 0;

        const goodJobs = operatorSubmissions.filter(s => s.dimensionMeasureStatus === 'ok' && s.toolWearStatus === 'ok').length;
        const quality = jobsProduced > 0 ? (goodJobs / jobsProduced) * 100 : 0;
        
        const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;

        setOeeData({
            oee: parseFloat(oee.toFixed(2)) || 0,
            availability: parseFloat(availability.toFixed(2)) || 0,
            performance: parseFloat(performance.toFixed(2)) || 0,
            quality: parseFloat(quality.toFixed(2)) || 0,
        });
    }, [allSubmissions, selectedMonth]);

    const downloadCSV = () => {
        const allKeys = filteredSubmissions.reduce((acc, curr) => {
            Object.keys(curr).forEach(key => acc.add(key));
            return acc;
        }, new Set<string>());

        const csv = Papa.unparse({
            fields: Array.from(allKeys),
            data: filteredSubmissions
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "submissions.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
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
                <Link href="/admin/sales" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground shadow-sm">Sales</Link>
                <Link href="/admin/quality" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Quality</Link>
                <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Production</Link>
                <Link href="/admin/inventory" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Inventory</Link>
                <Link href="/admin/oee" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">OEE</Link>
                <Link href="/admin/skill-matrix" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Skill Matrix</Link>
            </nav>
             <div className="ml-auto">
                 <Button size="sm" className="gap-1" onClick={downloadCSV} disabled={filteredSubmissions.length === 0}>
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
            <div className="py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-primary">TOTAL JOBS</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-3xl font-bold">{totalJobsProduced}</p>
                            <User className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-primary">OEE</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-3xl font-bold">{oeeData.oee}%</p>
                            <TrendingUp className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-primary">PERFORMANCE</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-3xl font-bold">{oeeData.performance}%</p>
                            <Star className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>
                     <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-primary">QUALITY</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-3xl font-bold">{oeeData.quality}%</p>
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card className="lg:col-span-2 bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">{selectedMonth !== null ? `${months[selectedMonth]} ` : ''}MONTHLY PRODUCTION</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={productionChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.1)'}} />
                                    <Bar dataKey="produced" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <div className="space-y-4">
                         <Card className="bg-card/80">
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Trophy />TOP MACHINE</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-lg font-bold">{topMachine.type}</p>
                                <p className="text-sm text-muted-foreground">{topMachine.count} submissions</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-card/80">
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><AlertTriangle />TOP PROBLEM</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                 <p className="text-lg font-bold">{topProblem.type}</p>
                                <p className="text-sm text-muted-foreground">{topProblem.count} reports</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">REPORTED PROBLEMS</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie data={operatorProblemData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                        {operatorProblemData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-2 bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">MACHINE SUBMISSIONS</CardTitle>
                        </CardHeader>
                         <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                               <Treemap
                                  data={machineChartData}
                                  dataKey="size"
                                  ratio={4 / 3}
                                  stroke="hsl(var(--background))"
                                  fill="hsl(var(--card))"
                                  content={
                                    <CustomizedContent colors={TREEMAP_COLORS} />
                                  }
                                >
                                </Treemap>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                <Card className="bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">DAILY SUBMISSIONS</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsAreaChart data={dailySubmissionsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                 <defs>
                                    <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="submissions" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSubmissions)" />
                            </RechartsAreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}

const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, rank, name } = props;
  const color = props.colors[Math.floor(Math.random() * props.colors.length)];

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? color : "none",
          stroke: "#fff",
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10)
        }}
      />
      {depth === 1 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
        >
          {name}
        </text>
      ) : null}
    </g>
  );
};


export default function SalesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // In a real app, you'd have better auth state management
  useEffect(() => {
    const loggedIn = sessionStorage.getItem("admin-authenticated");
    if (loggedIn) {
      setIsAuthenticated(true);
    }
  }, []);
  
  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem("admin-authenticated", "true");
  }

  if (!isAuthenticated) {
    return (
      <LoginForm
        role="Admin"
        correctPassword="admin123"
        onLoginSuccess={handleLogin}
      />
    );
  }

  return <SalesDashboard />;
}
