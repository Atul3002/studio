
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bar, BarChart as RechartsBarChart, Line, LineChart as RechartsLineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { BarChart, Truck, X, CheckCircle, Circle, Package, Clock, AlertCircle, List, Timer, Bot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubmissions } from "@/app/actions";
import { ChartTypeSwitcher } from "@/components/chart-type-switcher";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
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

  const [scrapData, setScrapData] = useState<any[]>([]);
  const [customerQtyData, setCustomerQtyData] = useState<any[]>([]);
  const [machineTimeData, setMachineTimeData] = useState<any[]>([]);
  const [inspectionData, setInspectionData] = useState<any[]>([]);


  useEffect(() => {
    getSubmissions().then(data => {
        const supplierSubmissions = data.filter(s => s.entryType === 'supplierData');

        const filteredData = supplierSubmissions.filter(s => {
             const submissionDate = new Date(s.customerDate);
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
        
        // Chart data processing
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
                        <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Bot /> TOTAL SCRAP (KG)</CardTitle>
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
                            <PieChart>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Pie data={customerQtyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                                     {customerQtyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Timer /> Machine Setting Time</CardTitle>
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
             </div>
        </div>
      </main>
    </div>
  );
}

export default function SupplierAdminPage() {
    return <SupplierDashboard />
}


    
    

    