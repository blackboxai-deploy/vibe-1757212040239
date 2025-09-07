"use client";

import { useMemo } from "react";
import { format, subDays, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ScanResult {
  id: string;
  data: string;
  timestamp: number;
  type: string;
  format: string;
}

interface AnalyticsDashboardProps {
  history: ScanResult[];
}

const AnalyticsDashboard = ({ history }: AnalyticsDashboardProps) => {
  const analytics = useMemo(() => {
    if (history.length === 0) return null;

    // Type distribution
    const typeStats = history.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Daily activity for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), i));
      const dayScans = history.filter(item => {
        const itemDate = startOfDay(new Date(item.timestamp));
        return itemDate.getTime() === date.getTime();
      }).length;
      
      return {
        date,
        scans: dayScans,
        label: format(date, "MMM dd")
      };
    }).reverse();

    // Hourly distribution
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => {
      const count = history.filter(item => {
        const itemHour = new Date(item.timestamp).getHours();
        return itemHour === hour;
      }).length;
      
      return { hour, count };
    });

    // Peak activity times
    const peakHour = hourlyStats.reduce((max, current) => 
      current.count > max.count ? current : max
    );

    // Most scanned domains (for URLs)
    const domainStats = history
      .filter(item => item.type === "URL")
      .map(item => {
        try {
          const url = new URL(item.data.startsWith("http") ? item.data : `https://${item.data}`);
          return url.hostname;
        } catch {
          return "Invalid URL";
        }
      })
      .reduce((acc, domain) => {
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Recent activity (last 24 hours)
    const last24Hours = history.filter(item => 
      item.timestamp > Date.now() - 24 * 60 * 60 * 1000
    ).length;

    // Average scans per day
    const firstScan = Math.min(...history.map(item => item.timestamp));
    const daysSinceFirst = Math.ceil((Date.now() - firstScan) / (24 * 60 * 60 * 1000));
    const avgPerDay = Math.round(history.length / Math.max(daysSinceFirst, 1));

    // Success rate (assuming all scans in history were successful)
    const successRate = 100; // Since failed scans wouldn't be in history

    // Most active day
    const dailyTotals = last7Days.reduce((max, current) => 
      current.scans > max.scans ? current : max
    );

    return {
      typeStats,
      last7Days,
      hourlyStats,
      peakHour,
      domainStats,
      last24Hours,
      avgPerDay,
      successRate,
      dailyTotals,
      totalScans: history.length,
      uniqueTypes: Object.keys(typeStats).length,
      firstScanDate: new Date(firstScan)
    };
  }, [history]);

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "url": return "bg-blue-500";
      case "email": return "bg-green-500";
      case "phone": return "bg-purple-500";
      case "sms": return "bg-yellow-500";
      case "wifi": return "bg-orange-500";
      case "contact": return "bg-indigo-500";
      case "location": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeBadgeColor = (type: string) => {
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

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 text-gray-400">📊</div>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
          No Analytics Available
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start scanning QR codes to see analytics and insights
        </p>
      </div>
    );
  }

  const maxHourlyCount = Math.max(...analytics.hourlyStats.map(h => h.count));
  const maxDailyCount = Math.max(...analytics.last7Days.map(d => d.scans));

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {analytics.totalScans}
            </div>
            <div className="text-sm text-gray-500">Total Scans</div>
            <div className="text-xs text-gray-400 mt-1">
              Since {format(analytics.firstScanDate, "MMM dd, yyyy")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {analytics.last24Hours}
            </div>
            <div className="text-sm text-gray-500">Last 24 Hours</div>
            <div className="text-xs text-gray-400 mt-1">
              Avg {analytics.avgPerDay}/day
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {analytics.uniqueTypes}
            </div>
            <div className="text-sm text-gray-500">QR Types Used</div>
            <div className="text-xs text-gray-400 mt-1">
              {Object.keys(analytics.typeStats).join(", ")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {analytics.successRate}%
            </div>
            <div className="text-sm text-gray-500">Success Rate</div>
            <div className="text-xs text-gray-400 mt-1">
              All scanned successfully
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>QR Code Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.typeStats)
              .sort(([,a], [,b]) => b - a)
              .map(([type, count]) => {
                const percentage = (count / analytics.totalScans) * 100;
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeBadgeColor(type)}>
                          {type}
                        </Badge>
                        <span className="text-sm font-medium">{count} scans</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Daily Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-end h-32 gap-2">
              {analytics.last7Days.map((day) => (
                <div key={day.label} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex justify-center mb-2">
                    <div
                      className={`w-full ${getTypeColor("url")} rounded-t-lg transition-all duration-300 hover:opacity-80`}
                      style={{
                        height: `${(day.scans / Math.max(maxDailyCount, 1)) * 80}px`,
                        minHeight: day.scans > 0 ? "8px" : "2px"
                      }}
                      title={`${day.scans} scans on ${day.label}`}
                    />
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {day.label}
                  </div>
                  <div className="text-xs text-gray-400">
                    {day.scans}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center text-sm text-gray-500">
              Peak: {analytics.dailyTotals.scans} scans on {analytics.dailyTotals.label}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Activity Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-1">
              {analytics.hourlyStats.map((hour) => (
                <div key={hour.hour} className="text-center">
                  <div
                    className={`h-8 w-8 rounded-lg mx-auto mb-1 flex items-center justify-center text-xs font-medium text-white transition-all duration-200 hover:scale-110`}
                    style={{
                      backgroundColor: hour.count === 0 ? "#e5e7eb" : 
                        `rgba(37, 99, 235, ${0.2 + (hour.count / Math.max(maxHourlyCount, 1)) * 0.8})`
                    }}
                    title={`${hour.count} scans at ${hour.hour}:00`}
                  >
                    {hour.count > 0 ? hour.count : ""}
                  </div>
                  <div className="text-xs text-gray-400">
                    {hour.hour}h
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center text-sm text-gray-500">
              Peak Hour: {analytics.peakHour.hour}:00 with {analytics.peakHour.count} scans
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Most Scanned Domains */}
      {Object.keys(analytics.domainStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Scanned Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.domainStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([domain, count]) => (
                  <div key={domain} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium truncate">
                        {domain}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{count} scans</span>
                      <Badge variant="secondary" className="text-xs">
                        {((count / Object.values(analytics.domainStats).reduce((a: number, b: number) => a + b, 0)) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Most Used Type</h4>
              <div className="flex items-center space-x-2">
                <Badge className={getTypeBadgeColor(Object.entries(analytics.typeStats).sort(([,a], [,b]) => b - a)[0][0])}>
                  {Object.entries(analytics.typeStats).sort(([,a], [,b]) => b - a)[0][0]}
                </Badge>
                <span className="text-sm text-gray-500">
                  {Object.entries(analytics.typeStats).sort(([,a], [,b]) => b - a)[0][1]} scans
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Most Active Day</h4>
              <div className="text-sm">
                <span className="font-medium">{analytics.dailyTotals.label}</span>
                <span className="text-gray-500 ml-2">
                  {analytics.dailyTotals.scans} scans
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Scanning Streak</h4>
              <div className="text-sm">
                <span className="font-medium">{Math.ceil((Date.now() - analytics.firstScanDate.getTime()) / (24 * 60 * 60 * 1000))} days</span>
                <span className="text-gray-500 ml-2">since first scan</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Average Daily</h4>
              <div className="text-sm">
                <span className="font-medium">{analytics.avgPerDay} scans</span>
                <span className="text-gray-500 ml-2">per day</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;