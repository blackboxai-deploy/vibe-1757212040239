"use client";

import { useState, useRef } from "react";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

const QRGeneratorComponent = () => {
  const [qrText, setQrText] = useState("");
  const [qrType, setQrType] = useState("text");
  const [qrSize, setQrSize] = useState(300);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [generatedQR, setGeneratedQR] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("png");
  const [errorCorrection, setErrorCorrection] = useState("M");


  // Form fields for different QR types
  const [urlData, setUrlData] = useState("");
  const [emailData, setEmailData] = useState({ email: "", subject: "", body: "" });
  const [phoneData, setPhoneData] = useState("");
  const [smsData, setSmsData] = useState({ number: "", message: "" });
  const [wifiData, setWifiData] = useState({ ssid: "", password: "", security: "WPA", hidden: false });
  const [contactData, setContactData] = useState({
    firstName: "", lastName: "", phone: "", email: "", organization: ""
  });

  const generateQRCode = async () => {
    if (!qrText && qrType === "text") return;
    
    setIsGenerating(true);
    
    try {
      let dataString = "";
      
      // Format data based on QR type
      switch (qrType) {
        case "url":
          dataString = urlData.startsWith("http") ? urlData : `https://${urlData}`;
          break;
        case "email":
          dataString = `mailto:${emailData.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
          break;
        case "phone":
          dataString = `tel:${phoneData}`;
          break;
        case "sms":
          dataString = `sms:${smsData.number}?body=${encodeURIComponent(smsData.message)}`;
          break;
        case "wifi":
          dataString = `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};H:${wifiData.hidden ? 'true' : 'false'};;`;
          break;
        case "contact":
          dataString = `BEGIN:VCARD
VERSION:3.0
FN:${contactData.firstName} ${contactData.lastName}
ORG:${contactData.organization}
TEL:${contactData.phone}
EMAIL:${contactData.email}
END:VCARD`;
          break;
        default:
          dataString = qrText;
      }

      const qrCodeDataURL = await QRCode.toDataURL(dataString, {
        width: qrSize,
        margin: 2,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        errorCorrectionLevel: errorCorrection as 'L' | 'M' | 'Q' | 'H',
      });

      setGeneratedQR(qrCodeDataURL);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!generatedQR) return;

    const link = document.createElement("a");
    link.download = `qr-code-${Date.now()}.${downloadFormat}`;
    link.href = generatedQR;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    if (!generatedQR) return;
    
    try {
      const response = await fetch(generatedQR);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const clearForm = () => {
    setQrText("");
    setUrlData("");
    setEmailData({ email: "", subject: "", body: "" });
    setPhoneData("");
    setSmsData({ number: "", message: "" });
    setWifiData({ ssid: "", password: "", security: "WPA", hidden: false });
    setContactData({ firstName: "", lastName: "", phone: "", email: "", organization: "" });
    setGeneratedQR("");
  };

  const getQRTypeColor = (type: string) => {
    switch (type) {
      case "url": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "email": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "phone": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "sms": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "wifi": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "contact": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const renderFormFields = () => {
    switch (qrType) {
      case "url":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={urlData}
                onChange={(e) => setUrlData(e.target.value)}
              />
            </div>
          </div>
        );

      case "email":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                value={emailData.email}
                onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Email message"
                value={emailData.body}
                onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        );

      case "phone":
        return (
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phoneData}
              onChange={(e) => setPhoneData(e.target.value)}
            />
          </div>
        );

      case "sms":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="smsNumber">Phone Number</Label>
              <Input
                id="smsNumber"
                type="tel"
                placeholder="+1234567890"
                value={smsData.number}
                onChange={(e) => setSmsData(prev => ({ ...prev, number: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="smsMessage">Message</Label>
              <Textarea
                id="smsMessage"
                placeholder="Your message here"
                value={smsData.message}
                onChange={(e) => setSmsData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        );

      case "wifi":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ssid">Network Name (SSID)</Label>
              <Input
                id="ssid"
                placeholder="MyWiFiNetwork"
                value={wifiData.ssid}
                onChange={(e) => setWifiData(prev => ({ ...prev, ssid: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="WiFi password"
                value={wifiData.password}
                onChange={(e) => setWifiData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="security">Security Type</Label>
              <Select
                value={wifiData.security}
                onValueChange={(value) => setWifiData(prev => ({ ...prev, security: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">No Password</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="hidden"
                checked={wifiData.hidden}
                onCheckedChange={(checked) => setWifiData(prev => ({ ...prev, hidden: checked }))}
              />
              <Label htmlFor="hidden">Hidden Network</Label>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={contactData.firstName}
                  onChange={(e) => setContactData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={contactData.lastName}
                  onChange={(e) => setContactData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="+1234567890"
                value={contactData.phone}
                onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="john@example.com"
                value={contactData.email}
                onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                placeholder="Company Name"
                value={contactData.organization}
                onChange={(e) => setContactData(prev => ({ ...prev, organization: e.target.value }))}
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Label htmlFor="text">Text Content</Label>
            <Textarea
              id="text"
              placeholder="Enter your text here"
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
              rows={4}
            />
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Generator Form */}
      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold">QR Code Type</Label>
          <Select value={qrType} onValueChange={setQrType}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Plain Text</SelectItem>
              <SelectItem value="url">Website URL</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone Number</SelectItem>
              <SelectItem value="sms">SMS Message</SelectItem>
              <SelectItem value="wifi">WiFi Network</SelectItem>
              <SelectItem value="contact">Contact Card</SelectItem>
            </SelectContent>
          </Select>
          <Badge className={`mt-2 ${getQRTypeColor(qrType)}`}>
            {qrType.toUpperCase()}
          </Badge>
        </div>

        {/* Dynamic Form Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content</CardTitle>
          </CardHeader>
          <CardContent>
            {renderFormFields()}
          </CardContent>
        </Card>

        {/* Customization Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Size: {qrSize}px</Label>
              <Slider
                value={[qrSize]}
                onValueChange={(value) => setQrSize(value[0])}
                max={500}
                min={100}
                step={25}
                className="mt-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bgColor">Background</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    id="bgColor"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="fgColor">Foreground</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    id="fgColor"
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label>Error Correction Level</Label>
              <Select value={errorCorrection} onValueChange={setErrorCorrection}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Low (~7%)</SelectItem>
                  <SelectItem value="M">Medium (~15%)</SelectItem>
                  <SelectItem value="Q">Quartile (~25%)</SelectItem>
                  <SelectItem value="H">High (~30%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            onClick={generateQRCode}
            disabled={isGenerating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
          >
            {isGenerating ? "Generating..." : "Generate QR Code"}
          </Button>
          
          <Button
            onClick={clearForm}
            variant="outline"
            className="flex-1"
          >
            Clear Form
          </Button>
        </div>
      </div>

      {/* Generated QR Code */}
      <div className="space-y-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg text-center">Generated QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedQR ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg shadow-inner">
                    <img
                      src={generatedQR}
                      alt="Generated QR Code"
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>
                
                {/* Download Options */}
                <div className="space-y-4">
                  <div>
                    <Label>Download Format</Label>
                    <Select value={downloadFormat} onValueChange={setDownloadFormat}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpg">JPG</SelectItem>
                        <SelectItem value="svg">SVG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={downloadQR}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Download
                    </Button>
                    
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 border border-gray-400 rounded-sm"></div>
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Your QR code will appear here
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Fill in the form and click "Generate QR Code"
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Info */}
        {generatedQR && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">{qrSize}px</div>
                  <div className="text-sm text-gray-500">Dimensions</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">{errorCorrection}</div>
                  <div className="text-sm text-gray-500">Error Correction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QRGeneratorComponent;