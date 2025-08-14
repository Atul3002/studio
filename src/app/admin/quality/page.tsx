
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart, Shield, X, TrendingDown, TrendingUp, Trash2, AlertCircle, Clock, Timer, Layers } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, BarChart as RechartsBarChart, LabelList } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/login-form";

const initialDefectRateData = [
    { month: 'Jan', "Defect Rate (%)": 2.5 },
    { month: 'Feb', "Defect Rate (%)": 2.1 },
    { month: 'Mar', "Defect Rate (%)": 2.3 },
    { month: 'Apr', "Defect Rate (%)": 1.9 },
    { month: 'May', "Defect Rate (%)": 1.5 },
    { month: 'Jun', "Defect Rate (%)": 1.8 },
    { month: 'Jul', "Defect Rate (%)": 2.0 },
    { month: 'Aug', "Defect Rate (%)": 2.2 },
    { month: 'Sep', "Defect Rate (%)": 1.7 },
    { month: 'Oct', "Defect Rate (%)": 1.6 },
    { month: 'Nov', "Defect Rate (%)": 1.9 },
    { month: 'Dec', "Defect Rate (%)": 2.4 },
];

const initialCountData = [
    { month: 'Jan', defects: 20, scrap: 5, rework: 10 },
    { month: 'Feb', defects: 18, scrap: 4, rework: 8 },
    { month: 'Mar', defects: 22, scrap: 6, rework: 12 },
    { month: 'Apr', defects: 15, scrap: 3, rework: 7 },
    { month: 'May', defects: 12, scrap: 2, rework: 5 },
    { month: 'Jun', defects: 16, scrap: 4, rework: 9 },
];

function QualityDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2023, 2024, 2025];

  // Placeholder data for KPIs
  const [defectRate, setDefectRate] = useState(2.5);
  const [firstPassYield, setFirstPassYield] = useState(97.5);
  const [scrapRate, setScrapRate] = useState(1.2);
  const [totalDefects, setTotalDefects] = useState(125);
  const [totalDowntime, setTotalDowntime] = useState(8);
  const [downtimeMinutes, setDowntimeMinutes] = useState(240);
  const [defectRateData, setDefectRateData] = useState(initialDefectRateData);
  const [countData, setCountData] = useState(initialCountData);


  useEffect(() => {
    if (selectedMonth !== null || selectedYear !== null) {
      // In a real app, you'd fetch and filter data. Here, we'll just randomize for visual effect.
      setDefectRate(+(Math.random() * 5).toFixed(1));
      setFirstPassYield(+(95 + Math.random() * 5).toFixed(1));
      setScrapRate(+(Math.random() * 2).toFixed(1));
      setTotalDefects(Math.floor(Math.random() * 200));
      setTotalDowntime(Math.floor(Math.random() * 10));
      setDowntimeMinutes(Math.floor(Math.random() * 300));
      setDefectRateData(initialDefectRateData.map(d => ({ ...d, "Defect Rate (%)": +(Math.random() * 5).toFixed(1) })))
      setCountData(initialCountData.map(d => ({ ...d, defects: Math.floor(Math.random() * 30), scrap: Math.floor(Math.random() * 10), rework: Math.floor(Math.random() * 15) })))
    } else {
      setDefectRate(2.5);
      setFirstPassYield(97.5);
      setScrapRate(1.2);
      setTotalDefects(125);
      setTotalDowntime(8);
      setDowntimeMinutes(240);
      setDefectRateData(initialDefectRateData);
      setCountData(initialCountData);
    }
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
            <Link href="/admin/quality" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground shadow-sm">Quality</Link>
            <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Production</Link>
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
        <div className="py-4 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield /> {selectedYear ? `${selectedYear} ` : ''}{selectedMonth !== null ? `${months[selectedMonth]} ` : ''}Quality KPIs</CardTitle>
                    <CardDescription>Overview of key quality metrics.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="bg-card/80">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><TrendingDown /> DEFECT RATE</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between">
                                <p className="text-3xl font-bold">{defectRate}%</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-card/80">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><TrendingUp /> FIRST PASS YIELD</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between">
                                <p className="text-3xl font-bold">{firstPassYield}%</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-card/80">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Trash2 /> SCRAP RATE</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between">
                               <p className="text-3xl font-bold">{scrapRate}%</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/80">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><AlertCircle /> TOTAL DEFECTS</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between">
                                <p className="text-3xl font-bold">{totalDefects}</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-card/80">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Clock /> TOTAL DOWNTIME</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between">
                               <p className="text-3xl font-bold">{totalDowntime} <span className="text-lg text-muted-foreground">incidents</span></p>
                            </CardContent>
                        </Card>
                         <Card className="bg-card/80">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Timer /> DOWNTIME MINUTES</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between">
                                <p className="text-3xl font-bold">{downtimeMinutes}</p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingDown /> Defect Rate Over Time</CardTitle>
                        <CardDescription>Monthly trend of the defect rate percentage.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={defectRateData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))"/>
                                <YAxis stroke="hsl(var(--muted-foreground))"/>
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Defect Rate (%)" stroke="hsl(var(--destructive))" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Layers /> Defect & Rework Analysis</CardTitle>
                        <CardDescription>Breakdown of defect, scrap, and rework counts.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={countData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="defects" stackId="a" fill="hsl(0 84.2% 60.2%)" name="Defect Count">
                                    <LabelList dataKey="defects" position="center" className="fill-white"/>
                                </Bar>
                                <Bar dataKey="scrap" stackId="a" fill="hsl(43 74% 66%)" name="Scrap Count">
                                    <LabelList dataKey="scrap" position="center" className="fill-black"/>
                                </Bar>
                                <Bar dataKey="rework" stackId="a" fill="hsl(340 75% 55%)" name="Rework Count">
                                    <LabelList dataKey="rework" position="center" className="fill-white"/>
                                </Bar>
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}

export default function QualityPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const loggedIn = sessionStorage.getItem("admin-authenticated");
        if (loggedIn) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
        sessionStorage.setItem("admin-authenticated", "true");
    };

    if (!isAuthenticated) {
        return (
            <LoginForm
                role="Admin"
                correctPassword="admin123"
                onLoginSuccess={handleLogin}
            />
        );
    }
    return <QualityDashboard />
}

    