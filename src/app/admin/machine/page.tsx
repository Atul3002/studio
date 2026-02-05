"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { BarChart as RechartsBarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from "recharts";
import { Upload, History, KeyRound, Edit, Trash2, X, BarChart } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubmissions, deleteSubmission, updateSubmission, getLogs, saveSubmission } from "@/app/actions";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

function MachineFileUpload({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) { setFile(e.target.files[0]); setError(null); }
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
            entryType: 'machineData',
            machine: r.machine || 'Unknown',
            machineNumber: r.machineNumber || '',
            machinePower: r.power || r.machinePower || 0,
            tonnage: r.tonnage || 0,
            settingTime: r.settingTime || 0,
            entryDate: r.entryDate || format(new Date(), "yyyy-MM-dd")
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
      <DialogHeader><DialogTitle>Bulk Upload Machines</DialogTitle></DialogHeader>
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

function MachineDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [machineSubmissions, setMachineSubmissions] = useState<any[]>([]);
  const [dataVersion, setDataVersion] = useState(0);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete', id: string, data?: any } | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const { toast } = useToast();

  useEffect(() => {
    getSubmissions().then(data => {
        const filtered = data.filter(s => s.entryType === 'machineData' || (s.machine && !s.operatorName && !s.entryType)).filter(s => {
            const submissionDate = new Date(s.entryDate || s.id);
            const monthMatch = selectedMonth !== null ? submissionDate.getMonth() === selectedMonth : true;
            const yearMatch = selectedYear !== null ? submissionDate.getFullYear() === selectedYear : true;
            return monthMatch && yearMatch;
        });
        filtered.sort((a, b) => new Date(a.entryDate || a.id).getTime() - new Date(b.entryDate || b.id).getTime());
        setMachineSubmissions(filtered);
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
      }
      setPendingAction(null);
  };

  const machineTypeCounts = machineSubmissions.reduce((acc, curr) => {
      const type = curr.machine?.split(' - ')[0] || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
  }, {} as {[key: string]: number});

  const chartData = Object.entries(machineTypeCounts).map(([name, value]) => ({ name, value }));

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
            <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Production</Link>
            <Link href="/admin/machine" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium bg-background text-foreground shadow-sm">Machine</Link>
            <Link href="/admin/inventory" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Inventory</Link>
            <Link href="/admin/oee" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">OEE</Link>
            <Link href="/admin/skill-matrix" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Skill Matrix</Link>
            <Link href="/admin/supplier" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Supplier</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={fetchLogs}><History className="h-5 w-5" /></Button>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild><Button variant="outline"><Upload className="h-4 w-4 mr-2" />Upload</Button></DialogTrigger>
                <DialogContent><MachineFileUpload onUploadSuccess={() => { setIsUploadDialogOpen(false); setDataVersion(v => v+1); }} /></DialogContent>
            </Dialog>
            <Dialog>
                <DialogTrigger asChild><Button>Data entry table</Button></DialogTrigger>
                <DialogContent className="max-w-[95vw] w-full">
                    <DialogHeader><DialogTitle>Machine Registration Data</DialogTitle></DialogHeader>
                    <ScrollArea className="h-[70vh] rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Actions</TableHead>
                                    <TableHead>Submission Date</TableHead>
                                    <TableHead>Machine</TableHead>
                                    <TableHead>Number</TableHead>
                                    <TableHead>Power (kW)</TableHead>
                                    <TableHead>Tonnage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {machineSubmissions.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleActionClick('delete', s)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(s.id).toLocaleString()}</TableCell>
                                        <TableCell>{s.machine}</TableCell>
                                        <TableCell>{s.machineNumber}</TableCell>
                                        <TableCell>{s.machinePower}</TableCell>
                                        <TableCell>{s.tonnage}</TableCell>
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
        <div className="py-4 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/80"><CardHeader><CardTitle className="text-sm font-medium">TOTAL MACHINES</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{machineSubmissions.length}</p></CardContent></Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Machine Distribution</CardTitle></CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" label={{ value: 'Machine Type', position: 'insideBottom', dy: 30 }} />
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <Tooltip />
                            <Bar dataKey="value" fill="hsl(var(--chart-4))" />
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

export default function MachinePage() { return <MachineDashboard />; }
