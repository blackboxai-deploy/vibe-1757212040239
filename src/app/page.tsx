"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import QRScannerComponent from "@/components/qr-scanner/QRScannerComponent";
import QRGeneratorComponent from "@/components/qr-generator/QRGeneratorComponent";
import HistoryManager from "@/components/history/HistoryManager";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import { useTheme } from "next-themes";

interface ScanResult {
  id: string;
  data: string;
  timestamp: number;
  type: string;
  format: string;
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [activeTab, setActiveTab] = useState("scanner");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    // Load scan history from localStorage
    const savedHistory = localStorage.getItem("qr-scan-history");
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addToHistory = (result: ScanResult) => {
    const newHistory = [result, ...scanHistory];
    setScanHistory(newHistory);
    localStorage.setItem("qr-scan-history", JSON.stringify(newHistory));
    toast.success("QR Code scanned successfully!");
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem("qr-scan-history");
    toast.success("History cleared!");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  QR Scanner Pro
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Advanced QR Code Scanner & Generator
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {scanHistory.length} Scans
              </Badge>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="theme-switch" className="text-sm">Dark</Label>
                <Switch
                  id="theme-switch"
                  checked={theme === "light"}
                  onCheckedChange={(checked) => setTheme(checked ? "light" : "dark")}
                />
                <Label htmlFor="theme-switch" className="text-sm">Light</Label>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white dark:bg-slate-800 shadow-lg">
            <TabsTrigger value="scanner" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Scanner
            </TabsTrigger>
            <TabsTrigger value="generator" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Generator
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-6">
            <Card className="shadow-xl bg-white/80 backdrop-blur dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">QR Code Scanner</CardTitle>
                <CardDescription className="text-center">
                  Point your camera at a QR code to scan it instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QRScannerComponent onScan={addToHistory} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generator" className="space-y-6">
            <Card className="shadow-xl bg-white/80 backdrop-blur dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">QR Code Generator</CardTitle>
                <CardDescription className="text-center">
                  Create custom QR codes with various formats and styling options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QRGeneratorComponent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="shadow-xl bg-white/80 backdrop-blur dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Scan History</CardTitle>
                <CardDescription className="text-center">
                  View and manage your QR code scan history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HistoryManager 
                  history={scanHistory} 
                  onClearHistory={clearHistory}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="shadow-xl bg-white/80 backdrop-blur dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Analytics Dashboard</CardTitle>
                <CardDescription className="text-center">
                  Insights and statistics from your QR code usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsDashboard history={scanHistory} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}