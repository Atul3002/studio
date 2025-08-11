
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart as RechartsBarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { BarChart, Archive, X, Package, DollarSign, Boxes, ShoppingCart, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialPurchaseData = [
    { name: "Product 1", purchased: 4000 },
    { name: "Product 2", purchased: 3000 },
    { name: "Product 3", purchased: 2000 },
    { name: "Product 4", purchased: 2780 },
    { name: "Product 5", purchased: 1890 },
];

const initialSoldData = [
    { name: "Product 1", sold: 2400 },
    { name: "Product 2", sold: 1398 },
    { name: "Product 3", sold: 9800 },
    { name: "Product 4", sold: 3908 },
    { name: "Product 5", sold: 4800 },
];


function InventoryDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [purchaseData, setPurchaseData] = useState(initialPurchaseData);
  const [soldData, setSoldData] = useState(initialSoldData);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2023, 2024, 2025];

  useEffect(() => {
    if (selectedMonth !== null || selectedYear !== null) {
      // In a real app, you'd fetch and filter data. Here, we'll just randomize for visual effect.
      setPurchaseData(initialPurchaseData.map(item => ({ ...item, purchased: Math.floor(Math.random() * 5000) })));
      setSoldData(initialSoldData.map(item => ({ ...item, sold: Math.floor(Math.random() * 5000) })));
    } else {
      setPurchaseData(initialPurchaseData);
      setSoldData(initialSoldData);
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
            <Link href="/admin" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Overall</Link>
            <Link href="/admin/sales" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Sales</Link>
            <Link href="/admin/quality" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Quality</Link>
            <Link href="/admin/production" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground">Production</Link>
            <Link href="/admin/inventory" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground shadow-sm">Inventory</Link>
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
        <div className="py-4 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Archive /> {selectedYear ? `${selectedYear} ` : ''}{selectedMonth !== null ? `${months[selectedMonth]} ` : ''}Inventory</CardTitle>
                    <CardDescription>Overview of current inventory status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-card/80">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Package /> ITEMS AVAILABLE</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between">
                                <p className="text-3xl font-bold">12,500</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-card/80">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><DollarSign /> TOTAL STOCK VALUE</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between">
                                <p className="text-3xl font-bold">$1,250,000</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-card/80">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><Boxes /> STOCK BY PRODUCTS</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between">
                               <p className="text-3xl font-bold">5</p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            {selectedMonth !== null && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ShoppingCart /> Purchased Items by Group</CardTitle>
                            <CardDescription>Breakdown of items purchased in {months[selectedMonth]}.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={purchaseData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="purchased" fill="hsl(var(--chart-1))" />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><TrendingUp /> Items Sold by Group</CardTitle>
                            <CardDescription>Breakdown of items sold in {months[selectedMonth]}.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={soldData}>
                                     <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="sold" fill="hsl(var(--chart-2))" />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default function InventoryPage() {
    return <InventoryDashboard />
}
