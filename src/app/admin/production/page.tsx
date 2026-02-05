"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine, LineChart, Line, Cell, Upload, History, KeyRound, Edit, Trash2, X, Cog, Star, Trophy, AlertTriangle, TrendingDown, Clock } from "recharts";
import { format } from "date-fns";

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

function ProductionFileUpload({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleProcessFile = async () => {
    if (!file) return setError("Select file");
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        let records: any[] = [];
        if (file.name.endsWith('.csv')) records = Papa.parse(data as string, { header: true }).data;
        else {
          const { read, utils } = await import('xlsx');
          const wb = read(data, { type: 'array' });
          records = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        }
        for (const r of records) {
          await saveSubmission({
            entryType: 'productionData',
            entryDate: r.entryDate || format(new Date(), "yyyy-MM-dd"),
            dailyProductionTarget: r.target || 0,
            rejectionQuantity: r.rejections || 0,
            rejectionReason: r.reason || '',
            shiftDetails: r.shift || '',
            toolWearDetails: r.toolWear || ''
          });
        }
        onUploadSuccess();
      } catch (err: any) { setError(err.message); } finally { setIsUploading(false); }
    };
    if (file.name.endsWith('.csv')) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <DialogHeader><DialogTitle>Bulk Upload Production</DialogTitle></DialogHeader>
      <div className="py-4"><Input type="file" onChange={handleFileChange} /></div>
      <DialogFooter><Button onClick={handleProcessFile} disabled={isUploading}>Upload</Button></DialogFooter>
    </div>
  );
}

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
                <DialogHeader><DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5"/> Admin Verification</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4"><Input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} /></div>
                <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={handleSubmit}>Verify</Button></DialogFooter>
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

    const [productionSubmissions, setProductionSubmissions] = useState<any[]>([]);
    const [dataVersion, setDataVersion] = useState(0);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete', id: string, data?: any } | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

    const [defectRateChartType, setDefectRateChartType] = useState<'line' | 'bar'>('line');
    const [availabilityChartType, setAvailabilityChartType] = useState<'line' | 'bar'>('line');
    const [leadTimeChartType, setDefectRateChartTypeLine] = useState<'line' | 'bar'>('line');

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
            
            let totalTarget = 0;
            let totalRejection = 0;
            filteredData.forEach(s => {
                totalTarget += parseInt(s.dailyProductionTarget || 0, 10);
                totalRejection += parseInt(s.rejectionQuantity || 0, 10);
            });
            const goodParts = totalTarget - totalRejection;
            const processedData = [
                { name: 'Target', value: totalTarget, bar: [0, totalTarget], fill: 'hsl(var(--primary))' },
                { name: 'Rejections', value: -totalRejection, bar: [goodParts, totalTarget], fill: 'hsl(var(--destructive))' },
                { name: 'Actual', value: goodParts, bar: [0, goodParts], fill: 'hsl(var(--chart-2))' }
            ];
            setWaterfallData(processedData as any);

            const operatorSubmissions = allData.filter(s => s.operatorName);
            setTotalJobs(operatorSubmissions.length);
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
            toast({ title: "Deleted" });
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
            toast({ title: "Updated" });
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
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild><Button variant="outline"><Upload className="h-4 w-4 mr-2" />Upload</Button></DialogTrigger>
                    <DialogContent><ProductionFileUpload onUploadSuccess={() => { setIsUploadDialogOpen(false); setDataVersion(v => v+1); }} /></DialogContent>
                </Dialog>
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
                <CardContent><div className="flex flex-col space-y-2">{years.map(y => <Button key={y} variant={selectedYear === y ? "secondary" : "ghost"} className="justify-start" onClick={() => handleYearSelect(y)}>{y}</Button>)}</div></CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardHeader className="pb-2"><CardTitle className="text-md">Monthly Filter</CardTitle></CardHeader>
                <CardContent><div className="flex flex-col space-y-2">{months.map((m, i) => <Button key={m} variant={selectedMonth === i ? "secondary" : "ghost"} className="justify-start" onClick={() => handleMonthSelect(i)}>{m}</Button>)}</div></CardContent>
                {(selectedMonth !== null || selectedYear !== null) && <CardHeader className="pt-0"><Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button></CardHeader>}
              </Card>
            </aside>
            <div className="py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-card/80"><CardHeader><CardTitle className="text-sm font-medium">TOTAL JOBS</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totalJobs}</p></CardContent></Card>
                </div>
                <Card className="bg-card/80">
                    <CardHeader><CardTitle>Production Waterfall</CardTitle></CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                             <RechartsBarChart data={waterfallData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Quantity', angle: -90, position: 'insideLeft' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="bar">
                                    {waterfallData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                </Bar>
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </main>
        <AdminPasswordDialog isOpen={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} onSuccess={handlePasswordSuccess} />
    </div>
  );
}

export default function ProductionPage() { return <ProductionDashboard />; }
