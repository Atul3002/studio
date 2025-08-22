
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, BarChart, LineChart, PieChart } from "lucide-react";
import { ResponsiveContainer, Bar, BarChart as RechartsBarChart, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, XAxis, YAxis, Tooltip, Legend } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getSubmissions } from "@/app/actions";

interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie';
  title: string;
}

const availableCharts = [
  { type: 'bar' as const, name: 'Bar Chart', icon: BarChart },
  { type: 'line' as const, name: 'Line Chart', icon: LineChart },
  { type: 'pie' as const, name: 'Pie Chart', icon: PieChart },
];

const sampleData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 700 },
];

function ChartRenderer({ type }: { type: 'bar' | 'line' | 'pie' }) {
    if (type === 'bar') {
        return (
            <RechartsBarChart data={sampleData}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
            </RechartsBarChart>
        )
    }
    if (type === 'line') {
        return (
            <RechartsLineChart data={sampleData}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" />
            </RechartsLineChart>
        )
    }
    if (type === 'pie') {
        return (
            <RechartsPieChart>
                <Tooltip />
                <Pie data={sampleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="hsl(var(--primary))" label />
            </RechartsPieChart>
        )
    }
    return null;
}

function ReportsPage() {
  const [dashboardCharts, setDashboardCharts] = useState<ChartConfig[]>([]);

  useEffect(() => {
    const savedCharts = localStorage.getItem("customDashboard");
    if (savedCharts) {
      setDashboardCharts(JSON.parse(savedCharts));
    }
  }, []);

  const handleAddChart = (type: 'bar' | 'line' | 'pie', name: string) => {
    const newChart: ChartConfig = {
      id: Date.now().toString(),
      type,
      title: `${name} - ${dashboardCharts.length + 1}`
    };
    const newCharts = [...dashboardCharts, newChart];
    setDashboardCharts(newCharts);
    localStorage.setItem("customDashboard", JSON.stringify(newCharts));
  };
  
  const handleDeleteChart = (id: string) => {
    const newCharts = dashboardCharts.filter(c => c.id !== id);
    setDashboardCharts(newCharts);
    localStorage.setItem("customDashboard", JSON.stringify(newCharts));
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2 pl-20">
          <LineChart className="h-6 w-6" />
          <h1 className="text-xl font-semibold">CUSTOM REPORTS</h1>
        </div>
      </header>
       <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 md:grid-cols-[280px_1fr]">
        <aside className="py-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Component Library</CardTitle>
                    <CardDescription>Add charts to your dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {availableCharts.map(chart => {
                        const Icon = chart.icon;
                        return (
                             <Card key={chart.type} className="flex items-center justify-between p-3 bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <Icon className="h-6 w-6 text-primary"/>
                                    <span className="font-medium">{chart.name}</span>
                                </div>
                                <Button size="sm" onClick={() => handleAddChart(chart.type, chart.name)}>
                                    <Plus className="mr-2 h-4 w-4"/> Add
                                </Button>
                            </Card>
                        )
                    })}
                </CardContent>
            </Card>
        </aside>
        <div className="py-4 space-y-8">
            {dashboardCharts.length === 0 ? (
                 <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-24">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">Your dashboard is empty</h3>
                        <p className="text-sm text-muted-foreground">Add charts from the component library to get started.</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2">
                    {dashboardCharts.map(chart => (
                         <Card key={chart.id}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>{chart.title}</CardTitle>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteChart(chart.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                   <ChartRenderer type={chart.type} />
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default ReportsPage;
