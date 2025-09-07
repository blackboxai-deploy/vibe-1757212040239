"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Alert, AlertDescription } from "@/components/ui/alert";

interface QRScannerProps {
  onScan: (result: {
    id: string;
    data: string;
    timestamp: number;
    type: string;
    format: string;
  }) => void;
}

const QRScannerComponent = ({ onScan }: QRScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [scanCount, setScanCount] = useState(0);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerElementRef = useRef<HTMLDivElement>(null);

  const startScanner = () => {
    if (!scannerElementRef.current) return;

    setScanning(true);
    setError("");

    const config = {
      fps: 10,
      qrbox: {
        width: 300,
        height: 300,
      },
      aspectRatio: 1.0,
    };

    scannerRef.current = new Html5QrcodeScanner(
      "qr-scanner",
      config,
      false
    );

    scannerRef.current.render(
      (decodedText: string, decodedResult: any) => {
        // Success callback
        const resultType = detectQRType(decodedText);
        const result = {
          id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          data: decodedText,
          timestamp: Date.now(),
          type: resultType,
          format: decodedResult.format || "QR_CODE",
        };

        setLastResult(decodedText);
        setScanCount(prev => prev + 1);
        onScan(result);

        // Vibrate if supported
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }

        // Stop scanner after successful scan
        stopScanner();
      },
      (errorMessage: string) => {
        // Error callback (can be ignored for continuous scanning)
        console.log(`QR scan error: ${errorMessage}`);
      }
    );
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const detectQRType = (data: string): string => {
    if (data.startsWith("http://") || data.startsWith("https://")) {
      return "URL";
    } else if (data.startsWith("mailto:")) {
      return "Email";
    } else if (data.startsWith("tel:")) {
      return "Phone";
    } else if (data.startsWith("sms:")) {
      return "SMS";
    } else if (data.startsWith("wifi:")) {
      return "WiFi";
    } else if (data.startsWith("geo:")) {
      return "Location";
    } else if (data.includes("BEGIN:VCARD")) {
      return "Contact";
    } else {
      return "Text";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "URL": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Email": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Phone": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "WiFi": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Location": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Contact": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleAction = (data: string, type: string) => {
    switch (type) {
      case "URL":
        window.open(data, "_blank");
        break;
      case "Email":
        window.open(data);
        break;
      case "Phone":
        window.open(data);
        break;
      case "SMS":
        window.open(data);
        break;
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(data);
        break;
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Scanner Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={startScanner}
          disabled={scanning}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          {scanning ? "Scanning..." : "Start Scanner"}
        </Button>
        
        {scanning && (
          <Button
            onClick={stopScanner}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 px-8 py-3 rounded-lg font-semibold shadow-lg"
          >
            Stop Scanner
          </Button>
        )}
      </div>

      {/* Scanner Area */}
      <div className="flex justify-center">
        <div className="relative">
          <div
            id="qr-scanner"
            ref={scannerElementRef}
            className="w-full max-w-md mx-auto"
            style={{
              border: scanning ? "2px solid #2563eb" : "2px dashed #cbd5e1",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: scanning ? "transparent" : "#f8fafc",
            }}
          >
            {!scanning && (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-blue-600 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-600 rounded-sm"></div>
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Click "Start Scanner" to begin
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Point your camera at a QR code
                </p>
              </div>
            )}
          </div>
          
          {scanning && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Live</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{scanCount}</div>
            <div className="text-sm text-gray-500">Total Scans</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {scanning ? "1" : "0"}
            </div>
            <div className="text-sm text-gray-500">Active Sessions</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((scanCount / Math.max(1, scanCount + (error ? 1 : 0))) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Last Result */}
      {lastResult && (
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg">Last Scan Result</h3>
              <Badge className={getTypeColor(detectQRType(lastResult))}>
                {detectQRType(lastResult)}
              </Badge>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
              <code className="text-sm break-all">{lastResult}</code>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleAction(lastResult, detectQRType(lastResult))}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {detectQRType(lastResult) === "URL" ? "Open Link" : 
                 detectQRType(lastResult) === "Email" ? "Send Email" :
                 detectQRType(lastResult) === "Phone" ? "Call" :
                 "Copy to Clipboard"}
              </Button>
              
              <Button
                onClick={() => navigator.clipboard.writeText(lastResult)}
                variant="outline"
                size="sm"
              >
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2">
        <p>• Make sure your camera has permission to access</p>
        <p>• Hold the QR code steady in the scanning area</p>
        <p>• Ensure good lighting for better scan results</p>
      </div>
    </div>
  );
};

export default QRScannerComponent;