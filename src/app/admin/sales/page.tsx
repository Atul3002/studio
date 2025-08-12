
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { Bar, BarChart as RechartsBarChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell, Line, LineChart as RechartsLineChart, Area, AreaChart as RechartsAreaChart } from "recharts";
import { Download, BarChart, PieChart, TrendingUp, Zap, ShieldCheck, Star, Trophy, AlertTriangle, ShoppingCart, User, Cog, X, DollarSign, CreditCard, Banknote, Building, Wrench } from "lucide-react";

import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { getSubmissions } from "@/app/actions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 border border-border rounded-lg shadow-lg">
        <p className="label text-sm text-foreground">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
            <p key={index} className="intro text-xs" style={{ color: pld.color || pld.fill }}>{`${pld.name}: ${pld.value.toLocaleString()}`}</p>
        ))}
      </div>
    );
  }

  return null;
};

function SalesDashboard() {
    const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);
    const [paymentModeData, setPaymentModeData] = useState<any[]>([]);
    const [monthlySalesData, setMonthlySalesData] = useState<any[]>([]);
    
    // New state for sales KPIs
    const [totalSale, setTotalSale] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [profitPercentage, setProfitPercentage] = useState(0);
    
    const [monthlyOperatorExpensesData, setMonthlyOperatorExpensesData] = useState<any[]>([]);
    const [monthlyFactoryExpensesData, setMonthlyFactoryExpensesData] = useState<any[]>([]);
    const [machineExpensesBreakdownData, setMachineExpensesBreakdownData] = useState<any[]>([]);

    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = [2023, 2024, 2025];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    useEffect(() => {
        getSubmissions().then(data => {
            setAllSubmissions(data);
        });
    }, [])

    useEffect(() => {
        const dataToProcess = allSubmissions.filter(s => {
            const submissionDate = new Date(s.id);
            const monthMatch = selectedMonth !== null ? submissionDate.getMonth() === selectedMonth : true;
            const yearMatch = selectedYear !== null ? submissionDate.getFullYear() === selectedYear : true;
            return monthMatch && yearMatch;
        });

        setFilteredSubmissions(dataToProcess);

        // Placeholder data for sales KPIs and charts
        setTotalSale(500000);
        setTotalProfit(125000);
        setProfitPercentage(25);
        setPaymentModeData([
            { name: 'Online', value: 450, icon: CreditCard },
            { name: 'Cash', value: 250, icon: Banknote },
        ]);
        
        // --- Monthly Sales Chart ---
        const salesData: { [key: number]: number } = {};
        dataToProcess.forEach(s => {
            if (s.serialNumber) { // Using serial number presence as a proxy for a 'sale'
                const month = new Date(s.id).getMonth();
                // Random sales value for demonstration
                salesData[month] = (salesData[month] || 0) + (Math.floor(Math.random() * 5000) + 1000);
            }
        });
        const salesChartDataFormatted = monthNames.map((monthName, i) => ({
            month: monthName,
            sales: salesData[i] || (selectedMonth !== null ? 0 : Math.floor(Math.random() * 5000) + 1000) // Keep placeholder if no filter
        }));
        setMonthlySalesData(salesChartDataFormatted);

        // --- Finance Data Processing ---
        const financeSubmissions = dataToProcess.filter(s => s.entryType && s.entryType.startsWith('finance-'));
        
        const monthlyOperatorExpenses: { [key: number]: number } = {};
        const monthlyFactoryExpenses: { [key: number]: number } = {};
        const machineExpenses: { [key: string]: number } = {};

        financeSubmissions.forEach(s => {
             const month = new Date(s.id).getMonth();
             const amount = parseFloat(s.amount) || 0;

            if (s.entryType === 'finance-operator') {
                monthlyOperatorExpenses[month] = (monthlyOperatorExpenses[month] || 0) + amount;
            } else if (s.entryType === 'finance-factory') {
                 monthlyFactoryExpenses[month] = (monthlyFactoryExpenses[month] || 0) + amount;
            } else if (s.entryType === 'finance-machine' && s.machine) {
                machineExpenses[s.machine] = (machineExpenses[s.machine] || 0) + amount;
            }
        });

        const operatorExpenseDataFormatted = monthNames.map((monthName, i) => ({
            month: monthName,
            expenses: monthlyOperatorExpenses[i] || 0,
        }));
        setMonthlyOperatorExpensesData(operatorExpenseDataFormatted);

        const factoryExpenseDataFormatted = monthNames.map((monthName, i) => ({
            month: monthName,
            expenses: monthlyFactoryExpenses[i] || 0,
        }));
        setMonthlyFactoryExpensesData(factoryExpenseDataFormatted);

        setMachineExpensesBreakdownData(Object.keys(machineExpenses).map(key => ({ name: key, value: machineExpenses[key] })));


    }, [allSubmissions, selectedMonth, selectedYear]);

    const downloadCSV = () => {
        const allKeys = filteredSubmissions.reduce((acc, curr) => {
            Object.keys(curr).forEach(key => acc.add(key));
            return acc;
        }, new Set<string>());

        const csv = Papa.unparse({
            fields: Array.from(allKeys),
            data: filteredSubmissions
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "submissions.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
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

    const handleBarClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const monthName = data.activePayload[0].payload.month;
            const monthIndex = monthNames.indexOf(monthName);
            if (monthIndex !== -1) {
                handleMonthSelect(monthIndex);
            }
        }
    };

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
                <Link href="/admin/sales" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground shadow-sm">Sales</Link>
                <Link href="/admin/quality" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Quality</Link>
                <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Production</Link>
                <Link href="/admin/inventory" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Inventory</Link>
                <Link href="/admin/oee" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">OEE</Link>
                <Link href="/admin/skill-matrix" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Skill Matrix</Link>
            </nav>
             <div className="ml-auto">
                 <Button size="sm" className="gap-1" onClick={downloadCSV} disabled={filteredSubmissions.length === 0}>
                    <Download className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Download CSV</span>
                 </Button>
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
            </aside>
            <div className="py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><ShoppingCart /> TOTAL SALE</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-3xl font-bold">₹{totalSale.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><DollarSign /> TOTAL PROFIT</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-3xl font-bold">₹{totalProfit.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><TrendingUp /> PROFIT PERCENTAGE</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-3xl font-bold">{profitPercentage}%</p>
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid grid-cols-1 gap-4">
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">{selectedYear ? `${selectedYear} ` : ''}{selectedMonth !== null ? `${months[selectedMonth]} ` : ''}MONTHLY SALES</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={monthlySalesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={handleBarClick}>
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.1)'}} />
                                    <Bar dataKey="sales" name="Sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2"><CreditCard /> PAYMENT MODE</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie data={paymentModeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                        {paymentModeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2"><User /> Monthly Operator Expenses</CardTitle>
                        </CardHeader>
                         <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                               <RechartsBarChart data={monthlyOperatorExpensesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--chart-1) / 0.1)'}} />
                                    <Bar dataKey="expenses" name="Operator Expenses" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2"><Wrench /> Machine-wise Expense Breakdown</CardTitle>
                        </CardHeader>
                         <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                               <RechartsPieChart>
                                    <Pie data={machineExpensesBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                        {machineExpensesBreakdownData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                <Card className="bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2"><Building /> Monthly Factory Expenses</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={monthlyFactoryExpensesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="expenses" name="Factory Expenses" stroke="hsl(var(--chart-2))" />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}


export default function SalesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // In a real app, you'd have better auth state management
  useEffect(() => {
    const loggedIn = sessionStorage.getItem("admin-authenticated");
    if (loggedIn) {
      setIsAuthenticated(true);
    }
  }, []);
  
  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem("admin-authenticated", "true");
  }

  if (!isAuthenticated) {
    return (
      <LoginForm
        role="Admin"
        correctPassword="admin123"
        onLoginSuccess={handleLogin}
      />
    );
  }

  return <SalesDashboard />;
}

    

    