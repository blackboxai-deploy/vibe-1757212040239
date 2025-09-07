"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { saveAs } from "file-saver";

interface ScanResult {
  id: string;
  data: string;
  timestamp: number;
  type: string;
  format: string;
}

interface HistoryManagerProps {
  history: ScanResult[];
  onClearHistory: () => void;
}

const HistoryManager = ({ history, onClearHistory }: HistoryManagerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Filter and sort history
  const filteredHistory = useMemo(() => {
    let filtered = history;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.data.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(item => item.type.toLowerCase() === filterType.toLowerCase());
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case "oldest":
        filtered.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case "type":
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case "data":
        filtered.sort((a, b) => a.data.localeCompare(b.data));
        break;
    }

    return filtered;
  }, [history, searchTerm, filterType, sortBy]);

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "url": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "email": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "phone": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "sms": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "wifi": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "contact": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "location": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleAction = (data: string, type: string) => {
    switch (type.toLowerCase()) {
      case "url":
        window.open(data.startsWith("http") ? data : `https://${data}`, "_blank");
        break;
      case "email":
        window.open(data);
        break;
      case "phone":
        window.open(data);
        break;
      case "sms":
        window.open(data);
        break;
      default:
        navigator.clipboard.writeText(data);
        break;
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const selectAll = () => {
    if (selectedItems.size === filteredHistory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredHistory.map(item => item.id)));
    }
  };

  const deleteSelected = () => {
    // This would need to be handled by the parent component
    // For now, we'll just clear the selection
    setSelectedItems(new Set());
  };

  const exportHistory = () => {
    const exportData = filteredHistory.map(item => ({
      timestamp: format(new Date(item.timestamp), "yyyy-MM-dd HH:mm:ss"),
      type: item.type,
      data: item.data,
      format: item.format
    }));

    const csv = [
      "Timestamp,Type,Data,Format",
      ...exportData.map(item => 
        `"${item.timestamp}","${item.type}","${item.data.replace(/"/g, '""')}","${item.format}"`
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `qr-scan-history-${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const exportSelected = () => {
    const selectedData = filteredHistory
      .filter(item => selectedItems.has(item.id))
      .map(item => ({
        timestamp: format(new Date(item.timestamp), "yyyy-MM-dd HH:mm:ss"),
        type: item.type,
        data: item.data,
        format: item.format
      }));

    const csv = [
      "Timestamp,Type,Data,Format",
      ...selectedData.map(item => 
        `"${item.timestamp}","${item.type}","${item.data.replace(/"/g, '""')}","${item.format}"`
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `qr-scan-history-selected-${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const getUniqueTypes = () => {
    const types = [...new Set(history.map(item => item.type))];
    return types.sort();
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 border border-gray-400 rounded-sm"></div>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
          No Scan History
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start scanning QR codes to see your history here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {getUniqueTypes().map(type => (
              <SelectItem key={type} value={type.toLowerCase()}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="type">By Type</SelectItem>
            <SelectItem value="data">By Content</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex space-x-2">
          <Button onClick={exportHistory} variant="outline" size="sm" className="flex-1">
            Export All
          </Button>
          <Button onClick={onClearHistory} variant="destructive" size="sm" className="flex-1">
            Clear All
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <Alert>
          <AlertDescription className="flex justify-between items-center">
            <span>{selectedItems.size} item(s) selected</span>
            <div className="flex space-x-2">
              <Button onClick={exportSelected} variant="outline" size="sm">
                Export Selected
              </Button>
              <Button onClick={deleteSelected} variant="destructive" size="sm">
                Delete Selected
              </Button>
              <Button onClick={() => setSelectedItems(new Set())} variant="ghost" size="sm">
                Clear Selection
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{history.length}</div>
            <div className="text-sm text-gray-500">Total Scans</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">{filteredHistory.length}</div>
            <div className="text-sm text-gray-500">Filtered Results</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{getUniqueTypes().length}</div>
            <div className="text-sm text-gray-500">Unique Types</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {history.length > 0 ? Math.round((Date.now() - history[history.length - 1].timestamp) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <div className="text-sm text-gray-500">Days Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Selection Controls */}
      <div className="flex justify-between items-center">
        <Button
          onClick={selectAll}
          variant="outline"
          size="sm"
        >
          {selectedItems.size === filteredHistory.length ? "Deselect All" : "Select All"}
        </Button>
        
        <div className="text-sm text-gray-500">
          Showing {filteredHistory.length} of {history.length} items
        </div>
      </div>

      {/* History Items */}
      <div className="space-y-4">
        {filteredHistory.map((item) => (
          <Card key={item.id} className={`transition-all duration-200 hover:shadow-md ${
            selectedItems.has(item.id) ? "ring-2 ring-blue-500" : ""
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getTypeColor(item.type)}>
                        {item.type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {format(new Date(item.timestamp), "MMM dd, yyyy HH:mm")}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg mb-3">
                      <code className="text-sm break-all whitespace-pre-wrap">
                        {item.data}
                      </code>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleAction(item.data, item.type)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {item.type.toLowerCase() === "url" ? "Open Link" : 
                         item.type.toLowerCase() === "email" ? "Send Email" :
                         item.type.toLowerCase() === "phone" ? "Call" :
                         item.type.toLowerCase() === "sms" ? "Send SMS" :
                         "Use"}
                      </Button>
                      
                      <Button
                        onClick={() => navigator.clipboard.writeText(item.data)}
                        variant="outline"
                        size="sm"
                      >
                        Copy
                      </Button>
                      
                      <Button
                        onClick={() => navigator.share?.({ 
                          title: "QR Code Data", 
                          text: item.data 
                        })}
                        variant="outline"
                        size="sm"
                      >
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHistory.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No results found for "{searchTerm}"
          </p>
          <Button
            onClick={() => setSearchTerm("")}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
};

export default HistoryManager;