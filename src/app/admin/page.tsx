
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart, Briefcase, Users, FileText, Target, Shield } from "lucide-react";
import { PolarGrid, PolarAngleAxis, Radar, RadarChart, ResponsiveContainer, Text } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const chartData = [
  { name: "Sales", value: 85, fullMark: 100 },
  { name: "Production", value: 92, fullMark: 100 },
  { name: "Inventory", value: 75, fullMark: 100 },
  { name: "OEE", value: 88, fullMark: 100 },
  { name: "Skill Matrix", value: 70, fullMark: 100 },
  { name: "Quality", value: 95, fullMark: 100 },
];

const iconMap: { [key: string]: React.ElementType } = {
  "Sales": Briefcase,
  "Production": Users,
  "Inventory": FileText,
  "OEE": Target,
  "Skill Matrix": Users,
  "Quality": Shield,
};

function CustomPolarAngleAxis({ payload, x, y, cx, cy, ...rest }: any) {
  const Icon = iconMap[payload.value];
  const RADIAN = Math.PI / 180;
  const angle = payload.angle;

  const textXOffset = 1.15;
  const textYOffset = 1.15;
  const textX = cx + (x - cx) * textXOffset;
  const textY = cy + (y - cy) * textYOffset;
  
  const iconXOffset = 1.35;
  const iconYOffset = 1.35;
  const iconX = cx + (x - cx) * iconXOffset;
  const iconY = cy + (y - cy) * iconYOffset;

  return (
    <g>
      <Text
        {...rest}
        verticalAnchor="middle"
        textAnchor="middle"
        x={textX}
        y={textY}
        fill="hsl(var(--foreground))"
      >
        {payload.value}
      </Text>
      {Icon && (
         <g transform={`translate(${iconX - 12}, ${iconY - 12})`}>
          <Icon className="h-6 w-6" style={{ fill: 'hsl(var(--foreground))' }} />
        </g>
      )}
    </g>
  );
}

function AdminDashboard() {
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
            <Link href="/admin" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground shadow-sm">Overall</Link>
            <Link href="/admin/sales" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Sales</Link>
            <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Production</Link>
            <Link href="#" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Inventory</Link>
            <Link href="#" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">OEE</Link>
            <Link href="#" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Skill Matrix</Link>
            <Link href="#" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Quality</Link>
        </nav>
      </header>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Overall Efficiency</CardTitle>
            <CardDescription>A high-level overview of performance across key business areas.</CardDescription>
          </CardHeader>
          <CardContent className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="name" tick={<CustomPolarAngleAxis />} />
                <Radar
                  name="Efficiency"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.6)"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function AdminPage() {
    return <AdminDashboard />
}
