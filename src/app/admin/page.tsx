
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle, MoreHorizontal, Download } from "lucide-react";
import Papa from "papaparse";

import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

function AdminDashboard() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    
    useEffect(() => {
        getSubmissions().then(setSubmissions);
    }, [])

    const downloadCSV = () => {
        const dataForCSV = submissions.map(s => {
            const date = new Date(s.id);
            const baseData = {
                Date: date.toLocaleDateString(),
                Time: date.toLocaleTimeString(),
            };

            if (s.machineNumber) { // This is a machine entry
                return {
                    ...baseData,
                    'Entry Type': 'Machine Data',
                    Machine: s.machine,
                    'Machine Number': s.machineNumber,
                    'Machine Power (kW)': s.machinePower,
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
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
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
           <Card>
            <CardHeader>
              <div className="flex items-center">
                <div className="flex-1">
                  <CardTitle>All Submissions</CardTitle>
                  <CardDescription>Data submitted by operators and for machines.</CardDescription>
                </div>
                <Button size="sm" className="gap-1" onClick={downloadCSV} disabled={submissions.length === 0}>
                    <Download className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Download CSV</span>
                 </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Entry Type</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">No submissions yet.</TableCell>
                    </TableRow>
                  )}
                  {submissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{new Date(s.id).toLocaleString()}</TableCell>
                      {s.machineNumber ? (
                        <>
                            <TableCell><Badge variant="secondary">Machine Data</Badge></TableCell>
                            <TableCell>{s.machine}</TableCell>
                            <TableCell>
                                <div className="text-sm">Number: {s.machineNumber}</div>
                                <div className="text-sm">Power: {s.machinePower} kW</div>
                            </TableCell>
                        </>
                      ) : (
                        <>
                            <TableCell><Badge>Operator Data</Badge></TableCell>
                            <TableCell>{s.machine}</TableCell>
                            <TableCell>
                                <div><strong>Operator:</strong> {s.operatorName}</div>
                                <div><strong>Product:</strong> {s.productType}</div>
                                <div><strong>Station:</strong> {s.station}</div>
                                <div><strong>Problem:</strong> {s.problem}{s.problem === 'Other' ? ` (${s.otherProblemReason})` : ''}</div>
                            </TableCell>
                        </>
                      )}
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
