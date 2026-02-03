
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { BarChart, Download, X, Cog, Star, Trophy, AlertTriangle, TrendingDown, Clock, Truck, ShieldAlert, PackageSearch, History, KeyRound, Edit, Trash2, Upload, List } from "lucide-react";
import { format } from "date-fns";
import { read, utils } from 'xlsx';
import Papa from 'papaparse';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubmissions, saveSubmission, deleteSubmission, updateSubmission, getLogs } from "@/app/actions";
import { ChartTypeSwitcher } from "@/components/chart-type-switcher";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
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

function AdminPasswordDialog({ isOpen, onOpenChange, onSuccess }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void }) {
    const [password, setPassword] = useState("");
    const { toast } = useToast();
    const handleSubmit = () => {
        if (password === "admin@123") {
            onSuccess();
            setPassword("");
            onOpenChange(false);
        } else {
            toast({ variant: "destructive", title: "Incorrect Password", description: "The password you entered is incorrect." });
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5"/> Admin Verification</DialogTitle>
                    <DialogDescription>Enter password to authorize this action.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input type="password" placeholder="Enter admin password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Verify</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

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

    const [productionSubmissions, setProductionSubmissions] = useState<any[]>([]);
    const [dataVersion, setDataVersion] = useState(0);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete', id: string, data?: any } | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

    const [defectRateChartType, setDefectRateChartType] = useState<'line' | 'bar'>('line');
    const [availabilityChartType, setAvailabilityChartType] = useState<'line' | 'bar'>('line');
    const [leadTimeChartType, setDefectRateChartTypeLine] = useState<'line' | 'bar'>('line');
    const [supplierDefectChartType, setSupplierDefectChartType] = useState<'bar' | 'pie'>('bar');
    const [deliveryTimeChartType, setDeliveryTimeChartType] = useState<'bar' | 'pie'>('bar');

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
    const { toast } = useToast();

    useEffect(() => {
        getSubmissions().then(allData => {
            const prodData = allData.filter(s => s.entryType === 'productionData' || (s.dailyProductionTarget && !s.entryType));
            
            const filteredData = prodData.filter(s => {
                const submissionDate = new Date(s.entryDate || s.id);
                const monthMatch = selectedMonth !== null ? submissionDate.getMonth() === selectedMonth : true;
                const yearMatch = selectedYear !== null ? submissionDate.getFullYear() === selectedYear : true;
                return monthMatch && yearMatch;
            });

            filteredData.sort((a, b) => new Date(a.entryDate || a.id).getTime() - new Date(b.entryDate || b.id).getTime());
            setProductionSubmissions(filteredData);
            
             if (selectedMonth !== null || selectedYear !== null) {
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

            let totalTarget = 0;
            let totalRejection = 0;
            
            filteredData.forEach(s => {
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
            const processedData = waterfallChartData.map((d) => {
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

            const operatorSubmissions = allData.filter(s => s.operatorName);
            const jobsProduced = operatorSubmissions.filter(s => s.serialNumber).length;
            setTotalJobs(jobsProduced);

            const PLANNED_PRODUCTION_TIME = 8 * 60; 
            const IDEAL_CYCLE_TIME = 5; 
            const downtime = operatorSubmissions.reduce((acc, curr) => {
              if (curr.problem && curr.problem !== 'Other' && curr.problem !== 'Operator not available') {
                 return acc + 30; 
              }
              return acc;
            }, 0);
            const runTime = PLANNED_PRODUCTION_TIME - downtime;
            const calculatedPerformance = runTime > 0 ? ((jobsProduced * IDEAL_CYCLE_TIME) / runTime) * 100 : 0;
            setPerformance(parseFloat(calculatedPerformance.toFixed(2)) || 0);

            const machineSubmissions = allData.filter(s => s.machine && s.machine !== 'Unselected');
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
    }, [selectedMonth, selectedYear, dataVersion]);

    const handleMonthSelect = (monthIndex: number) => setSelectedMonth(monthIndex);
    const handleYearSelect = (year: number) => setSelectedYear(year);
    const clearFilters = () => { setSelectedMonth(null); setSelectedYear(null); };

    const fetchLogs = async () => {
        const history = await getLogs();
        setLogs(history);
        setIsHistoryDialogOpen(true);
    };

    const handleActionClick = (type: 'edit' | 'delete', entry: any) => {
        setPendingAction({ type, id: entry.id, data: entry });
        setIsPasswordDialogOpen(true);
    };

    const handlePasswordSuccess = async () => {
        if (!pendingAction) return;
        if (pendingAction.type === 'delete') {
            await deleteSubmission(pendingAction.id);
            setDataVersion(v => v + 1);
            toast({ title: "Deleted", description: "Record deleted successfully." });
        } else {
            setEditingEntry({ ...pendingAction.data });
            setIsEditDialogOpen(true);
        }
        setPendingAction(null);
    };

    const handleUpdateEntry = async () => {
        if (editingEntry) {
            await updateSubmission(editingEntry);
            setDataVersion(v => v + 1);
            setIsEditDialogOpen(false);
            toast({ title: "Updated", description: "Record updated successfully." });
        }
    };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border/40 bg-background/95 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="flex items-center gap-2 pl-20">
                <BarChart className="h-6 w-6" />
                <h1 className="text-xl font-semibold">ADMIN DASHBOARD</h1>
            </div>
            <nav className="flex-1 text-center">
                <Link href="/admin" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Overall</Link>
                <Link href="/admin/sales" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Sales</Link>
                <Link href="/admin/quality" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Quality</Link>
                <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium bg-background text-foreground shadow-sm">Production</Link>
                <Link href="/admin/machine" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Machine</Link>
                <Link href="/admin/inventory" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Inventory</Link>
                <Link href="/admin/oee" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">OEE</Link>
                <Link href="/admin/skill-matrix" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Skill Matrix</Link>
                <Link href="/admin/supplier" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Supplier</Link>
            </nav>
             <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={fetchLogs}><History className="h-5 w-5" /></Button>
                <Dialog>
                    <DialogTrigger asChild><Button>Data entry table</Button></DialogTrigger>
                    <DialogContent className="max-w-[95vw] w-full">
                        <DialogHeader><DialogTitle>Production Submission Data</DialogTitle></DialogHeader>
                        <ScrollArea className="h-[70vh] rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Actions</TableHead>
                                        <TableHead>Submission Date</TableHead>
                                        <TableHead>Entry Date</TableHead>
                                        <TableHead>Target</TableHead>
                                        <TableHead>Rejections</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Shift</TableHead>
                                        <TableHead>Tool Wear</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productionSubmissions.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleActionClick('edit', s)}><Edit className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleActionClick('delete', s)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>{new Date(s.id).toLocaleString()}</TableCell>
                                            <TableCell>{s.entryDate || '-'}</TableCell>
                                            <TableCell>{s.dailyProductionTarget}</TableCell>
                                            <TableCell>{s.rejectionQuantity}</TableCell>
                                            <TableCell className="max-w-[150px] truncate">{s.rejectionReason}</TableCell>
                                            <TableCell>{s.shiftDetails}</TableCell>
                                            <TableCell className="max-w-[150px] truncate">{s.toolWearDetails}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 md:grid-cols-[240px_1fr]">
             <aside className="py-4 space-y-4">
              <Card className="bg-card/50">
                <CardHeader className="pb-2"><CardTitle className="text-md">Yearly Filter</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    {years.map((year) => (
                      <Button key={year} variant={selectedYear === year ? "secondary" : "ghost"} className="justify-start" onClick={() => handleYearSelect(year)}>{year}</Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardHeader className="pb-2"><CardTitle className="text-md">Monthly Filter</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    {months.map((month, index) => (
                      <Button key={month} variant={selectedMonth === index ? "secondary" : "ghost"} className="justify-start" onClick={() => handleMonthSelect(index)}>{month}</Button>
                    ))}
                  </div>
                </CardContent>
                {(selectedMonth !== null || selectedYear !== null) && (
                   <CardHeader className="pt-0">
                      <Button variant="outline" size="sm" onClick={clearFilters}><X className="w-4 h-4 mr-2" />Clear Filters</Button>
                   </CardHeader>
                )}
              </Card>
            </aside>
            <div className="py-4 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-card/80">
                        <CardHeader><CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Cog /> TOTAL JOBS</CardTitle></CardHeader>
                        <CardContent className="flex items-center justify-between"><p className="text-3xl font-bold">{totalJobs}</p></CardContent>
                    </Card>
                    <Card className="bg-card/80">
                        <CardHeader><CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Star /> PERFORMANCE</CardTitle></CardHeader>
                        <CardContent className="flex items-center justify-between"><p className="text-3xl font-bold">{performance}%</p></CardContent>
                    </Card>
                    <Card className="bg-card/80">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Trophy />TOP MACHINE</CardTitle></CardHeader>
                        <CardContent><p className="text-xl font-bold">{topMachine.type}</p><p className="text-xs text-muted-foreground">{topMachine.count} submissions</p></CardContent>
                    </Card>
                     <Card className="bg-card/80">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><AlertTriangle />TOP PROBLEM</CardTitle></CardHeader>
                        <CardContent><p className="text-xl font-bold">{topProblem.type}</p><p className="text-xs text-muted-foreground">{topProblem.count} reports</p></CardContent>
                    </Card>
                </div>
                <Card className="bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">{selectedYear ? `${selectedYear} ` : ''}{selectedMonth !== null ? `${months[selectedMonth]} ` : ''}Production Waterfall Chart</CardTitle>
                        <CardDescription>Shows the flow from production target to actual output.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                             <RechartsBarChart data={waterfallData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" label={{ value: 'Process Stage', position: 'insideBottom', dy: 10 }} />
                                <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Quantity', angle: -90, position: 'insideLeft', dx: -10 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine y={0} stroke="hsl(var(--border))" />
                                <Bar dataKey="bar" stackId="a">
                                    {waterfallData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
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
                             <CardTitle className="flex items-center gap-2 text-base"><TrendingDown /> Defect Rate</CardTitle>
                             <ChartTypeSwitcher currentType={defectRateChartType} onTypeChange={setDefectRateChartType} availableTypes={['line', 'bar']} />
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                {defectRateChartType === 'line' ? (
                                    <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" label={{ value: 'Month', position: 'insideBottom', dy: 10 }} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line type="monotone" dataKey="defectRate" name="Defect Rate (%)" stroke="hsl(var(--destructive))" />
                                    </LineChart>
                                ) : (
                                    <RechartsBarChart data={lineChartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" label={{ value: 'Month', position: 'insideBottom', dy: 10 }} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="defectRate" name="Defect Rate (%)" fill="hsl(var(--destructive))" />
                                    </RechartsBarChart>
                                )}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base"><Star /> Availability</CardTitle>
                            <ChartTypeSwitcher currentType={availabilityChartType} onTypeChange={setAvailabilityChartType} availableTypes={['line', 'bar']} />
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                {availabilityChartType === 'line' ? (
                                    <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" label={{ value: 'Month', position: 'insideBottom', dy: 10 }} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line type="monotone" dataKey="availability" name="Availability (%)" stroke="hsl(var(--chart-2))" />
                                    </LineChart>
                                ) : (
                                    <RechartsBarChart data={lineChartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" label={{ value: 'Month', position: 'insideBottom', dy: 10 }} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="availability" name="Availability (%)" fill="hsl(var(--chart-2))" />
                                    </RechartsBarChart>
                                )}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card>
                         <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base"><Clock /> Lead Time</CardTitle>
                            <ChartTypeSwitcher currentType={defectRateChartType} onTypeChange={setDefectRateChartTypeLine} availableTypes={['line', 'bar']} />
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                               {defectRateChartType === 'line' ? (
                                <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" label={{ value: 'Month', position: 'insideBottom', dy: 10 }} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="leadTime" name="Lead Time (Days)" stroke="hsl(var(--chart-4))" />
                                </LineChart>
                               ) : (
                                <RechartsBarChart data={lineChartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" label={{ value: 'Month', position: 'insideBottom', dy: 10 }} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="leadTime" name="Lead Time (Days)" fill="hsl(var(--chart-4))" />
                                </RechartsBarChart>
                               )}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl">
                <DialogHeader><DialogTitle>Edit Production Entry</DialogTitle></DialogHeader>
                {editingEntry && (
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>Entry Date</Label><Input type="date" value={editingEntry.entryDate || ""} onChange={(e) => setEditingEntry({...editingEntry, entryDate: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Target</Label><Input type="number" value={editingEntry.dailyProductionTarget || ""} onChange={(e) => setEditingEntry({...editingEntry, dailyProductionTarget: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Rejection Qty</Label><Input type="number" value={editingEntry.rejectionQuantity || ""} onChange={(e) => setEditingEntry({...editingEntry, rejectionQuantity: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Shift</Label><Input value={editingEntry.shiftDetails || ""} onChange={(e) => setEditingEntry({...editingEntry, shiftDetails: e.target.value})} /></div>
                        <div className="col-span-2 space-y-2"><Label>Rejection Reason</Label><Textarea value={editingEntry.rejectionReason || ""} onChange={(e) => setEditingEntry({...editingEntry, rejectionReason: e.target.value})} /></div>
                    </div>
                )}
                <DialogFooter><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button><Button onClick={handleUpdateEntry}>Save</Button></DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><History className="h-5 w-5"/> Change History</DialogTitle></DialogHeader>
                <ScrollArea className="h-[60vh]">{logs.length > 0 ? (<div className="space-y-4">{logs.map((log, i) => (<div key={i} className="p-3 border rounded-lg"><div className="flex justify-between"><span className="font-bold">{log.action}</span><span className="text-xs">{new Date(log.timestamp).toLocaleString()}</span></div><p className="text-sm">{log.details}</p></div>))}</div>) : (<div className="text-center py-12">No history.</div>)}</ScrollArea>
            </DialogContent>
        </Dialog>

        <AdminPasswordDialog isOpen={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} onSuccess={handlePasswordSuccess} />
    </div>
  );
}

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ProductionPage() {
  return <ProductionDashboard />;
}
