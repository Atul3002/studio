
"use client";

import { useState } from "react";
import { LineChart, BarChart, Users, AlertCircle, CheckSquare, TrendingUp } from "lucide-react";
import LoginForm from "@/components/login-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function QualityDashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="font-headline text-2xl font-semibold pl-20">Quality Team</h1>
        </header>
        <main className="grid flex-1 items-start gap-8 p-4 sm:px-6 sm:py-0 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2"><LineChart /> Machinewise Defect Rate</CardTitle>
                    <CardDescription>Monitor defect rates for each machine.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Detailed charts and data will be displayed here.</p>
                    <Button variant="outline" className="mt-4 w-full">View Details</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2"><Users /> Operator Attendance</CardTitle>
                    <CardDescription>Track operator attendance and shifts.</CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-sm text-muted-foreground">Attendance records and summaries will be shown here.</p>
                     <Button variant="outline" className="mt-4 w-full">Manage Attendance</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2"><AlertCircle /> Customer Complaint Entry</CardTitle>
                    <CardDescription>Log and manage customer complaints.</CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-sm text-muted-foreground">Form for entering new customer complaints.</p>
                     <Button variant="outline" className="mt-4 w-full">Add New Complaint</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2"><CheckSquare /> CAPA Entry</CardTitle>
                    <CardDescription>Corrective and Preventive Action entries.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Log and track CAPA reports and statuses.</p>
                    <Button variant="outline" className="mt-4 w-full">Create CAPA</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2"><TrendingUp /> DPMO Monitoring</CardTitle>
                    <CardDescription>Defects Per Million Opportunities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Monitor and analyze DPMO trends.</p>
                    <Button variant="outline" className="mt-4 w-full">View DPMO Report</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2"><BarChart /> Quality Index</CardTitle>
                    <CardDescription>Operatorwise / Machinewise index.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">View quality performance indexes.</p>
                    <Button variant="outline" className="mt-4 w-full">Analyze Index</Button>
                </CardContent>
            </Card>
        </main>
      </div>
    </div>
  );
}


export default function QualityPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <LoginForm
        role="Quality Team"
        correctPassword="quality123"
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return <QualityDashboard />;
}
