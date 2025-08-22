
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X, BarChart, DollarSign, Users, TrendingUp, TrendingDown, Target, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSubmissions } from "@/app/actions";

interface KpiConfig {
  id: string;
  title: string;
  dataSource: string;
  metric: 'count' | 'sum' | 'average';
  icon: string;
}

const iconComponents: { [key: string]: React.ElementType } = {
  BarChart, DollarSign, Users, TrendingUp, TrendingDown, Target, Package
};

function KpiPage() {
  const [kpis, setKpis] = useState<KpiConfig[]>([]);
  const [kpiData, setKpiData] = useState<{ [key: string]: number | string }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KpiConfig | null>(null);
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);

  useEffect(() => {
    // Load KPIs from localStorage on mount
    const savedKpis = localStorage.getItem("customKpis");
    if (savedKpis) {
      setKpis(JSON.parse(savedKpis));
    }
    
    // Fetch data and determine available fields
    getSubmissions().then(data => {
      setAllSubmissions(data);
      if (data.length > 0) {
        // Get all unique keys from all submission objects
        const allKeys = data.reduce((acc, curr) => {
          Object.keys(curr).forEach(key => acc.add(key));
          return acc;
        }, new Set<string>());
        
        setAvailableFields(Array.from(allKeys));
      }
    });
  }, []);

  useEffect(() => {
    // Recalculate KPI data when KPIs or submissions change
    if (kpis.length > 0 && allSubmissions.length > 0) {
      const newData: { [key: string]: number | string } = {};
      kpis.forEach(kpi => {
        const relevantSubmissions = allSubmissions.filter(s => s[kpi.dataSource] !== undefined && s[kpi.dataSource] !== null && s[kpi.dataSource] !== "");
        let value: number | string = 0;

        switch (kpi.metric) {
          case 'count':
            value = relevantSubmissions.length;
            break;
          case 'sum':
            value = relevantSubmissions.reduce((acc, curr) => acc + (parseFloat(curr[kpi.dataSource]) || 0), 0);
            break;
          case 'average':
            const sum = relevantSubmissions.reduce((acc, curr) => acc + (parseFloat(curr[kpi.dataSource]) || 0), 0);
            value = relevantSubmissions.length > 0 ? (sum / relevantSubmissions.length).toFixed(2) : 0;
            break;
        }
        newData[kpi.id] = value;
      });
      setKpiData(newData);
    }
  }, [kpis, allSubmissions]);
  
  const handleSaveKpi = (config: KpiConfig) => {
    const newKpis = editingKpi 
      ? kpis.map(k => k.id === config.id ? config : k)
      : [...kpis, config];
      
    setKpis(newKpis);
    localStorage.setItem("customKpis", JSON.stringify(newKpis));
    setIsDialogOpen(false);
    setEditingKpi(null);
  };

  const handleCreateNew = () => {
    setEditingKpi(null);
    setIsDialogOpen(true);
  };
  
  const handleEdit = (kpi: KpiConfig) => {
    setEditingKpi(kpi);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    const newKpis = kpis.filter(k => k.id !== id);
    setKpis(newKpis);
    localStorage.setItem("customKpis", JSON.stringify(newKpis));
  };
  
  const KpiDialog = ({
    isOpen,
    onClose,
    onSave,
    kpi
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: KpiConfig) => void;
    kpi: KpiConfig | null;
  }) => {
    const [title, setTitle] = useState(kpi?.title || "");
    const [dataSource, setDataSource] = useState(kpi?.dataSource || "");
    const [metric, setMetric] = useState<'count' | 'sum' | 'average'>(kpi?.metric || 'count');
    const [icon, setIcon] = useState(kpi?.icon || "BarChart");

    const handleSave = () => {
        if (title && dataSource && metric && icon) {
            onSave({
                id: kpi?.id || Date.now().toString(),
                title,
                dataSource,
                metric,
                icon,
            });
        }
    };
    
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{kpi ? "Edit KPI" : "Create Custom KPI"}</DialogTitle>
            <DialogDescription>Define a new Key Performance Indicator to display on your dashboard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kpi-title">KPI Title</Label>
              <Input id="kpi-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Total Jobs" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kpi-source">Data Source</Label>
              <Select value={dataSource} onValueChange={setDataSource}>
                <SelectTrigger id="kpi-source">
                  <SelectValue placeholder="Select a data field..." />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map(field => <SelectItem key={field} value={field}>{field}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kpi-metric">Metric</Label>
              <Select value={metric} onValueChange={(v) => setMetric(v as any)}>
                <SelectTrigger id="kpi-metric">
                  <SelectValue placeholder="Select a calculation..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="count">Total Count</SelectItem>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="kpi-icon">Icon</Label>
                <Select value={icon} onValueChange={setIcon}>
                    <SelectTrigger id="kpi-icon">
                        <SelectValue placeholder="Select an icon..." />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(iconComponents).map(iconName => {
                           const IconComponent = iconComponents[iconName];
                           return <SelectItem key={iconName} value={iconName}><span className="flex items-center gap-2"><IconComponent/> {iconName}</span></SelectItem>
                        })}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save KPI</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2 pl-20">
          <Target className="h-6 w-6" />
          <h1 className="text-xl font-semibold">CUSTOM KPI DASHBOARD</h1>
        </div>
        <div className="ml-auto">
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" /> Create KPI
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:px-6 sm:py-0">
         {kpis.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8 py-24">
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-2xl font-bold tracking-tight">You have no KPIs</h3>
              <p className="text-sm text-muted-foreground">Get started by creating a new KPI card.</p>
              <Button className="mt-4" onClick={handleCreateNew}>Create KPI</Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
            {kpis.map(kpi => {
              const Icon = iconComponents[kpi.icon];
              return (
                <Card key={kpi.id}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-primary flex items-center justify-between">
                      <span className="flex items-center gap-2">{Icon && <Icon className="w-4 h-4"/>} {kpi.title}</span>
                      <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(kpi)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(kpi.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{kpiData[kpi.id] ?? '...'}</p>
                    <p className="text-xs text-muted-foreground">{`${kpi.metric} of ${kpi.dataSource}`}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      {isDialogOpen && <KpiDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSave={handleSaveKpi} kpi={editingKpi} />}
    </div>
  );
}

export default KpiPage;
