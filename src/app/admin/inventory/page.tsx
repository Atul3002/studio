
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart as RechartsBarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from "recharts";
import { BarChart, Archive, X, Package, DollarSign, Boxes, ShoppingCart, TrendingUp, History, KeyRound, Edit, Trash2 } from "lucide-react";

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

const initialPurchaseData = [
    { name: "Product 1", purchased: 4000 },
    { name: "Product 2", purchased: 3000 },
    { name: "Product 3", purchased: 2000 },
    { name: "Product 4", purchased: 2780 },
    { name: "Product 5", purchased: 1890 },
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
                <DialogHeader><DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5"/> Admin Verification</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4"><Input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} /></div>
                <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={handleSubmit}>Verify</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function InventoryDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [inventorySubmissions, setInventorySubmissions] = useState<any[]>([]);
  const [dataVersion, setDataVersion] = useState(0);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete', id: string, data?: any } | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const { toast } = useToast();

  useEffect(() => {
    getSubmissions().then(data => {
        const filtered = data.filter(s => s.entryType === 'storeData').filter(s => {
            const submissionDate = new Date(s.date || s.id);
            const monthMatch = selectedMonth !== null ? submissionDate.getMonth() === selectedMonth : true;
            const yearMatch = selectedYear !== null ? submissionDate.getFullYear() === selectedYear : true;
            return monthMatch && yearMatch;
        });
        filtered.sort((a, b) => new Date(a.date || a.id).getTime() - new Date(b.date || b.id).getTime());
        setInventorySubmissions(filtered);
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
      }
      setPendingAction(null);
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
            <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Production</Link>
            <Link href="/admin/machine" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Machine</Link>
            <Link href="/admin/inventory" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium bg-background text-foreground shadow-sm">Inventory</Link>
            <Link href="/admin/oee" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">OEE</Link>
            <Link href="/admin/skill-matrix" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Skill Matrix</Link>
            <Link href="/admin/supplier" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Supplier</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={fetchLogs}><History className="h-5 w-5" /></Button>
            <Dialog>
                <DialogTrigger asChild><Button>Data entry table</Button></DialogTrigger>
                <DialogContent className="max-w-[95vw] w-full">
                    <DialogHeader><DialogTitle>Inventory Submission Data</DialogTitle></DialogHeader>
                    <ScrollArea className="h-[70vh] rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Actions</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Raw Material Count</TableHead>
                                    <TableHead>Finished Goods Count</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventorySubmissions.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleActionClick('delete', s)}><Trash2 className="h-4 w-4" /></Button>
                                        </TableCell>
                                        <TableCell>{s.date || '-'}</TableCell>
                                        <TableCell>{s.rawMaterials?.length || 0} items</TableCell>
                                        <TableCell>{s.finishedGoods?.length || 0} items</TableCell>
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
            <Card>
                <CardHeader><CardTitle>Inventory Trends</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={initialPurchaseData} margin={{ bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" label={{ value: 'Product Group', position: 'insideBottom', dy: 10 }} />
                            <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Quantity', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Bar dataKey="purchased" fill="hsl(var(--chart-1))" name="Stock Available" />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </main>

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

export default function InventoryPage() {
    return <InventoryDashboard />
}
