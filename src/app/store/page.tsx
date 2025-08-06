
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Landmark, ChevronsRight, Package, PackageOpen, PackageCheck, Hourglass, CalendarDays } from "lucide-react";

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

function StoreDashboard() {
  const [formData, setFormData] = useState({
    rawMaterialOpening: "",
    rawMaterialClosing: "",
    rawMaterialType: "",
    rawMaterialThickness: "",
    inProcessOpening: "",
    inProcessClosing: "",
    finishGoodsOpening: "",
    finishGoodsClosing: "",
  });
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await saveSubmission({
      entryType: 'storeData',
      date: date ? format(date, "PPP") : "",
      ...formData,
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
    // Reset form
    setFormData({
        rawMaterialOpening: "",
        rawMaterialClosing: "",
        rawMaterialType: "",
        rawMaterialThickness: "",
        inProcessOpening: "",
        inProcessClosing: "",
        finishGoodsOpening: "",
        finishGoodsClosing: "",
    });
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="font-headline text-2xl font-semibold pl-2">Store Dashboard</h1>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Daily Stock Entry</CardTitle>
              <CardDescription>Enter the opening and closing stock for all categories.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                 <div className="space-y-2 md:col-span-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Package /> Raw Material</h3>
                    <div className="space-y-2">
                      <Label htmlFor="rawMaterialType">Type of Material</Label>
                      <Input id="rawMaterialType" value={formData.rawMaterialType} onChange={handleInputChange} required />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="rawMaterialThickness">Thickness of Material</Label>
                      <Input id="rawMaterialThickness" value={formData.rawMaterialThickness} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rawMaterialOpening">Opening Stock</Label>
                      <Input id="rawMaterialOpening" type="number" value={formData.rawMaterialOpening} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rawMaterialClosing">Closing Stock</Label>
                      <Input id="rawMaterialClosing" type="number" value={formData.rawMaterialClosing} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Hourglass /> In-Process</h3>
                    <div className="space-y-2">
                      <Label htmlFor="inProcessOpening">Opening Stock</Label>
                      <Input id="inProcessOpening" type="number" value={formData.inProcessOpening} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inProcessClosing">Closing Stock</Label>
                      <Input id="inProcessClosing" type="number" value={formData.inProcessClosing} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="space-y-4 p-4 border rounded-lg md:col-span-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><PackageCheck /> Finished Goods</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                        <Label htmlFor="finishGoodsOpening">Opening Stock</Label>
                        <Input id="finishGoodsOpening" type="number" value={formData.finishGoodsOpening} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="finishGoodsClosing">Closing Stock</Label>
                        <Input id="finishGoodsClosing" type="number" value={formData.finishGoodsClosing} onChange={handleInputChange} required />
                        </div>
                    </div>
                  </div>
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
        correctPassword="store123"
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return <StoreDashboard />;
}
