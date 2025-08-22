
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, BarChart, LineChart, PieChart as PieChartIcon, Save, AreaChart, ScatterChart, Layers } from "lucide-react";
import { ResponsiveContainer, Bar, BarChart as RechartsBarChart, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, XAxis, YAxis, Tooltip, Legend, Cell, Area, AreaChart as RechartsAreaChart, Scatter, ScatterChart as RechartsScatterChart, CartesianGrid } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSubmissions } from "@/app/actions";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'stacked-bar';
  title: string;
  categoryKey: string;
  valueKey: string;
  valueKey2?: string; // For scatter plots
}

interface ChartData {
    name: string;
    value: number;
    value2?: number;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const availableCharts = [
  { type: 'bar' as const, name: 'Bar Chart', icon: BarChart },
  { type: 'line' as const, name: 'Line Chart', icon: LineChart },
  { type: 'pie' as const, name: 'Pie Chart', icon: PieChartIcon },
  { type: 'area' as const, name: 'Area Chart', icon: AreaChart },
  { type: 'scatter' as const, name: 'Scatter Plot', icon: ScatterChart },
  { type: 'stacked-bar' as const, name: 'Stacked Bar Chart', icon: Layers },
];

function processData(submissions: any[], config: ChartConfig): any[] {
    if (!config.categoryKey || !config.valueKey) return [];
    
    if (config.type === 'stacked-bar') {
        const aggregatedData = submissions.reduce((acc, curr) => {
            const category = curr[config.categoryKey];
            if (category) {
                 if (!acc[category]) acc[category] = {};
                 
                 const valueKeyName = curr[config.valueKey];
                 const value = parseFloat(curr[config.valueKey2 || ''] || '1'); // Default to 1 if no value for counting

                 if(valueKeyName) {
                    if (!acc[category][valueKeyName]) {
                        acc[category][valueKeyName] = 0;
                    }
                    acc[category][valueKeyName] += value;
                 }
            }
            return acc;
        }, {} as {[key:string]: {[key:string]: number}});
        
        const allValueKeys = new Set<string>();
        Object.values(aggregatedData).forEach(cat => {
            Object.keys(cat).forEach(key => allValueKeys.add(key));
        });

        return Object.entries(aggregatedData).map(([name, values]) => ({
            name,
            ...Object.fromEntries(Array.from(allValueKeys).map(key => [key, values[key] || 0]))
        }));
    }

    const aggregatedData = submissions.reduce((acc, curr) => {
        const category = curr[config.categoryKey];
        const value = parseFloat(curr[config.valueKey]) || 0;
        const value2 = config.valueKey2 ? (parseFloat(curr[config.valueKey2]) || 0) : undefined;

        if (category) {
            if (!acc[category]) {
                acc[category] = { sum: 0, sum2: 0, count: 0 };
            }
            acc[category].sum += value;
            if(value2 !== undefined) acc[category].sum2 += value2;
            acc[category].count += 1;
        }
        return acc;
    }, {} as { [key: string]: { sum: number; sum2: number; count: number } });

    return Object.entries(aggregatedData).map(([name, data]) => ({ 
        name, 
        value: data.sum,
        value2: config.valueKey2 ? data.sum2 : undefined,
    }));
}


function ChartRenderer({ type, data, config }: { type: ChartConfig['type'], data: any[], config: ChartConfig }) {
    const commonProps = {
        data: data,
        margin:{ top: 5, right: 30, left: 20, bottom: 80 }
    };
    const commonXAxis = <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} interval={0} angle={-45} textAnchor="end" />;
    const commonYAxis = <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />;
    const commonTooltip = <Tooltip />;
    const commonLegend = <Legend wrapperStyle={{ bottom: 20 }} />;

    if (type === 'bar') {
        return (
            <RechartsBarChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" />
                {commonXAxis}
                {commonYAxis}
                {commonTooltip}
                {commonLegend}
                <Bar dataKey="value" name={config.valueKey} fill="hsl(var(--primary))" />
            </RechartsBarChart>
        )
    }
    if (type === 'line') {
        return (
            <RechartsLineChart {...commonProps}>
                 <CartesianGrid strokeDasharray="3 3" />
                {commonXAxis}
                {commonYAxis}
                {commonTooltip}
                {commonLegend}
                <Line type="monotone" dataKey="value" name={config.valueKey} stroke="hsl(var(--primary))" />
            </RechartsLineChart>
        )
    }
    if (type === 'pie') {
        return (
            <RechartsPieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                {commonTooltip}
                {commonLegend}
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                   {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
            </RechartsPieChart>
        )
    }
    if (type === 'area') {
        return (
            <RechartsAreaChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" />
                {commonXAxis}
                {commonYAxis}
                {commonTooltip}
                {commonLegend}
                <Area type="monotone" dataKey="value" name={config.valueKey} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
            </RechartsAreaChart>
        );
    }
    if (type === 'scatter') {
        return (
            <RechartsScatterChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" />
                {commonXAxis}
                {commonYAxis}
                {commonTooltip}
                {commonLegend}
                <Scatter name={config.title} dataKey="value" fill="hsl(var(--primary))" />
            </RechartsScatterChart>
        );
    }
     if (type === 'stacked-bar') {
        const allValueKeys = new Set<string>();
        data.forEach(d => {
            Object.keys(d).forEach(key => {
                if (key !== 'name') allValueKeys.add(key);
            });
        });

        return (
            <RechartsBarChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" />
                {commonXAxis}
                {commonYAxis}
                {commonTooltip}
                {commonLegend}
                {Array.from(allValueKeys).map((key, index) => (
                    <Bar key={key} dataKey={key} stackId="a" fill={COLORS[index % COLORS.length]} />
                ))}
            </RechartsBarChart>
        );
    }
    return null;
}

function ReportsPage() {
  const [dashboardCharts, setDashboardCharts] = useState<ChartConfig[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [chartTypeToAdd, setChartTypeToAdd] = useState<ChartConfig['type'] | null>(null);
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
          Object.keys(curr).forEach(key => {
            if(key !== 'id') acc.add(key);
          });
          return acc;
        }, new Set<string>());
        
        setAvailableFields(Array.from(allKeys));
      }
    });
  }, []);

  const handleAddChartClick = (type: ChartConfig['type']) => {
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
    const [valueKey2, setValueKey2] = useState("");
    
    const numericFields = availableFields.filter(field => {
      return allSubmissions.some(s => s[field] && !isNaN(parseFloat(s[field])));
    });
    
    const handleSave = () => {
        if (title && categoryKey && valueKey) {
            handleSaveChart({
                title,
                categoryKey,
                valueKey,
                ...(chartTypeToAdd === 'scatter' || chartTypeToAdd === 'stacked-bar' ? { valueKey2 } : {})
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
              <Label htmlFor="chart-category">{chartTypeToAdd === 'scatter' ? 'X-Axis' : 'Category'}</Label>
              <Select value={categoryKey} onValueChange={setCategoryKey}>
                <SelectTrigger id="chart-category"><SelectValue placeholder="Select a category field..." /></SelectTrigger>
                <SelectContent>
                  {availableFields.map(field => <SelectItem key={field} value={field}>{field}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="chart-value">{chartTypeToAdd === 'scatter' ? 'Y-Axis' : (chartTypeToAdd === 'stacked-bar' ? 'Bar Segments' : 'Value')}</Label>
              <Select value={valueKey} onValueChange={setValueKey}>
                <SelectTrigger id="chart-value"><SelectValue placeholder="Select a value field..." /></SelectTrigger>
                <SelectContent>
                  {chartTypeToAdd === 'stacked-bar' ? availableFields.map(field => <SelectItem key={field} value={field}>{field}</SelectItem>) : numericFields.map(field => <SelectItem key={field} value={field}>{field}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {(chartTypeToAdd === 'scatter' || chartTypeToAdd === 'stacked-bar') && (
                <div className="space-y-2">
                  <Label htmlFor="chart-value2">{chartTypeToAdd === 'stacked-bar' ? 'Bar Value (Optional, defaults to count)' : 'Z-Axis (Size)'}</Label>
                  <Select value={valueKey2} onValueChange={setValueKey2}>
                    <SelectTrigger id="chart-value2"><SelectValue placeholder="Select a second value field..." /></SelectTrigger>
                    <SelectContent>
                      {numericFields.map(field => <SelectItem key={field} value={field}>{field}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
            )}
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
                <CardContent>
                    <ScrollArea className="h-96">
                        <div className="space-y-2 pr-4">
                        {availableCharts.map(chart => {
                            const Icon = chart.icon;
                            return (
                                 <Button key={chart.type} variant="outline" className="w-full justify-start gap-2" onClick={() => handleAddChartClick(chart.type)}>
                                    <Icon className="h-5 w-5 text-primary"/>
                                    <span className="font-medium">{chart.name}</span>
                                </Button>
                            )
                        })}
                        </div>
                    </ScrollArea>
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
                    {dashboardCharts.map(chartConfig => {
                         const chartData = processData(allSubmissions, chartConfig);
                         return (
                             <Card key={chartConfig.id}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>{chartConfig.title}</CardTitle>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteChart(chartConfig.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="h-[400px]">
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                           <ChartRenderer type={chartConfig.type} data={chartData} config={chartConfig} />
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
      {isDialogOpen && <ChartConfigDialog />}
    </div>
  );
}

export default ReportsPage;
