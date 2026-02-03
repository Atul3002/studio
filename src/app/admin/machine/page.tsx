
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart as RechartsBarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from "recharts";
import { BarChart, Cog, X, History, KeyRound, Edit, Trash2, Settings, Server, Activity } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubmissions, deleteSubmission, updateSubmission, getLogs } from "@/app/actions";
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

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
          toast({ title: "Deleted", description: "Machine record deleted." });
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
          toast({ title: "Updated", description: "Machine record updated." });
      }
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
                                    <TableHead>Setting Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {machineSubmissions.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleActionClick('edit', s)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleActionClick('delete', s)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(s.id).toLocaleString()}</TableCell>
                                        <TableCell>{s.machine}</TableCell>
                                        <TableCell>{s.machineNumber}</TableCell>
                                        <TableCell>{s.machinePower}</TableCell>
                                        <TableCell>{s.tonnage}</TableCell>
                                        <TableCell>{s.settingTime}</TableCell>
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
            <CardContent><div className="flex flex-col space-y-2">{years.map((year) => (<Button key={year} variant={selectedYear === year ? "secondary" : "ghost"} className="justify-start" onClick={() => handleYearSelect(year)}>{year}</Button>))}</div></CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardHeader className="pb-2"><CardTitle className="text-md">Monthly Filter</CardTitle></CardHeader>
            <CardContent><div className="flex flex-col space-y-2">{months.map((month, index) => (<Button key={month} variant={selectedMonth === index ? "secondary" : "ghost"} className="justify-start" onClick={() => handleMonthSelect(index)}>{month}</Button>))}</div></CardContent>
            {(selectedMonth !== null || selectedYear !== null) && (<CardHeader className="pt-0"><Button variant="outline" size="sm" onClick={clearFilters}><X className="w-4 h-4 mr-2" />Clear Filters</Button></CardHeader>)}
          </Card>
        </aside>
        <div className="py-4 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/80"><CardHeader><CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Server /> TOTAL MACHINES</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{machineSubmissions.length}</p></CardContent></Card>
                <Card className="bg-card/80"><CardHeader><CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Activity /> UNIQUE TYPES</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{chartData.length}</p></CardContent></Card>
                <Card className="bg-card/80"><CardHeader><CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Settings /> ACTIVE MONITORING</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">100%</p></CardContent></Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Machine Type Distribution</CardTitle></CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={chartData} margin={{ bottom: 40, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" label={{ value: 'Machine Type', position: 'insideBottom', dy: 30 }} />
                            <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Registered Count', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="hsl(var(--chart-4))" name="Registered Count" />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl">
              <DialogHeader><DialogTitle>Edit Machine Record</DialogTitle></DialogHeader>
              {editingEntry && (
                  <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2"><Label>Machine</Label><Input value={editingEntry.machine || ""} onChange={(e) => setEditingEntry({...editingEntry, machine: e.target.value})} /></div>
                      <div className="space-y-2"><Label>Number</Label><Input value={editingEntry.machineNumber || ""} onChange={(e) => setEditingEntry({...editingEntry, machineNumber: e.target.value})} /></div>
                      <div className="space-y-2"><Label>Power (kW)</Label><Input type="number" value={editingEntry.machinePower || ""} onChange={(e) => setEditingEntry({...editingEntry, machinePower: e.target.value})} /></div>
                      <div className="space-y-2"><Label>Tonnage</Label><Input type="number" value={editingEntry.tonnage || ""} onChange={(e) => setEditingEntry({...editingEntry, tonnage: e.target.value})} /></div>
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

export default function MachinePage() {
    return <MachineDashboard />
}
