"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell, Line, LineChart as RechartsLineChart, CartesianGrid } from "recharts";
import { Upload, History, KeyRound, Edit, Trash2, DollarSign, X, BarChart } from "lucide-react";
import { format } from "date-fns";

import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 border border-border rounded-lg shadow-lg">
        <p className="label text-sm text-foreground">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
            <p key={index} className="intro text-xs" style={{ color: pld.color || pld.fill }}>{`${pld.name}: ₹${Number(pld.value).toLocaleString()}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

function SalesFileUpload({ onUploadSuccess }: { onUploadSuccess: () => void }) {
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
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Failed to read file.");

        let records: any[] = [];
        if (file.name.toLowerCase().endsWith('.csv')) {
          const result = Papa.parse(data as string, { header: true, skipEmptyLines: true });
          records = result.data;
        } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
          const { read, utils } = await import('xlsx');
          const workbook = read(data, { type: 'array', cellDates: true });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          records = utils.sheet_to_json(worksheet, { raw: false });
        }

        for (const record of records) {
            const amount = record.amount || record.Amount || 0;
            const date = record.date || record.Date || record.entryDate || format(new Date(), "yyyy-MM-dd");
            const type = record.type || record.Type || 'finance-operator';
            const description = record.description || record.Description || '';
            const machine = record.machine || record.Machine || '';

            await saveSubmission({
                entryType: type.startsWith('finance-') ? type : `finance-${type.toLowerCase()}`,
                date: typeof date === 'string' ? date : format(new Date(date), "yyyy-MM-dd"),
                amount: parseFloat(amount),
                description,
                machine
            });
        }
        onUploadSuccess();
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setIsUploading(false);
      }
    };
    
    if (file.name.toLowerCase().endsWith('.csv')) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Upload /> Upload Finance Data</DialogTitle>
        <DialogDescription>Upload CSV/Excel with headers: date, type, amount, description, machine</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <Input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter>
        <Button onClick={handleProcessFile} disabled={!file || isUploading} className="w-full">
          {isUploading ? "Processing..." : "Process Upload"}
        </Button>
      </DialogFooter>
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
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5"/> Admin Verification</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Verify</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function SalesDashboard() {
    const [financeSubmissions, setFinanceSubmissions] = useState<any[]>([]);
    const [dataVersion, setDataVersion] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete', id: string, data?: any } | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
    const { toast } = useToast();

    useEffect(() => {
        getSubmissions().then(data => {
            const filtered = data.filter(s => s.entryType?.startsWith('finance-')).filter(s => {
                const submissionDate = new Date(s.date || s.id);
                const monthMatch = selectedMonth !== null ? submissionDate.getMonth() === selectedMonth : true;
                const yearMatch = selectedYear !== null ? submissionDate.getFullYear() === selectedYear : true;
                return monthMatch && yearMatch;
            });
            filtered.sort((a, b) => new Date(a.date || a.id).getTime() - new Date(b.date || b.id).getTime());
            setFinanceSubmissions(filtered);
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

    const chartData = financeSubmissions.reduce((acc: any[], curr: any) => {
        const name = curr.date || 'Unknown';
        const amount = parseFloat(curr.amount) || 0;
        const existing = acc.find(item => item.name === name);
        if (existing) existing.value += amount;
        else acc.push({ name, value: amount });
        return acc;
    }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border/40 bg-background/95 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="flex items-center gap-2 pl-20">
                <BarChart className="h-6 w-6" />
                <h1 className="text-xl font-semibold">ADMIN DASHBOARD</h1>
            </div>
            <nav className="flex-1 text-center">
                <Link href="/admin" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Overall</Link>
                <Link href="/admin/sales" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium bg-background text-foreground shadow-sm">Sales</Link>
                <Link href="/admin/quality" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Quality</Link>
                <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Production</Link>
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
                    <DialogContent><SalesFileUpload onUploadSuccess={() => { setIsUploadDialogOpen(false); setDataVersion(v => v+1); }} /></DialogContent>
                </Dialog>
                <Dialog>
                    <DialogTrigger asChild><Button>Data entry table</Button></DialogTrigger>
                    <DialogContent className="max-w-[95vw] w-full">
                        <DialogHeader><DialogTitle>Finance Submission Data</DialogTitle></DialogHeader>
                        <ScrollArea className="h-[70vh] rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Actions</TableHead>
                                        <TableHead>Entry Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Machine</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {financeSubmissions.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleActionClick('edit', s)}><Edit className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleActionClick('delete', s)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>{s.date || '-'}</TableCell>
                                            <TableCell>{s.entryType?.replace('finance-', '')}</TableCell>
                                            <TableCell>₹{Number(s.amount).toLocaleString()}</TableCell>
                                            <TableCell className="max-w-xs truncate">{s.description}</TableCell>
                                            <TableCell>{s.machine || '-'}</TableCell>
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
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="w-4 h-4 mr-2" />
                        Clear Filters
                      </Button>
                   </CardHeader>
                )}
              </Card>
            </aside>
            <div className="py-4 space-y-4">
                <Card>
                    <CardHeader><CardTitle>Finance Trend</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={chartData} margin={{ bottom: 20, left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" label={{ value: 'Period', position: 'insideBottom', dy: 10 }} />
                                <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', dx: -10 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="hsl(var(--primary))" name="Total Finance" />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </main>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl">
                <DialogHeader><DialogTitle>Edit Finance Entry</DialogTitle></DialogHeader>
                {editingEntry && (
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>Date</Label><Input value={editingEntry.date || ""} onChange={(e) => setEditingEntry({...editingEntry, date: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Amount</Label><Input type="number" value={editingEntry.amount || ""} onChange={(e) => setEditingEntry({...editingEntry, amount: e.target.value})} /></div>
                        <div className="col-span-2 space-y-2"><Label>Description</Label><Textarea value={editingEntry.description || ""} onChange={(e) => setEditingEntry({...editingEntry, description: e.target.value})} /></div>
                    </div>
                )}
                <DialogFooter><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button><Button onClick={handleUpdateEntry}>Save</Button></DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><History className="h-5 w-5"/> Change History</DialogTitle></DialogHeader>
                <ScrollArea className="h-[60vh]">{logs.length > 0 ? (<div className="space-y-4">{logs.map((log, i) => (<div key={i} className="p-3 border rounded-lg"><div className="flex justify-between"><span className="font-bold">{log.action}</span><span className="text-xs">{new Date(log.timestamp).toLocaleString()}</span></div><p className="text-sm">{log.details}</p></div>))}</div>) : (<div className="text-center py-12">No history found.</div>)}</ScrollArea>
            </DialogContent>
        </Dialog>

        <AdminPasswordDialog isOpen={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} onSuccess={handlePasswordSuccess} />
    </div>
  );
}

export default function SalesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => { const loggedIn = sessionStorage.getItem("admin-authenticated"); if (loggedIn) setIsAuthenticated(true); }, []);
  const handleLogin = () => { setIsAuthenticated(true); sessionStorage.setItem("admin-authenticated", "true"); }
  if (!isAuthenticated) return <LoginForm role="Admin" correctPassword="admin@123" onLoginSuccess={handleLogin} />;
  return <SalesDashboard />;
}
