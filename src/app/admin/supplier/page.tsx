"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { BarChart, Truck, X, Package, Clock, AlertCircle, List, Layers, CheckCircle, Cog, Upload, Edit, Trash2, History, KeyRound } from "lucide-react";
import { read, utils } from 'xlsx';
import Papa from 'papaparse';
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSubmissions, saveSubmission, deleteSubmission, updateSubmission, getLogs } from "@/app/actions";
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
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-background/80 border border-border rounded-lg shadow-lg">
        <p className="label text-sm text-foreground font-semibold">{`${label || payload[0].name}`}</p>
         {payload.map((pld: any, index: number) => (
             <p key={index} className="intro text-xs" style={{ color: pld.color || pld.fill }}>{`${pld.name}: ${pld.value}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

const initialFormState = {
    entryDate: undefined as string | undefined,
    srNo: "",
    catNo: "",
    description: "",
    customerQuantity: "",
    startDate: "",
    endDate: "",
    completionDate: "",
    rmDescription: "",
    rmRate: "",
    scrapKg: "",
    rmLeadTime: "",
    blankCutting: "",
    tapping: "",
    finishing: "",
    inspection: "",
    packing: "",
    dispatch: "",
    machineName: "",
    machineNumber: "",
    settingTime: "",
    cnc1: "",
    cnc2: "",
    cnc3: "",
    vmc1: "",
    vmc2: "",
};

function AdminPasswordDialog({ 
    isOpen, 
    onOpenChange, 
    onSuccess 
}: { 
    isOpen: boolean, 
    onOpenChange: (open: boolean) => void, 
    onSuccess: () => void 
}) {
    const [password, setPassword] = useState("");
    const { toast } = useToast();

    const handleSubmit = () => {
        if (password === "admin@123") {
            onSuccess();
            setPassword("");
            onOpenChange(false);
        } else {
            toast({
                variant: "destructive",
                title: "Incorrect Password",
                description: "The password you entered is incorrect."
            });
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
                    <Input 
                        type="password" 
                        placeholder="Enter admin password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Verify</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function SupplierFileUpload({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const processAndSave = async (records: any[]) => {
    const expectedKeys = Object.keys(initialFormState);
    const keyMap = new Map<string, string>();
    expectedKeys.forEach(key => {
        keyMap.set(key.toLowerCase().replace(/\s/g, ''), key);
    });

    for (const record of records) {
        const submissionRecord: { [key: string]: any } = { entryType: 'supplierData' };
        let hasData = false;

        for (const header in record) {
            const normalizedHeader = header.trim().toLowerCase().replace(/\s/g, '');
            if (keyMap.has(normalizedHeader)) {
                const originalKey = keyMap.get(normalizedHeader)!;
                let value = record[header];
                
                if (['startDate', 'endDate', 'completionDate', 'entryDate'].includes(originalKey)) {
                    if (value) {
                        let dateObj;
                        if (value instanceof Date) {
                            dateObj = value;
                        } else {
                            dateObj = new Date(value);
                        }
                        
                        if (dateObj && !isNaN(dateObj.getTime())) {
                            submissionRecord[originalKey] = format(dateObj, "yyyy-MM-dd");
                        } else {
                            submissionRecord[originalKey] = value;
                        }
                    } else {
                         submissionRecord[originalKey] = value;
                    }
                } else {
                    submissionRecord[originalKey] = value;
                }

                if (submissionRecord[originalKey] !== null && submissionRecord[originalKey] !== '') {
                    hasData = true;
                }
            }
        }
        
        if (hasData) {
           await saveSubmission(submissionRecord);
        }
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
        if (!data) {
          throw new Error("Failed to read file.");
        }

        let records: any[] = [];
        if (file.name.toLowerCase().endsWith('.csv')) {
          const result = Papa.parse(data as string, { header: true, skipEmptyLines: true });
          if (result.errors.length > 0) {
              throw new Error("Failed to parse CSV file.");
          }
          records = result.data;
        } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
          const workbook = read(data, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          records = utils.sheet_to_json(worksheet, {raw: false});
        }

        if (records.length > 0) {
            await processAndSave(records);
            onUploadSuccess();
        } else {
            setError("No data found in the file.");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred during file processing.");
      } finally {
        setIsUploading(false);
      }
    };
    
    if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Upload /> Upload Bulk Data</DialogTitle>
        <DialogDescription>Upload an Excel or CSV file.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Data File</Label>
          <Input id="file-upload" type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter>
        <Button onClick={handleProcessFile} disabled={!file || isUploading} className="w-full">
          {isUploading ? "Processing..." : "Upload and Process File"}
        </Button>
      </DialogFooter>
    </div>
  );
}

function SupplierDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
  
  const [supplierCount, setSupplierCount] = useState(0);
  const [avgLeadTime, setAvgLeadTime] = useState(0);
  const [totalCustomerQty, setTotalCustomerQty] = useState(0);
  const [totalScrap, setTotalScrap] = useState(0);

  const [supplierSubmissions, setSupplierSubmissions] = useState<any[]>([]);
  const [scrapData, setScrapData] = useState<any[]>([]);
  const [customerQtyData, setCustomerQtyData] = useState<any[]>([]);
  const [machineTimeData, setMachineTimeData] = useState<any[]>([]);
  const [inspectionData, setInspectionData] = useState<any[]>([]);
  const [machineProcessData, setMachineProcessData] = useState<any[]>([]);
  const [dataVersion, setDataVersion] = useState(0);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete', id: string, data?: any } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditDialogOpenData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (selectedMonth !== null) {
      const year = selectedYear || new Date().getFullYear();
      const numDays = new Date(year, selectedMonth + 1, 0).getDate();
      setDaysInMonth(Array.from({ length: numDays }, (_, i) => i + 1));
    } else {
      setDaysInMonth([]);
      setSelectedDay(null);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    getSubmissions().then(data => {
        const allSupplierSubmissions = data.filter(s => s.entryType === 'supplierData');
        
        const filteredData = allSupplierSubmissions.filter(s => {
             const dateValue = s.entryDate || s.startDate || s.id;
             let submissionDate: Date;

            if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                submissionDate = new Date(dateValue);
                submissionDate = new Date(submissionDate.valueOf() + submissionDate.getTimezoneOffset() * 60 * 1000);
            } else if (dateValue instanceof Date) {
                submissionDate = dateValue;
            } else {
                 submissionDate = new Date(dateValue);
            }

             if (isNaN(submissionDate.getTime())) {
                 return selectedYear === null && selectedMonth === null && selectedDay === null;
             }

             const yearMatch = selectedYear !== null ? submissionDate.getFullYear() === selectedYear : true;
             const monthMatch = selectedMonth !== null ? submissionDate.getMonth() === selectedMonth : true;
             const dayMatch = selectedDay !== null ? submissionDate.getDate() === selectedDay : true;
             return yearMatch && monthMatch && dayMatch;
        });
        
        filteredData.sort((a, b) => {
            const dateA = new Date(a.entryDate || a.id);
            const dateB = new Date(b.entryDate || b.id);
            if (isNaN(dateA.getTime())) return 1;
            if (isNaN(dateB.getTime())) return -1;
            return dateA.getTime() - dateB.getTime();
        });

        setSupplierSubmissions(filteredData);
        
        const uniqueSuppliers = [...new Set(filteredData.map(s => s.catNo))];
        setSupplierCount(uniqueSuppliers.length);

        const leadTimes = filteredData.map(s => parseInt(s.rmLeadTime, 10) || 0).filter(d => d > 0);
        const totalLeadTime = leadTimes.reduce((acc, curr) => acc + curr, 0);
        setAvgLeadTime(leadTimes.length > 0 ? parseFloat((totalLeadTime / leadTimes.length).toFixed(1)) : 0);

        const customerQuantities = filteredData.map(s => parseInt(s.customerQuantity, 10) || 0);
        const totalQty = customerQuantities.reduce((acc, curr) => acc + curr, 0);
        setTotalCustomerQty(totalQty);
        
        const scrapValues = filteredData.map(s => parseInt(s.scrapKg, 10) || 0);
        const totalScrapValue = scrapValues.reduce((acc, curr) => acc + curr, 0);
        setTotalScrap(totalScrapValue);
        
        const processChartData = (key: string, nameKey: "catNo" | "description" = "catNo") => {
            const dataMap = new Map<string, number>();
            filteredData.forEach(s => {
                const name = s[nameKey];
                const value = parseInt(s[key], 10) || 0;
                if (name && value > 0) {
                   dataMap.set(name, (dataMap.get(name) || 0) + value);
                }
            });
            return Array.from(dataMap, ([name, value]) => ({ name, value }));
        };
        
        setScrapData(processChartData('scrapKg', 'catNo'));
        setCustomerQtyData(processChartData('customerQuantity', 'description'));
        setMachineTimeData(processChartData('settingTime', 'catNo'));
        setInspectionData(processChartData('inspection', 'catNo'));
        
        const machineData: { [key: string]: number } = {
          'CNC1': 0, 'CNC2': 0, 'CNC3': 0, 'VMC1': 0, 'VMC2': 0,
        };
        filteredData.forEach(s => {
          if (s.cnc1) machineData['CNC1']++;
          if (s.cnc2) machineData['CNC2']++;
          if (s.cnc3) machineData['CNC3']++;
          if (s.vmc1) machineData['VMC1']++;
          if (s.vmc2) machineData['VMC2']++;
        });
        setMachineProcessData(Object.entries(machineData).map(([name, count]) => ({ name, count })));
    })
  }, [selectedMonth, selectedYear, selectedDay, dataVersion]);

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
          setEditDialogOpenData({ ...pendingAction.data });
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

  const handleEditChange = (field: string, value: string) => {
      setEditDialogOpenData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setSelectedDay(null);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
  };
  
  const clearFilters = () => {
    setSelectedMonth(null);
    setSelectedYear(null);
    setSelectedDay(null);
  };

  const handleUploadSuccess = () => {
    setIsUploadDialogOpen(false);
    setDataVersion(v => v + 1);
  };
  
  const renderChart = (data: any[], dataKey: string, name: string, color: string, xAxisLabel: string, yAxisLabel: string) => (
      <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 30, bottom: 80 }}>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" interval={0} height={100} label={{ value: xAxisLabel, position: 'insideBottom', dy: 20 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ top: -10, right: 0 }}/>
              <Bar dataKey={dataKey} name={name} fill={color} />
          </RechartsBarChart>
      </ResponsiveContainer>
    );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border/40 bg-background/95 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2 pl-20">
          <BarChart className="h-6 w-6" />
          <div>
            <h1 className="text-xl font-semibold">ADMIN DASHBOARD</h1>
          </div>
        </div>
        <nav className="flex-1 text-center">
            <Link href="/admin" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Overall</Link>
            <Link href="/admin/sales" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Sales</Link>
            <Link href="/admin/quality" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Quality</Link>
            <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Production</Link>
            <Link href="/admin/machine" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Machine</Link>
            <Link href="/admin/inventory" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Inventory</Link>
            <Link href="/admin/oee" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">OEE</Link>
            <Link href="/admin/skill-matrix" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium text-muted-foreground">Skill Matrix</Link>
            <Link href="/admin/supplier" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium bg-background text-foreground shadow-sm">Supplier</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchLogs} tooltip="Change History">
            <History className="h-5 w-5" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Data entry table</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-full">
              <DialogHeader>
                <DialogTitle>Supplier Submission Data</DialogTitle>
                <DialogDescription>Manage existing supplier data records.</DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[70vh] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky top-0 bg-background z-10">Actions</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Submission Date</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Entry Date</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Sr No</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">CAT No</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Description</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Cust. Qty</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Setting Time</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Start Date</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">End Date</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Completion Date</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">RM Desc.</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">RM Rate</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Scrap (kg)</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">RM Lead Time</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Blank Cutting</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Tapping</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Finishing</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Inspection</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Packing</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Dispatch</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Machine Name</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Machine Number</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">CNC1</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">CNC2</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">CNC3</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">VMC1</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">VMC2</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierSubmissions.map((s, index) => (
                      <TableRow key={s.id || index}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleActionClick('edit', s)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleActionClick('delete', s)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                        <TableCell>{new Date(s.id).toLocaleString()}</TableCell>
                        <TableCell>{s.entryDate}</TableCell>
                        <TableCell>{s.srNo}</TableCell>
                        <TableCell>{s.catNo}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{s.description}</TableCell>
                        <TableCell>{s.customerQuantity}</TableCell>
                        <TableCell>{s.settingTime}</TableCell>
                        <TableCell>{s.startDate}</TableCell>
                        <TableCell>{s.endDate}</TableCell>
                        <TableCell>{s.completionDate}</TableCell>
                        <TableCell>{s.rmDescription}</TableCell>
                        <TableCell>{s.rmRate}</TableCell>
                        <TableCell>{s.scrapKg}</TableCell>
                        <TableCell>{s.rmLeadTime}</TableCell>
                        <TableCell>{s.blankCutting}</TableCell>
                        <TableCell>{s.tapping}</TableCell>
                        <TableCell>{s.finishing}</TableCell>
                        <TableCell>{s.inspection}</TableCell>
                        <TableCell>{s.packing}</TableCell>
                        <TableCell>{s.dispatch}</TableCell>
                        <TableCell>{s.machineName}</TableCell>
                        <TableCell>{s.machineNumber}</TableCell>
                        <TableCell>{s.cnc1}</TableCell>
                        <TableCell>{s.cnc2}</TableCell>
                        <TableCell>{s.cnc3}</TableCell>
                        <TableCell>{s.vmc1}</TableCell>
                        <TableCell>{s.vmc2}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </DialogContent>
          </Dialog>
           <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Upload className="h-4 w-4 mr-2"/>Upload Data</Button>
              </DialogTrigger>
              <DialogContent>
                <SupplierFileUpload onUploadSuccess={handleUploadSuccess} />
              </DialogContent>
            </Dialog>
        </div>
      </header>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 md:grid-cols-[240px_1fr]">
        <aside className="py-4 space-y-4">
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Yearly Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                {years.map((year) => (
                  <Button
                    key={year}
                    variant={selectedYear === year ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => handleYearSelect(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Monthly Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                {months.map((month, index) => (
                  <Button
                    key={month}
                    variant={selectedMonth === index ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => handleMonthSelect(index)}
                  >
                    {month}
                  </Button>
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
          {selectedMonth !== null && (
            <Card className="bg-card/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-md">Day Filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-60">
                        <div className="flex flex-col space-y-2 pr-4">
                            {daysInMonth.map((day) => (
                            <Button
                                key={day}
                                variant={selectedDay === day ? "secondary" : "ghost"}
                                className="justify-start"
                                onClick={() => handleDaySelect(day)}
                            >
                                {day}
                            </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
          )}
        </aside>
        <div className="py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Package /> TOTAL SUPPLIERS</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <p className="text-3xl font-bold">{supplierCount}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Clock /> AVG. LEAD TIME</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <p className="text-3xl font-bold">{avgLeadTime} <span className="text-lg text-muted-foreground">days</span></p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><List /> TOTAL CUST. QTY</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <p className="text-3xl font-bold">{totalCustomerQty}</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><AlertCircle /> TOTAL SCRAP (KG)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <p className="text-3xl font-bold">{totalScrap}</p>
                    </CardContent>
                </Card>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><AlertCircle /> RM Scrap vs Supplier</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {renderChart(scrapData, 'value', 'Scrap (kg)', 'hsl(var(--destructive))', 'Supplier (CAT No)', 'Scrap (kg)')}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><List /> Customer PO Qty by Supplier</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {renderChart(customerQtyData, 'value', 'Customer PO Qty', 'hsl(var(--chart-1))', 'Supplier (Description)', 'Customer PO Qty')}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Clock /> Machine Setting Time</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {renderChart(machineTimeData, 'value', 'Setting Time (min)', 'hsl(var(--chart-3))', 'Supplier (CAT No)', 'Setting Time (min)')}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><CheckCircle /> Inspection Quantity</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {renderChart(inspectionData, 'value', 'Inspection Qty', 'hsl(var(--chart-2))', 'Supplier (CAT No)', 'Inspection Quantity')}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Cog /> Machine Process Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={machineProcessData} margin={{ top: 5, right: 20, left: 30, bottom: 30 }}>
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" label={{ value: 'Machine', position: 'insideBottom', dy: 10 }} />
                                <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} label={{ value: 'Usage Count', angle: -90, position: 'insideLeft' }}/>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ top: -10, right: 0 }}/>
                                <Bar dataKey="count" name="Usage Count" fill={'hsl(var(--chart-5))'} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
             </div>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>Edit Supplier Entry</DialogTitle>
                  <DialogDescription>Modify the data for this entry.</DialogDescription>
              </DialogHeader>
              {editingEntry && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                          <Label>Entry Date</Label>
                          <Input type="date" value={editingEntry.entryDate || ""} onChange={(e) => handleEditChange('entryDate', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label>Sr No</Label>
                          <Input value={editingEntry.srNo || ""} onChange={(e) => handleEditChange('srNo', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label>CAT No</Label>
                          <Input value={editingEntry.catNo || ""} onChange={(e) => handleEditChange('catNo', e.target.value)} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                          <Label>Description</Label>
                          <Textarea value={editingEntry.description || ""} onChange={(e) => handleEditChange('description', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label>Customer Qty</Label>
                          <Input value={editingEntry.customerQuantity || ""} onChange={(e) => handleEditChange('customerQuantity', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label>Setting Time (min)</Label>
                          <Input type="number" value={editingEntry.settingTime || ""} onChange={(e) => handleEditChange('settingTime', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label>RM Desc</Label>
                          <Input value={editingEntry.rmDescription || ""} onChange={(e) => handleEditChange('rmDescription', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label>RM Rate</Label>
                          <Input type="number" value={editingEntry.rmRate || ""} onChange={(e) => handleEditChange('rmRate', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label>Scrap (kg)</Label>
                          <Input type="number" value={editingEntry.scrapKg || ""} onChange={(e) => handleEditChange('scrapKg', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label>RM Lead Time</Label>
                          <Input type="number" value={editingEntry.rmLeadTime || ""} onChange={(e) => handleEditChange('rmLeadTime', e.target.value)} />
                      </div>
                  </div>
              )}
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateEntry}>Save Changes</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-3xl">
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><History className="h-5 w-5"/> Change History</DialogTitle>
                  <DialogDescription>A log of all edits and deletions.</DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[60vh]">
                  {logs.length > 0 ? (
                      <div className="space-y-4 p-1">
                          {logs.map((log, i) => (
                              <div key={i} className="p-3 border rounded-lg bg-muted/30">
                                  <div className="flex justify-between items-start mb-1">
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${log.action === 'DELETE' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                                          {log.action}
                                      </span>
                                      <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                                  </div>
                                  <p className="text-sm font-medium">{log.details}</p>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="py-12 text-center text-muted-foreground">No history found.</div>
                  )}
              </ScrollArea>
          </DialogContent>
      </Dialog>

      <AdminPasswordDialog 
          isOpen={isPasswordDialogOpen} 
          onOpenChange={setIsPasswordDialogOpen} 
          onSuccess={handlePasswordSuccess} 
      />
    </div>
  );
}

export default function SupplierAdminPage() {
    return <SupplierDashboard />
}
