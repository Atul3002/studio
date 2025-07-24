
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle, MoreHorizontal, Download, BarChart, PieChart } from "lucide-react";
import Papa from "papaparse";
import { Bar, BarChart as RechartsBarChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts";

import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getSubmissions } from "@/app/actions";

const users = [
  { id: 'USR001', name: 'John Doe', email: 'john.doe@example.com', role: 'Operator' },
  { id: 'USR002', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Production' },
  { id: 'USR003', name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
  { id: 'USR004', name: 'Peter Jones', email: 'peter.jones@example.com', role: 'Operator' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

const productionChartData = [
  { day: "Monday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Tuesday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Wednesday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Thursday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Friday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Saturday", produced: Math.floor(Math.random() * 500) + 500 },
];

const productionChartConfig = {
  produced: {
    label: "Breakers Produced",
    color: "hsl(var(--primary))",
  },
};


function AdminDashboard() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [machineChartData, setMachineChartData] = useState<any[]>([]);
    const [operatorProblemData, setOperatorProblemData] = useState<any[]>([]);

    useEffect(() => {
        getSubmissions().then(data => {
            setSubmissions(data);

            const machineSubmissions = data.filter(s => s.tonnage !== undefined);
            const machineCounts = machineSubmissions.reduce((acc, curr) => {
                const machineType = curr.machine.split(' - ')[0];
                acc[machineType] = (acc[machineType] || 0) + 1;
                return acc;
            }, {});
            setMachineChartData(Object.keys(machineCounts).map(key => ({ name: key, count: machineCounts[key] })));
            
            const operatorSubmissions = data.filter(s => s.operatorName && s.problem);
            const problemCounts = operatorSubmissions.reduce((acc, curr) => {
                acc[curr.problem] = (acc[curr.problem] || 0) + 1;
                return acc;
            }, {});
            setOperatorProblemData(Object.keys(problemCounts).map(key => ({ name: key, value: problemCounts[key] })));
        });
    }, [])

    const downloadCSV = () => {
        const dataForCSV = submissions.map(s => {
            const date = new Date(s.id);
            const baseData = {
                Date: date.toLocaleDateString(),
                Time: date.toLocaleTimeString(),
            };

            if (s.tonnage !== undefined) { // This is a machine entry
                return {
                    ...baseData,
                    'Entry Type': 'Machine Data',
                    Machine: s.machine,
                    'Machine Number': s.machineNumber,
                    'Machine Power (kW)': s.machinePower,
                    'Tonnage': s.tonnage,
                    Operator: '',
                    Product: '',
                    Station: '',
                    'Serial #': '',
                    'Machine Speed': '',
                    'Machine Feed': '',
                    'Vibration Level': '',
                    'Coolant Status': '',
                    'Tool Wear Status': '',
                    'Tool Wear Reason': '',
                    'Dimension Measure Status': '',
                    'Dimension Measure Reason': '',
                    Problem: '',
                    'Other Problem Reason': '',
                };
            } else { // This is an operator entry
                return {
                    ...baseData,
                    'Entry Type': 'Operator Data',
                    Machine: s.machine,
                    'Machine Number': '',
                    'Machine Power (kW)': '',
                    'Tonnage': '',
                    Operator: s.operatorName,
                    Product: s.productType,
                    Station: s.station,
                    'Serial #': s.serialNumber,
                    'Machine Speed': s.machineSpeed,
                    'Machine Feed': s.machineFeed,
                    'Vibration Level': s.vibrationLevel,
                    'Coolant Status': s.coolantStatus,
                    'Tool Wear Status': s.toolWearStatus,
                    'Tool Wear Reason': s.toolWearStatus === 'not-ok' ? s.toolWearReason : '',
                    'Dimension Measure Status': s.dimensionMeasureStatus,
                    'Dimension Measure Reason': s.dimensionMeasureStatus === 'not-ok' ? s.dimensionMeasureReason : '',
                    Problem: s.problem,
                    'Other Problem Reason': s.problem === 'Other' ? s.otherProblemReason : '',
                }
            }
        });

        const csv = Papa.unparse(dataForCSV);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'submissions.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
           <Button asChild variant="outline" size="icon" className="h-8 w-8">
             <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
           </Button>
          <h1 className="font-headline text-2xl font-semibold">Admin Dashboard</h1>
           <div className="ml-auto">
             <Button size="sm" className="gap-1" onClick={downloadCSV} disabled={submissions.length === 0}>
                <Download className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Download CSV</span>
             </Button>
           </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2 text-2xl"><BarChart />Machine Submissions</CardTitle>
                        <CardDescription>Count of each machine type submitted.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsBarChart data={machineChartData}>
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <CardTitle className="font-headline flex items-center gap-2 text-2xl"><PieChart />Operator Reported Problems</CardTitle>
                        <CardDescription>Distribution of problems reported by operators.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="min-h-[300px] w-full">
                             <ResponsiveContainer width="100%" height={300}>
                                <RechartsPieChart>
                                    <Pie
                                        data={operatorProblemData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={(props) => `${props.name} (${props.value})`}
                                    >
                                        {operatorProblemData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Daily Production Report</CardTitle>
                        <CardDescription>Total breakers produced over the last week.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={productionChartConfig} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsBarChart data={productionChartData}>
                                    <XAxis
                                        dataKey="day"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--accent) / 0.3)' }}
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar dataKey="produced" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <div className="flex-1">
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage all users in the system.</CardDescription>
                </div>
                 <Button size="sm" className="gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add User</span>
                 </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}


export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <LoginForm
        role="Admin"
        correctPassword="admin123"
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return <AdminDashboard />;
}
