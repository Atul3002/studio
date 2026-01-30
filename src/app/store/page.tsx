
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Landmark, ChevronsRight, Package, PackageOpen, PackageCheck, Hourglass, CalendarDays, PlusCircle, Trash2 } from "lucide-react";

import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSubmission } from "@/app/actions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface StockItem {
    id: number;
    catNumber: string;
    description: string;
    materialType: string;
    thickness: string;
    openingStock: string;
    closingStock: string;
}

function StoreDashboard() {
  const [rawMaterials, setRawMaterials] = useState<StockItem[]>([
    { id: 1, catNumber: "", description: "", materialType: "", thickness: "", openingStock: "", closingStock: "" },
  ]);
  const [inProcessItems, setInProcessItems] = useState<StockItem[]>([
     { id: 1, catNumber: "", description: "", materialType: "", thickness: "", openingStock: "", closingStock: "" },
  ]);
  const [finishedGoods, setFinishedGoods] = useState<StockItem[]>([
     { id: 1, catNumber: "", description: "", materialType: "", thickness: "", openingStock: "", closingStock: "" },
  ]);

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleItemChange = (
    list: StockItem[], 
    setter: React.Dispatch<React.SetStateAction<StockItem[]>>, 
    index: number, 
    field: keyof StockItem, 
    value: string
  ) => {
    const newList = [...list];
    (newList[index] as any)[field] = value;
    setter(newList);
  };
  
  const handleAddItem = (setter: React.Dispatch<React.SetStateAction<StockItem[]>>) => {
      setter(prev => [
          ...prev,
          { id: Date.now(), catNumber: "", description: "", materialType: "", thickness: "", openingStock: "", closingStock: "" }
      ]);
  };

  const handleRemoveItem = (list: StockItem[], setter: React.Dispatch<React.SetStateAction<StockItem[]>>, index: number) => {
      if (list.length > 1) {
          const newList = [...list];
          newList.splice(index, 1);
          setter(newList);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await saveSubmission({
      entryType: 'storeData',
      date: date ? format(date, "PPP") : "",
      rawMaterials,
      inProcessItems,
      finishedGoods,
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
    // Reset form
     setRawMaterials([{ id: 1, catNumber: "", description: "", materialType: "", thickness: "", openingStock: "", closingStock: "" }]);
     setInProcessItems([{ id: 1, catNumber: "", description: "", materialType: "", thickness: "", openingStock: "", closingStock: "" }]);
     setFinishedGoods([{ id: 1, catNumber: "", description: "", materialType: "", thickness: "", openingStock: "", closingStock: "" }]);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const renderTable = (
    title: string,
    icon: React.ReactNode,
    items: StockItem[],
    setter: React.Dispatch<React.SetStateAction<StockItem[]>>,
    isFinishedGoods: boolean = false
  ) => (
    <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-semibold text-lg flex items-center gap-2">{icon} {title}</h3>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Serial No.</TableHead>
                    <TableHead>CAT Number</TableHead>
                    <TableHead>Description</TableHead>
                    {!isFinishedGoods && <TableHead>Type of Material</TableHead>}
                    {!isFinishedGoods && <TableHead>Thickness</TableHead>}
                    <TableHead>Opening Stock</TableHead>
                    <TableHead>Closing Stock</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item, index) => (
                    <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell><Input value={item.catNumber} onChange={(e) => handleItemChange(items, setter, index, 'catNumber', e.target.value)} required /></TableCell>
                        <TableCell><Textarea value={item.description} onChange={(e) => handleItemChange(items, setter, index, 'description', e.target.value)} required /></TableCell>
                         {!isFinishedGoods && <TableCell><Input value={item.materialType} onChange={(e) => handleItemChange(items, setter, index, 'materialType', e.target.value)} required /></TableCell>}
                         {!isFinishedGoods && <TableCell><Input value={item.thickness} onChange={(e) => handleItemChange(items, setter, index, 'thickness', e.target.value)} required /></TableCell>}
                        <TableCell><Input type="number" value={item.openingStock} onChange={(e) => handleItemChange(items, setter, index, 'openingStock', e.target.value)} required /></TableCell>
                        <TableCell><Input type="number" value={item.closingStock} onChange={(e) => handleItemChange(items, setter, index, 'closingStock', e.target.value)} required /></TableCell>
                        <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(items, setter, index)} disabled={items.length === 1}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        <Button variant="outline" size="sm" onClick={() => handleAddItem(setter)}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Row
        </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="font-headline text-2xl font-semibold pl-20">Store Dashboard</h1>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Daily Stock Entry</CardTitle>
              <CardDescription>Enter the opening and closing stock for all categories.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                 <div className="space-y-2 max-w-sm">
                    <Label htmlFor="date" className="flex items-center gap-2 font-semibold text-base"><CalendarDays /> Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-8">
                    {renderTable("Raw Material", <Package />, rawMaterials, setRawMaterials)}
                    {renderTable("In-Process", <Hourglass />, inProcessItems, setInProcessItems)}
                    {renderTable("Finished Goods", <PackageCheck />, finishedGoods, setFinishedGoods, true)}
                </div>
              </CardContent>
              <CardFooter className="flex-col items-stretch">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Stock Data"}
                </Button>
                {isSubmitted && <p className="text-green-600 text-center text-sm mt-2">Data submitted successfully!</p>}
              </CardFooter>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default function StorePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <LoginForm
        role="Store Team"
        correctPassword="admin@123"
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return <StoreDashboard />;
}
