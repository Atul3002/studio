
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { BarChart, Shield, X, TrendingDown, TrendingUp, Trash2, AlertCircle, Clock, Timer, Layers, Download, History, KeyRound, Edit, Upload } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, BarChart as RechartsBarChart, LabelList } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSubmissions, saveSubmission, deleteSubmission, updateSubmission, getLogs } from "@/app/actions";
import LoginForm from "@/components/login-form";
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

const initialDefectRateData = [
    { month: 'Jan', "Defect Rate (%)": 2.5 },
    { month: 'Feb', "Defect Rate (%)": 2.1 },
    { month: 'Mar', "Defect Rate (%)": 2.3 },
    { month: 'Apr', "Defect Rate (%)": 1.9 },
    { month: 'May', "Defect Rate (%)": 1.5 },
    { month: 'Jun', "Defect Rate (%)": 1.8 },
];

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

function QualityDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [qualitySubmissions, setQualitySubmissions] = useState<any[]>([]);
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
        const filteredData = data.filter(s => s.entryType === 'qualityAnalysis').filter(s => {
            const submissionDate = new Date(s.timestamp || s.id);
            const monthMatch = selectedMonth !== null ? submissionDate.getMonth() === selectedMonth : true;
            const yearMatch = selectedYear !== null ? submissionDate.getFullYear() === selectedYear : true;
            return monthMatch && yearMatch;
        });
        filteredData.sort((a, b) => new Date(a.timestamp || a.id).getTime() - new Date(b.timestamp || b.id).getTime());
        setQualitySubmissions(filteredData);
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
            <Link href="/admin/quality" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium bg-background text-foreground shadow-sm">Quality</Link>
            <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Production</Link>
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
                    <DialogHeader><DialogTitle>Quality Analysis Data</DialogTitle></DialogHeader>
                    <ScrollArea className="h-[70vh] rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Actions</TableHead>
                                    <TableHead>Date of Analysis</TableHead>
                                    <TableHead>Extracted Text</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {qualitySubmissions.map((sub) => (
                                    <TableRow key={sub.id}>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleActionClick('edit', sub)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleActionClick('delete', sub)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{sub.timestamp}</TableCell>
                                        <TableCell className="whitespace-pre-wrap max-w-md truncate">{sub.extractedText}</TableCell>
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
        <div className="py-4 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield /> Quality KPIs</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-card/80"><CardHeader><CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><TrendingDown /> DEFECT RATE</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">2.5%</p></CardContent></Card>
                        <Card className="bg-card/80"><CardHeader><CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><TrendingUp /> FIRST PASS YIELD</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">97.5%</p></CardContent></Card>
                        <Card className="bg-card/80"><CardHeader><CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Trash2 /> SCRAP RATE</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">1.2%</p></CardContent></Card>
                    </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingDown /> Defect Rate Over Time</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={initialDefectRateData} margin={{ bottom: 20, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" label={{ value: 'Month', position: 'insideBottom', dy: 10 }}/>
                                <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: '% Defect', angle: -90, position: 'insideLeft' }}/>
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Defect Rate (%)" stroke="hsl(var(--destructive))" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Layers /> Defect Analysis</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={initialDefectRateData} margin={{ bottom: 20, left: 10 }}>
                                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" label={{ value: 'Month', position: 'insideBottom', dy: 10 }} />
                                <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Bar dataKey="Defect Rate (%)" fill="hsl(var(--primary))" name="Defect Count" />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl">
              <DialogHeader><DialogTitle>Edit Quality Analysis</DialogTitle></DialogHeader>
              {editingEntry && (
                  <div className="space-y-4 py-4">
                      <div className="space-y-2"><Label>Analysis Text</Label><Textarea rows={10} value={editingEntry.extractedText || ""} onChange={(e) => setEditingEntry({...editingEntry, extractedText: e.target.value})} /></div>
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

export default function QualityPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    useEffect(() => { const loggedIn = sessionStorage.getItem("admin-authenticated"); if (loggedIn) setIsAuthenticated(true); }, []);
    const handleLogin = () => { setIsAuthenticated(true); sessionStorage.setItem("admin-authenticated", "true"); };
    if (!isAuthenticated) return <LoginForm role="Admin" correctPassword="admin@123" onLoginSuccess={handleLogin} />;
    return <QualityDashboard />
}
