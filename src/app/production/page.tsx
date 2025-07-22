"use client";

import { useState } from "react";
import Link from 'next/link';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ArrowLeft } from "lucide-react";

const chartData = [
  { day: "Monday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Tuesday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Wednesday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Thursday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Friday", produced: Math.floor(Math.random() * 1000) + 1500 },
  { day: "Saturday", produced: Math.floor(Math.random() * 500) + 500 },
];

const chartConfig = {
  produced: {
    label: "Breakers Produced",
    color: "hsl(var(--primary))",
  },
};

function ProductionDashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button asChild variant="outline" size="icon" className="h-8 w-8">
                    <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <h1 className="font-headline text-2xl font-semibold">Production Dashboard</h1>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Daily Production Report</CardTitle>
                        <CardDescription>Total breakers produced over the last week.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartData}>
                                    <XAxis
                                        dataKey="day"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
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
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </main>
        </div>
    </div>
  );
}

export default function ProductionPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <LoginForm
        role="Production Team"
        correctPassword="prod123"
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return <ProductionDashboard />;
}
