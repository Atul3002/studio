
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { BarChart, Truck, X, Package, Clock, AlertCircle, List, Layers, CheckCircle, Cog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSubmissions } from "@/app/actions";

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


function SupplierDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2023, 2024, 2025];
  
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


  useEffect(() => {
    getSubmissions().then(data => {
        const filteredSupplierSubmissions = data.filter(s => s.entryType === 'supplierData');
        setSupplierSubmissions(filteredSupplierSubmissions);

        const filteredData = filteredSupplierSubmissions.filter(s => {
             const submissionDate = new Date(s.startDate || s.id);
             const monthMatch = selectedMonth !== null ? submissionDate.getMonth() === selectedMonth : true;
             const yearMatch = selectedYear !== null ? submissionDate.getFullYear() === selectedYear : true;
             return monthMatch && yearMatch;
        });
        
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
        
        // Machine Process Data
        const machineData: { [key: string]: number } = {
          'CNC1': 0, 'CNC2': 0, 'CNC3': 0, 'VMC1': 0, 'VMC2': 0,
        };

        filteredSupplierSubmissions.forEach(s => {
          if (s.cnc1) machineData['CNC1']++;
          if (s.cnc2) machineData['CNC2']++;
          if (s.cnc3) machineData['CNC3']++;
          if (s.vmc1) machineData['VMC1']++;
          if (s.vmc2) machineData['VMC2']++;
        });

        setMachineProcessData(Object.entries(machineData).map(([name, count]) => ({ name, count })));

    })
  }, [selectedMonth, selectedYear]);

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
  };
  
  const clearFilters = () => {
    setSelectedMonth(null);
    setSelectedYear(null);
  };
  
  const renderChart = (data: any[], dataKey: string, name: string, color: string) => (
      <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 80 }}>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" interval={0} height={100} />
              <YAxis stroke="hsl(var(--muted-foreground))" />
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
                        {renderChart(scrapData, 'value', 'Scrap (kg)', 'hsl(var(--destructive))')}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><List /> Customer PO Qty by Supplier</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={customerQtyData} margin={{ top: 5, right: 20, left: 20, bottom: 80 }}>
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" interval={0} height={100} />
                                <YAxis stroke="hsl(var(--muted-foreground))" />
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
                        {renderChart(machineTimeData, 'value', 'Setting Time (min)', 'hsl(var(--chart-3))')}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><CheckCircle /> Inspection Quantity</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {renderChart(inspectionData, 'value', 'Inspection Qty', 'hsl(var(--chart-2))')}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Cog /> Machine Process Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={machineProcessData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ top: -10, right: 0 }}/>
                                <Bar dataKey="count" name="Usage Count" fill={'hsl(var(--chart-5))'} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
             </div>
            <Card>
                <CardHeader>
                    <CardTitle>Supplier Submission Data</CardTitle>
                    <CardDescription>A comprehensive table of all supplier data entries.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
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
                                        <TableCell>{s.cnc1}</TableCell>
                                        <TableCell>{s.cnc2}</TableCell>
                                        <TableCell>{s.cnc3}</TableCell>
                                        <TableCell>{s.vmc1}</TableCell>
                                        <TableCell>{s.vmc2}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}

export default function SupplierAdminPage() {
    return <SupplierDashboard />
}
