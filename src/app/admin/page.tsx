
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart, Briefcase, Users, FileText, Target, Shield, X, Archive, Cog } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, PolarGrid, PolarAngleAxis, Radar, RadarChart, Text, Label as RechartsLabel, Sector } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoginForm from "@/components/login-form";

const initialChartData = [
  { name: "Sales", value: 85, fullMark: 100, color: "hsl(var(--chart-1))" },
  { name: "Production", value: 92, fullMark: 100, color: "hsl(var(--chart-2))" },
  { name: "Inventory", value: 75, fullMark: 100, color: "hsl(var(--chart-3))" },
  { name: "OEE", value: 88, fullMark: 100, color: "hsl(var(--chart-4))" },
  { name: "Skill Matrix", value: 70, fullMark: 100, color: "hsl(var(--chart-5))" },
  { name: "Quality", value: 95, fullMark: 100, color: "hsl(var(--primary))" },
];

const iconMap: { [key: string]: React.ElementType } = {
  "Sales": Briefcase,
  "Production": Cog,
  "Inventory": Archive,
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

const Needle = ({ value, cx, cy, iR, oR, color }: any) => {
  const angle = 180 + (value / 100) * 180;
  const length = (iR + oR) / 2;
  const sin = Math.sin(-angle * (Math.PI / 180));
  const cos = Math.cos(-angle * (Math.PI / 180));
  const x0 = cx;
  const y0 = cy;
  const xba = x0 + 5 * sin;
  const yba = y0 - 5 * cos;
  const xbb = x0 - 5 * sin;
  const ybb = y0 + 5 * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return (
    <>
      <path d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} Z`} stroke="none" fill={color} />
      <circle cx={x0} cy={y0} r={5} fill={color} stroke="none" />
    </>
  );
};


function SpeedometerChart({ data }: { data: { name: string, value: number, color: string } }) {
    const gaugeData = [
        { name: 'Low', value: 33.33, color: 'hsl(var(--destructive))' },
        { name: 'Medium', value: 33.33, color: 'hsl(var(--chart-3))' },
        { name: 'High', value: 33.33, color: 'hsl(var(--chart-2))' }
    ];

    return (
        <Card className="bg-card/80">
            <CardHeader>
                <CardTitle className="text-sm font-medium">{data.name}</CardTitle>
            </CardHeader>
            <CardContent className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={gaugeData}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={60}
                            outerRadius={80}
                            dataKey="value"
                            paddingAngle={2}
                            isAnimationActive={false}
                        >
                            {gaugeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                            ))}
                        </Pie>
                        <Needle
                          value={data.value}
                          color="hsl(var(--foreground))"
                          cx="50%"
                          cy="100%"
                          iR={60}
                          oR={80}
                        />
                         <text x="50%" y="85%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold" fill="hsl(var(--foreground))">
                            {`${data.value}%`}
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function AdminDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [chartData, setChartData] = useState(initialChartData);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2023, 2024, 2025];

  useEffect(() => {
    if (selectedMonth !== null || selectedYear !== null) {
      // In a real app, you'd fetch and filter data. Here, we'll just randomize for visual effect.
      const newChartData = initialChartData.map(item => ({
        ...item,
        value: Math.floor(Math.random() * (95 - 60 + 1)) + 60,
      }));
      setChartData(newChartData);
    } else {
      setChartData(initialChartData);
    }
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
            <Link href="/admin/quality" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Quality</Link>
            <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Production</Link>
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
        <div className="grid md:grid-cols-3 gap-8 py-4">
            <div className="md:col-span-2">
                <Card className="bg-card/80">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      {selectedYear ? `${selectedYear} ` : ''}{selectedMonth !== null ? `${months[selectedMonth]} ` : ''}Overall Efficiency
                    </CardTitle>
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
                          label={{ 
                            angle: 0,
                            offset: 5,
                            formatter: (value: number) => `${value}%`, 
                            fill: "#FFFFFF",
                            className: "text-sm"
                          }}
                        >
                        </Radar>
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1 grid grid-cols-2 gap-4">
                {chartData.map((item) => (
                    <SpeedometerChart key={item.name} data={item} />
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("admin-authenticated");
    if (loggedIn) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem("admin-authenticated", "true");
  };

  if (!isAuthenticated) {
    return (
      <LoginForm
        role="Admin"
        correctPassword="admin123"
        onLoginSuccess={handleLogin}
      />
    );
  }
    
  return <AdminDashboard />
}
