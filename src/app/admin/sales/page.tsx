
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { Bar, BarChart as RechartsBarChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell, Line, LineChart as RechartsLineChart } from "recharts";
import { Download, BarChart, PieChart as PieChartIcon, LineChart as LineChartIcon, TrendingUp, X, DollarSign, CreditCard, Banknote, Building, Wrench, Wallet, TrendingDown } from "lucide-react";

import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubmissions } from "@/app/actions";
import { ChartTypeSwitcher } from "@/components/chart-type-switcher";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 border border-border rounded-lg shadow-lg">
        <p className="label text-sm text-foreground">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
            <p key={index} className="intro text-xs" style={{ color: pld.color || pld.fill }}>{`${pld.name}: ${pld.value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`}</p>
        ))}
      </div>
    );
  }

  return null;
};

function SalesDashboard() {
    const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
    const [paymentModeData, setPaymentModeData] = useState<any[]>([]);
    const [monthlySalesData, setMonthlySalesData] = useState<any[]>([]);
    
    const [totalSale, setTotalSale] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [profitPercentage, setProfitPercentage] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    
    const [monthlyOperatorExpensesData, setMonthlyOperatorExpensesData] = useState<any[]>([]);
    const [monthlyFactoryExpensesData, setMonthlyFactoryExpensesData] = useState<any[]>([]);
    const [machineExpensesBreakdownData, setMachineExpensesBreakdownData] = useState<any[]>([]);
    
    const [dailySalesData, setDailySalesData] = useState<any[]>([]);
    const [showDetailChart, setShowDetailChart] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = [2023, 2024, 2025];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const [monthlySalesChartType, setMonthlySalesChartType] = useState<'bar' | 'line' | 'pie'>('bar');
    const [dailySalesChartType, setDailySalesChartType] = useState<'bar' | 'line'>('bar');
    const [paymentModeChartType, setPaymentModeChartType] = useState<'pie' | 'bar'>('pie');
    const [operatorExpensesChartType, setOperatorExpensesChartType] = useState<'bar' | 'line'>('bar');
    const [machineExpensesChartType, setMachineExpensesChartType] = useState<'pie' | 'bar'>('pie');
    const [factoryExpensesChartType, setFactoryExpensesChartType] = useState<'line' | 'bar'>('line');

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


        setTotalSale(500000);
        setTotalProfit(125000);
        setProfitPercentage(25);
        setTotalRevenue(600000);
        
        setPaymentModeData([
            { name: 'Online', value: 450000, icon: CreditCard },
            { name: 'Cash', value: 250000, icon: Banknote },
        ]);
        
        const salesData: { [key: number]: number } = {};
        dataToProcess.forEach(s => {
            if (s.serialNumber) { 
                const month = new Date(s.id).getMonth();
                salesData[month] = (salesData[month] || 0) + (Math.floor(Math.random() * 50000) + 10000);
            }
        });
        const salesChartDataFormatted = monthNames.map((monthName, i) => ({
            name: monthName,
            value: salesData[i] || (selectedMonth !== null ? 0 : Math.floor(Math.random() * 50000) + 10000)
        }));
        setMonthlySalesData(salesChartDataFormatted);

        if (selectedMonth !== null) {
            const daysInMonth = new Date(selectedYear || new Date().getFullYear(), selectedMonth + 1, 0).getDate();
            const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
                name: (i + 1).toString(),
                value: Math.floor(Math.random() * 5000) + 1000
            }));
            setDailySalesData(dailyData);
        }

        const financeSubmissions = dataToProcess.filter(s => s.entryType && s.entryType.startsWith('finance-'));
        
        const monthlyOperatorExpenses: { [key: number]: number } = {};
        const monthlyFactoryExpenses: { [key: number]: number } = {};
        const machineExpenses: { [key: string]: number } = {};
        let totalExp = 0;

        financeSubmissions.forEach(s => {
             const month = new Date(s.id).getMonth();
             const amount = parseFloat(s.amount) || 0;
             totalExp += amount;

            if (s.entryType === 'finance-operator') {
                monthlyOperatorExpenses[month] = (monthlyOperatorExpenses[month] || 0) + amount;
            } else if (s.entryType === 'finance-factory') {
                 monthlyFactoryExpenses[month] = (monthlyFactoryExpenses[month] || 0) + amount;
            } else if (s.entryType === 'finance-machine' && s.machine) {
                machineExpenses[s.machine] = (machineExpenses[s.machine] || 0) + amount;
            }
        });
        setTotalExpenses(totalExp);


        const operatorExpenseDataFormatted = monthNames.map((monthName, i) => ({
            name: monthName,
            value: monthlyOperatorExpenses[i] || 0,
        }));
        setMonthlyOperatorExpensesData(operatorExpenseDataFormatted);

        const factoryExpenseDataFormatted = monthNames.map((monthName, i) => ({
            name: monthName,
            value: monthlyFactoryExpenses[i] || 0,
        }));
        setMonthlyFactoryExpensesData(factoryExpenseDataFormatted);

        setMachineExpensesBreakdownData(Object.keys(machineExpenses).map(key => ({ name: key, value: machineExpenses[key] })));


    }, [allSubmissions, selectedMonth, selectedYear]);

    
    const handleMonthSelect = (monthIndex: number) => {
        setSelectedMonth(monthIndex);
        setShowDetailChart(true);
    };
    
    const handleYearSelect = (year: number) => {
        setSelectedYear(year);
    };

    const clearFilters = () => {
        setSelectedMonth(null);
        setSelectedYear(null);
        setShowDetailChart(false);
    };

    const handleBarClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const monthName = data.activePayload[0].payload.name;
            const monthIndex = monthNames.indexOf(monthName);
            if (monthIndex !== -1) {
                handleMonthSelect(monthIndex);
            }
        }
    };
    
    const renderChart = (type: 'bar' | 'line' | 'pie', data: any[], dataKey: string, name: string, color: string, xAxisKey: string = "name") => {
        if (type === 'bar') {
            return (
                <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={handleBarClick}>
                    <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Number(value).toLocaleString()}`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(var(--primary-hsl) / 0.1)' }} />
                    <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
            )
        }
        if (type === 'line') {
            return (
                <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Number(value).toLocaleString()}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey={dataKey} name={name} stroke={color} />
                </RechartsLineChart>
            )
        }
        if (type === 'pie') {
            return (
                 <RechartsPieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Pie data={data} dataKey={dataKey} nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </RechartsPieChart>
            )
        }
        return null;
    }


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
                <Link href="/admin/machine" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Machine</Link>
                <Link href="/admin/inventory" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Inventory</Link>
                <Link href="/admin/oee" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">OEE</Link>
                <Link href="/admin/skill-matrix" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Skill Matrix</Link>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Wallet/> TOTAL REVENUE</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><TrendingDown /> TOTAL EXPENSES</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-3xl font-bold">₹{totalExpenses.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Wallet /> TOTAL SALE</CardTitle>
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
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-semibold">{selectedYear ? `${selectedYear} ` : ''}{selectedMonth === null ? 'YEARLY' : months[selectedMonth].toUpperCase()} SALES</CardTitle>
                             <ChartTypeSwitcher currentType={monthlySalesChartType} onTypeChange={setMonthlySalesChartType} availableTypes={['bar', 'line', 'pie']} />
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                               {renderChart(monthlySalesChartType, monthlySalesData, 'value', 'Sales', 'hsl(var(--primary))')}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    {showDetailChart && selectedMonth !== null && (
                         <Card className="bg-card/80">
                             <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-semibold">DAILY SALES FOR {months[selectedMonth].toUpperCase()}</CardTitle>
                                <ChartTypeSwitcher currentType={dailySalesChartType} onTypeChange={setDailySalesChartType} availableTypes={['bar', 'line']} />
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                 <ResponsiveContainer width="100%" height="100%">
                                    {renderChart(dailySalesChartType, dailySalesData, 'value', 'Sales', 'hsl(var(--chart-2))')}
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card className="bg-card/80">
                         <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2"><CreditCard /> PAYMENT MODE</CardTitle>
                             <ChartTypeSwitcher currentType={paymentModeChartType} onTypeChange={setPaymentModeChartType} availableTypes={['pie', 'bar']} />
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                {renderChart(paymentModeChartType, paymentModeData, 'value', 'Payment Mode', 'hsl(var(--chart-1))')}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80">
                         <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2"><Wrench /> Operator Expenses</CardTitle>
                            <ChartTypeSwitcher currentType={operatorExpensesChartType} onTypeChange={setOperatorExpensesChartType} availableTypes={['bar', 'line']} />
                        </CardHeader>
                         <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              {renderChart(operatorExpensesChartType, monthlyOperatorExpensesData, 'value', 'Operator Expenses', 'hsl(var(--chart-3))')}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2"><Wrench /> Machine-wise Expense</CardTitle>
                            <ChartTypeSwitcher currentType={machineExpensesChartType} onTypeChange={setMachineExpensesChartType} availableTypes={['pie', 'bar']} />
                        </CardHeader>
                         <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                               {renderChart(machineExpensesChartType, machineExpensesBreakdownData, 'value', 'Machine Expenses', 'hsl(var(--chart-4))')}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                <Card className="bg-card/80">
                     <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2"><Building /> Monthly Factory Expenses</CardTitle>
                        <ChartTypeSwitcher currentType={factoryExpensesChartType} onTypeChange={setFactoryExpensesChartType} availableTypes={['line', 'bar']} />
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                           {renderChart(factoryExpensesChartType, monthlyFactoryExpensesData, 'value', 'Factory Expenses', 'hsl(var(--chart-2))')}
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

    
