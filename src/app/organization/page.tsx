
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit, Save, X, Type, Pilcrow, ImageIcon, Target, BarChart, DollarSign, Users, TrendingUp, TrendingDown, Package, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSubmissions } from "@/app/actions";
import { ScrollArea } from "@/components/ui/scroll-area";

type BlockType = 'header' | 'text' | 'image' | 'kpi';

interface Block {
    id: string;
    type: BlockType;
    content: any;
}

interface KpiConfig {
    id: string;
    title: string;
    dataSource: string;
    metric: 'count' | 'sum' | 'average';
    icon: string;
}

const componentLibrary = [
    { type: 'header' as const, name: 'Header', icon: Type },
    { type: 'text' as const, name: 'Text Block', icon: Pilcrow },
    { type: 'image' as const, name: 'Image', icon: ImageIcon },
    { type: 'kpi' as const, name: 'KPI Card', icon: Target },
];

const iconComponents: { [key: string]: React.ElementType } = {
  BarChart, DollarSign, Users, TrendingUp, TrendingDown, Target, Package
};


function OrganizationPage() {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [blockTypeToAdd, setBlockTypeToAdd] = useState<BlockType | null>(null);
    const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
    const [availableFields, setAvailableFields] = useState<string[]>([]);
    const [kpiData, setKpiData] = useState<{ [key: string]: number | string }>({});

    useEffect(() => {
        const savedPage = localStorage.getItem("customOrganizationPage");
        if (savedPage) {
            setBlocks(JSON.parse(savedPage));
        }
        getSubmissions().then(data => {
          setAllSubmissions(data);
          if (data.length > 0) {
            const allKeys = data.reduce((acc, curr) => {
              Object.keys(curr).forEach(key => acc.add(key));
              return acc;
            }, new Set<string>());
            setAvailableFields(Array.from(allKeys));
          }
        });
    }, []);

    useEffect(() => {
        const kpiBlocks = blocks.filter(b => b.type === 'kpi');
        if (kpiBlocks.length > 0 && allSubmissions.length > 0) {
          const newData: { [key: string]: number | string } = {};
          kpiBlocks.forEach(block => {
            const kpi: KpiConfig = block.content;
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
    }, [blocks, allSubmissions]);
    
    const handleAddBlockClick = (type: BlockType) => {
        setBlockTypeToAdd(type);
        setIsDialogOpen(true);
    };

    const handleSaveBlock = (content: any) => {
        if (!blockTypeToAdd) return;
        const newBlock: Block = {
            id: Date.now().toString(),
            type: blockTypeToAdd,
            content: content
        };
        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
        localStorage.setItem("customOrganizationPage", JSON.stringify(newBlocks));
        setIsDialogOpen(false);
        setBlockTypeToAdd(null);
    };

    const handleDeleteBlock = (id: string) => {
        const newBlocks = blocks.filter(b => b.id !== id);
        setBlocks(newBlocks);
        localStorage.setItem("customOrganizationPage", JSON.stringify(newBlocks));
    };

    const BlockConfigDialog = () => {
        const [header, setHeader] = useState('');
        const [text, setText] = useState('');
        const [imageUrl, setImageUrl] = useState('');
        
        const [kpiTitle, setKpiTitle] = useState("");
        const [kpiDataSource, setKpiDataSource] = useState("");
        const [kpiMetric, setKpiMetric] = useState<'count' | 'sum' | 'average'>('count');
        const [kpiIcon, setKpiIcon] = useState("BarChart");
        
        const handleSave = () => {
            let content = {};
            switch (blockTypeToAdd) {
                case 'header':
                    content = { text: header };
                    break;
                case 'text':
                    content = { text: text };
                    break;
                case 'image':
                    content = { src: imageUrl };
                    break;
                case 'kpi':
                    content = { id: Date.now().toString(), title: kpiTitle, dataSource: kpiDataSource, metric: kpiMetric, icon: kpiIcon };
                    break;
            }
            handleSaveBlock(content);
        };
        
        const renderForm = () => {
            switch (blockTypeToAdd) {
                case 'header':
                    return (
                        <div className="space-y-2">
                          <Label htmlFor="header-text">Header Text</Label>
                          <Input id="header-text" value={header} onChange={e => setHeader(e.target.value)} placeholder="e.g., Welcome to Our Company" />
                        </div>
                    );
                case 'text':
                    return (
                        <div className="space-y-2">
                            <Label htmlFor="text-content">Text Content</Label>
                            <Textarea id="text-content" value={text} onChange={e => setText(e.target.value)} placeholder="Enter your paragraph text here..." rows={6} />
                        </div>
                    );
                case 'image':
                    return (
                        <div className="space-y-2">
                            <Label htmlFor="image-url">Image URL</Label>
                            <Input id="image-url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" />
                        </div>
                    );
                case 'kpi':
                    return (
                        <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="kpi-title">KPI Title</Label>
                              <Input id="kpi-title" value={kpiTitle} onChange={e => setKpiTitle(e.target.value)} placeholder="e.g., Total Jobs" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="kpi-source">Data Source</Label>
                              <Select value={kpiDataSource} onValueChange={setKpiDataSource}>
                                <SelectTrigger id="kpi-source"><SelectValue placeholder="Select a data field..." /></SelectTrigger>
                                <SelectContent>
                                  {availableFields.map(field => <SelectItem key={field} value={field}>{field}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="kpi-metric">Metric</Label>
                              <Select value={kpiMetric} onValueChange={(v) => setKpiMetric(v as any)}>
                                <SelectTrigger id="kpi-metric"><SelectValue placeholder="Select a calculation..." /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="count">Total Count</SelectItem>
                                  <SelectItem value="sum">Sum</SelectItem>
                                  <SelectItem value="average">Average</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="kpi-icon">Icon</Label>
                                <Select value={kpiIcon} onValueChange={setKpiIcon}>
                                    <SelectTrigger id="kpi-icon"><SelectValue placeholder="Select an icon..." /></SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(iconComponents).map(iconName => {
                                           const IconComponent = iconComponents[iconName];
                                           return <SelectItem key={iconName} value={iconName}><span className="flex items-center gap-2"><IconComponent/> {iconName}</span></SelectItem>
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    );
                default:
                    return null;
            }
        }
        
        return (
          <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(false)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure New {blockTypeToAdd ? `${blockTypeToAdd.charAt(0).toUpperCase() + blockTypeToAdd.slice(1)} Block` : 'Block'}</DialogTitle>
                <DialogDescription>Add content for your new page block.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {renderForm()}
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Add to Page</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
    }
    
    const renderBlock = (block: Block) => {
        const { id, type, content } = block;

        return (
            <div key={id} className="relative group p-4 border rounded-lg bg-card/50 hover:bg-card/80 transition-colors">
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteBlock(id)}>
                    <Trash2 className="w-4 h-4" />
                </Button>
                {type === 'header' && <h2 className="text-3xl font-bold tracking-tight">{content.text}</h2>}
                {type === 'text' && <p className="text-muted-foreground whitespace-pre-wrap">{content.text}</p>}
                {type === 'image' && content.src && (
                    <div className="relative aspect-video">
                        <Image src={content.src} alt="Custom content" layout="fill" objectFit="contain" className="rounded-md" />
                    </div>
                )}
                {type === 'kpi' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-primary flex items-center justify-between">
                          <span className="flex items-center gap-2">{iconComponents[content.icon] && React.createElement(iconComponents[content.icon], {className: "w-4 h-4"})} {content.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{kpiData[content.id] ?? '...'}</p>
                        <p className="text-xs text-muted-foreground">{`${content.metric} of ${content.dataSource}`}</p>
                      </CardContent>
                    </Card>
                )}
            </div>
        );
    }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2 pl-20">
          <Building2 className="h-6 w-6" />
          <h1 className="text-xl font-semibold">ORGANIZATION PAGE BUILDER</h1>
        </div>
      </header>
       <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 md:grid-cols-[280px_1fr]">
        <aside className="py-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Component Library</CardTitle>
                    <CardDescription>Add content blocks to your page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                    {componentLibrary.map(comp => {
                        const Icon = comp.icon;
                        return (
                            <Button key={comp.type} variant="outline" className="w-full justify-start gap-2" onClick={() => handleAddBlockClick(comp.type)}>
                                <Icon className="h-5 w-5 text-primary"/>
                                <span className="font-medium">{comp.name}</span>
                            </Button>
                        )
                    })}
                    </div>
                </CardContent>
            </Card>
        </aside>
        <div className="py-4 space-y-4">
            <Card className="min-h-[70vh]">
                <CardHeader>
                    <CardTitle>Your Custom Page</CardTitle>
                    <CardDescription>This is a live preview of your organization's page.</CardDescription>
                </CardHeader>
                 <CardContent>
                    {blocks.length === 0 ? (
                         <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-24">
                            <div className="flex flex-col items-center gap-1 text-center">
                                <h3 className="text-2xl font-bold tracking-tight">Your page is empty</h3>
                                <p className="text-sm text-muted-foreground">Add components from the library to get started.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {blocks.map(block => renderBlock(block))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
      {isDialogOpen && <BlockConfigDialog />}
    </div>
  );
}

export default OrganizationPage;

    