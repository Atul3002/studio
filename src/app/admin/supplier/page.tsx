
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { BarChart, Truck, X, Package, Clock, AlertCircle, List, Layers, CheckCircle, Cog, Upload } from "lucide-react";
import { read, utils } from 'xlsx';
import Papa from 'papaparse';
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSubmissions } from "@/app/actions";
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.timeline) {
         return (
             <div className="p-2 bg-background/80 border border-border rounded-lg shadow-lg">
                <p className="label text-sm text-foreground font-semibold">{data.catNo}</p>
                <p className="intro text-xs text-blue-400">Start (Day of Year): {data.startDay}</p>
                <p className="intro text-xs text-red-400">Due (Day of Year): {data.endDay}</p>
                <p className="intro text-xs text-green-400">Completed (Day of Year): {data.completionDay}</p>
             </div>
         )
    }

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

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const initialFormState = {
    entryDate: undefined as Date | undefined,
    srNo: "",
    catNo: "",
    description: "",
    customerQuantity: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    completionDate: undefined as Date | undefined,
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
              console.error("CSV Parsing errors: ", result.errors);
              throw new Error("Failed to parse CSV file. For dates, please use a format like YYYY-MM-DD.");
          }
          records = result.data;
        } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
          const workbook = read(data, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          records = utils.sheet_to_json(worksheet, {raw: false});
        } else {
           throw new Error("Unsupported file type. Please upload a CSV or Excel file.");
        }

        if (records.length > 0) {
            await processAndSave(records);
            onUploadSuccess();
        } else {
            setError("No data found in the file.");
        }

      } catch (err: any) {
        setError(err.message || "An error occurred during file processing.");
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
        setIsUploading(false);
        setError("Failed to read the file.");
    }

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
        <DialogDescription>Upload an Excel (.xlsx, .xls) or CSV file for bulk supplier data entry.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Data File</Label>
          <Input id="file-upload" type="file" accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileChange} />
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
                 // Adjust for timezone to avoid off-by-one day errors
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
            <Link href="/admin" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Overall</Link>
            <Link href="/admin/sales" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Sales</Link>
            <Link href="/admin/quality" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Quality</Link>
            <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Production</Link>
            <Link href="/admin/machine" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Machine</Link>
            <Link href="/admin/inventory" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Inventory</Link>
            <Link href="/admin/oee" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">OEE</Link>
            <Link href="/admin/skill-matrix" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Skill Matrix</Link>
            <Link href="/admin/supplier" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground shadow-sm">Supplier</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Data entry table</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw]">
              <DialogHeader>
                <DialogTitle>Supplier Submission Data</DialogTitle>
                <DialogDescription>
                  A comprehensive table of all supplier data entries.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[70vh] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Entry Date</TableHead>
                      <TableHead>Sr No</TableHead>
                      <TableHead>CAT No</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Cust. Qty</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Completion Date</TableHead>
                      <TableHead>RM Desc.</TableHead>
                      <TableHead>RM Rate</TableHead>
                      <TableHead>Scrap (kg)</TableHead>
                      <TableHead>RM Lead Time</TableHead>
                      <TableHead>Blank Cutting</TableHead>
                      <TableHead>Tapping</TableHead>
                      <TableHead>Finishing</TableHead>
                      <TableHead>Inspection</TableHead>
                      <TableHead>Packing</TableHead>
                      <TableHead>Dispatch</TableHead>
                      <TableHead>Machine Name</TableHead>
                      <TableHead>Machine Number</TableHead>
                      <TableHead>Setting Time</TableHead>
                      <TableHead>CNC1</TableHead>
                      <TableHead>CNC2</TableHead>
                      <TableHead>CNC3</TableHead>
                      <TableHead>VMC1</TableHead>
                      <TableHead>VMC2</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierSubmissions.map((s, index) => (
                      <TableRow key={s.id || index}>
                        <TableCell>{new Date(s.id).toLocaleString()}</TableCell>
                        <TableCell>{s.entryDate}</TableCell>
                        <TableCell>{s.srNo}</TableCell>
                        <TableCell>{s.catNo}</TableCell>
                        <TableCell>{s.description}</TableCell>
                        <TableCell>{s.customerQuantity}</TableCell>
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
                        <TableCell>{s.settingTime}</TableCell>
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
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={customerQtyData} margin={{ top: 5, right: 20, left: 30, bottom: 80 }}>
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" interval={0} height={100} label={{ value: 'Supplier (Description)', position: 'insideBottom', dy: 20 }}/>
                                <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Customer PO Qty', angle: -90, position: 'insideLeft' }}/>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ top: -10, right: 0 }}/>
                                <Bar dataKey="value" name="Customer PO Qty" fill={'hsl(var(--chart-1))'} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
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
    </div>
  );
}

export default function SupplierAdminPage() {
    return <SupplierDashboard />
}
