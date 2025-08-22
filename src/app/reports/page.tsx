
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, BarChart, LineChart, PieChart as PieChartIcon, Save } from "lucide-react";
import { ResponsiveContainer, Bar, BarChart as RechartsBarChart, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSubmissions } from "@/app/actions";

interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie';
  title: string;
  categoryKey: string;
  valueKey: string;
}

interface ChartData {
    name: string;
    value: number;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const availableCharts = [
  { type: 'bar' as const, name: 'Bar Chart', icon: BarChart },
  { type: 'line' as const, name: 'Line Chart', icon: LineChart },
  { type: 'pie' as const, name: 'Pie Chart', icon: PieChartIcon },
];

function processData(submissions: any[], categoryKey: string, valueKey: string): ChartData[] {
    if (!categoryKey || !valueKey) return [];

    const aggregatedData = submissions.reduce((acc, curr) => {
        const category = curr[categoryKey];
        const value = parseFloat(curr[valueKey]) || 0;

        if (category) {
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += value;
        }
        return acc;
    }, {} as { [key: string]: number });

    return Object.entries(aggregatedData).map(([name, value]) => ({ name, value }));
}


function ChartRenderer({ type, data }: { type: 'bar' | 'line' | 'pie', data: ChartData[] }) {
    if (type === 'bar') {
        return (
            <RechartsBarChart data={data}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} interval={0} angle={-30} textAnchor="end" height={80}/>
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Value" fill="hsl(var(--primary))" />
            </RechartsBarChart>
        )
    }
    if (type === 'line') {
        return (
            <RechartsLineChart data={data}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} interval={0} angle={-30} textAnchor="end" height={80}/>
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Value" stroke="hsl(var(--primary))" />
            </RechartsLineChart>
        )
    }
    if (type === 'pie') {
        return (
            <RechartsPieChart>
                <Tooltip />
                <Legend />
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                   {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
            </RechartsPieChart>
        )
    }
    return null;
}

function ReportsPage() {
  const [dashboardCharts, setDashboardCharts] = useState<ChartConfig[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [chartTypeToAdd, setChartTypeToAdd] = useState<'bar' | 'line' | 'pie' | null>(null);
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);

  useEffect(() => {
    const savedCharts = localStorage.getItem("customDashboard");
    if (savedCharts) {
      setDashboardCharts(JSON.parse(savedCharts));
    }
     // Fetch data and determine available fields
    getSubmissions().then(data => {
      setAllSubmissions(data);
      if (data.length > 0) {
        // Get all unique keys from all submission objects
        const allKeys = data.reduce((acc, curr) => {
          Object.keys(curr).forEach(key => acc.add(key));
          return acc;
        }, new Set<string>());
        
        setAvailableFields(Array.from(allKeys));
      }
    });
  }, []);

  const handleAddChartClick = (type: 'bar' | 'line' | 'pie') => {
    setChartTypeToAdd(type);
    setIsDialogOpen(true);
  };
  
  const handleDeleteChart = (id: string) => {
    const newCharts = dashboardCharts.filter(c => c.id !== id);
    setDashboardCharts(newCharts);
    localStorage.setItem("customDashboard", JSON.stringify(newCharts));
  };
  
  const handleSaveChart = (config: Omit<ChartConfig, 'id' | 'type'>) => {
    if (!chartTypeToAdd) return;
    const newChart: ChartConfig = {
      id: Date.now().toString(),
      type: chartTypeToAdd,
      ...config
    };
    const newCharts = [...dashboardCharts, newChart];
    setDashboardCharts(newCharts);
    localStorage.setItem("customDashboard", JSON.stringify(newCharts));
    setIsDialogOpen(false);
    setChartTypeToAdd(null);
  }

  const ChartConfigDialog = () => {
    const [title, setTitle] = useState("");
    const [categoryKey, setCategoryKey] = useState("");
    const [valueKey, setValueKey] = useState("");
    
    const numericFields = availableFields.filter(field => {
      // A simple heuristic to find numeric fields: check if some values can be parsed as floats
      return allSubmissions.some(s => s[field] && !isNaN(parseFloat(s[field])));
    });
    
    const handleSave = () => {
        if (title && categoryKey && valueKey) {
            handleSaveChart({
                title,
                categoryKey,
                valueKey
            });
        }
    };
    
    return (
      <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure New {chartTypeToAdd ? `${chartTypeToAdd.charAt(0).toUpperCase() + chartTypeToAdd.slice(1)} Chart` : 'Chart'}</DialogTitle>
            <DialogDescription>Select the data you want to visualize.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chart-title">Chart Title</Label>
              <Input id="chart-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Rejections by Machine" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chart-category">Category (X-Axis)</Label>
              <Select value={categoryKey} onValueChange={setCategoryKey}>
                <SelectTrigger id="chart-category"><SelectValue placeholder="Select a category field..." /></SelectTrigger>
                <SelectContent>
                  {availableFields.map(field => <SelectItem key={field} value={field}>{field}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="chart-value">Value (Y-Axis)</Label>
              <Select value={valueKey} onValueChange={setValueKey}>
                <SelectTrigger id="chart-value"><SelectValue placeholder="Select a value field..." /></SelectTrigger>
                <SelectContent>
                  {numericFields.map(field => <SelectItem key={field} value={field}>{field}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Add to Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
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
                             <Button key={chart.type} variant="outline" className="w-full justify-start gap-2" onClick={() => handleAddChartClick(chart.type)}>
                                <Icon className="h-5 w-5 text-primary"/>
                                <span className="font-medium">{chart.name}</span>
                            </Button>
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
                    {dashboardCharts.map(chart => {
                         const chartData = processData(allSubmissions, chart.categoryKey, chart.valueKey);
                         return (
                             <Card key={chart.id}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>{chart.title}</CardTitle>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteChart(chart.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="h-[400px]">
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                           <ChartRenderer type={chart.type} data={chartData} />
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <p>No data for this configuration.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                         )
                    })}
                </div>
            )}
        </div>
      </main>
      <ChartConfigDialog />
    </div>
  );
}

export default ReportsPage;
