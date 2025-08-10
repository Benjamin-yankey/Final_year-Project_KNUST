import React, { FC, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart,
  Area,
} from "recharts";
import { RefreshCw, Home, Settings } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend: "up" | "down" | "neutral";
  icon: string;
  color?: "red" | "orange" | "yellow" | "blue" | "green";
}

const MetricCard: FC<MetricCardProps> = ({ title, value, subtitle, trend, icon, color = "green" }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${color === "red" ? "#fee2e2" : color === "orange" ? "#fff7ed" : color === "yellow" ? "#fffbeb" : color === "blue" ? "#eef2ff" : "#ecfdf5"}` }}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div
        className={`flex items-center space-x-1 text-sm ${
          trend === "down" ? "text-green-600" : trend === "up" ? "text-red-600" : "text-gray-600"
        }`}
      >
        <span>{trend === "down" ? "↘️" : trend === "up" ? "↗️" : "➡️"}</span>
        <span className="font-medium">{subtitle}</span>
      </div>
    </div>
    <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-gray-600 text-sm">{title}</p>
  </div>
);

const TimeRangeButton: FC<{ range: string; label: string; active: boolean; onClick: () => void }> = ({ range, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
      active ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    {label}
  </button>
);

const ViewButton: FC<{ view: string; label: string; active: boolean; onClick: () => void }> = ({ view, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
      active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    {label}
  </button>
);

const FalsePositiveRatePage: FC = () => {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");
  const [selectedView, setSelectedView] = useState<"overview" | "causes" | "fields" | "correlation">("overview");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedField, setSelectedField] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data for false positive trends
  const falsePositiveData: Record<string, any[]> = {
    "24h": [
      { time: "00:00", rate: 2.8, total: 45, falsePos: 1, accuracy: 97.2, confidence: 92.3 },
      { time: "04:00", rate: 1.9, total: 38, falsePos: 1, accuracy: 98.1, confidence: 94.1 },
      { time: "08:00", rate: 3.2, total: 67, falsePos: 2, accuracy: 96.8, confidence: 91.7 },
      { time: "12:00", rate: 2.1, total: 89, falsePos: 2, accuracy: 97.9, confidence: 93.8 },
      { time: "16:00", rate: 1.4, total: 72, falsePos: 1, accuracy: 98.6, confidence: 95.2 },
      { time: "20:00", rate: 2.7, total: 56, falsePos: 2, accuracy: 97.3, confidence: 92.9 },
    ],
    "7d": [
      { time: "Mon", rate: 2.3, total: 234, falsePos: 5, accuracy: 97.7, confidence: 93.4 },
      { time: "Tue", rate: 1.8, total: 189, falsePos: 3, accuracy: 98.2, confidence: 94.7 },
      { time: "Wed", rate: 3.1, total: 267, falsePos: 8, accuracy: 96.9, confidence: 91.8 },
      { time: "Thu", rate: 1.5, total: 198, falsePos: 3, accuracy: 98.5, confidence: 95.1 },
      { time: "Fri", rate: 2.9, total: 245, falsePos: 7, accuracy: 97.1, confidence: 92.6 },
      { time: "Sat", rate: 3.4, total: 156, falsePos: 5, accuracy: 96.6, confidence: 90.9 },
      { time: "Sun", rate: 2.1, total: 178, falsePos: 4, accuracy: 97.9, confidence: 93.7 },
    ],
    "30d": [
      { time: "Week 1", rate: 2.4, total: 1456, falsePos: 35, accuracy: 97.6, confidence: 93.2 },
      { time: "Week 2", rate: 1.9, total: 1678, falsePos: 32, accuracy: 98.1, confidence: 94.1 },
      { time: "Week 3", rate: 3.2, total: 1534, falsePos: 49, accuracy: 96.8, confidence: 91.5 },
      { time: "Week 4", rate: 2.1, total: 1789, falsePos: 38, accuracy: 97.9, confidence: 93.8 },
    ],
  };

  // False positive causes
  const falsePositiveCauses = [
    { cause: "Similar Vegetation", count: 45, percentage: 32.8, color: "#ef4444", description: "Plants that resemble target weeds" },
    { cause: "Shadows/Lighting", count: 28, percentage: 20.4, color: "#f97316", description: "Poor lighting conditions affecting detection" },
    { cause: "Image Quality", count: 22, percentage: 16.1, color: "#eab308", description: "Blurry or low-resolution images" },
    { cause: "Background Noise", count: 19, percentage: 13.9, color: "#22c55e", description: "Complex background patterns" },
    { cause: "Edge Cases", count: 15, percentage: 10.9, color: "#3b82f6", description: "Unusual growth patterns or stages" },
    { cause: "Sensor Issues", count: 8, percentage: 5.9, color: "#8b5cf6", description: "Hardware-related detection errors" },
  ];

  // Field-specific false positive rates
  const fieldFalsePositives = [
    { field: "Field A-1", rate: 1.8, trend: "down", lastWeek: 2.3, detections: 456, environment: "Open field", soil: "Clay" },
    { field: "Field A-2", rate: 3.2, trend: "up", lastWeek: 2.1, detections: 324, environment: "Near trees", soil: "Sandy" },
    { field: "Field B-1", rate: 2.1, trend: "stable", lastWeek: 2.0, detections: 578, environment: "Open field", soil: "Loam" },
    { field: "Field B-2", rate: 4.1, trend: "up", lastWeek: 3.4, detections: 289, environment: "Mixed terrain", soil: "Clay-loam" },
    { field: "Field C-1", rate: 1.4, trend: "down", lastWeek: 1.9, detections: 612, environment: "Flat terrain", soil: "Sandy-loam" },
    { field: "Field C-2", rate: 2.8, trend: "stable", lastWeek: 2.7, detections: 367, environment: "Sloped", soil: "Clay" },
  ];

  // Time-based analysis
  const timeAnalysis = [
    { period: "Morning (6-12)", rate: 1.8, conditions: "Optimal lighting", quality: "High" },
    { period: "Afternoon (12-18)", rate: 2.4, conditions: "Harsh shadows", quality: "Medium" },
    { period: "Evening (18-20)", rate: 3.1, conditions: "Low light", quality: "Low" },
    { period: "Night (20-6)", rate: 4.2, conditions: "Artificial lighting", quality: "Variable" },
  ];

  // Confidence vs False Positive correlation
  const confidenceAnalysis = [
    { confidence: 95, falsePositive: 0.8, detections: 892 },
    { confidence: 90, falsePositive: 1.2, detections: 567 },
    { confidence: 85, falsePositive: 2.1, detections: 423 },
    { confidence: 80, falsePositive: 3.8, detections: 298 },
    { confidence: 75, falsePositive: 6.2, detections: 156 },
    { confidence: 70, falsePositive: 9.1, detections: 89 },
  ];

  const currentData = falsePositiveData[timeRange] ?? [];
  const currentRate = currentData[currentData.length - 1]?.rate ?? 0;
  const avgRate = currentData.length ? currentData.reduce((sum: number, item: any) => sum + (item.rate ?? 0), 0) / currentData.length : 0;
  const totalFalsePositives = currentData.reduce((sum: number, item: any) => sum + (item.falsePos ?? 0), 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // placeholder refresh simulation - replace with real refresh logic (API call)
    await new Promise((res) => setTimeout(res, 800));
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                False Positive Rate
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:block">Refresh</span>
              </button>
              <a href="/" className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Home className="w-4 h-4" />
                <span className="hidden sm:block">Dashboard</span>
              </a>
              <a href="/Settings" className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:block">Settings</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-b-lg shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">False Positive Rate Analysis</h1>
              <p className="mt-2 text-gray-600">Monitor and analyze incorrect weed detections to improve system accuracy</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field Selection</label>
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Fields</option>
                  <option value="field-a">Field A (1-2)</option>
                  <option value="field-b">Field B (1-2)</option>
                  <option value="field-c">Field C (1-2)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Threshold</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <option value="70">70% and above</option>
                  <option value="80">80% and above</option>
                  <option value="90">90% and above</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detection Type</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <option value="all">All Types</option>
                  <option value="dandelions">Dandelions</option>
                  <option value="plantain">Plantain</option>
                  <option value="clover">Clover</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <option value="all">All Day</option>
                  <option value="morning">Morning (6-12)</option>
                  <option value="afternoon">Afternoon (12-18)</option>
                  <option value="evening">Evening (18-20)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Current False Positive Rate"
            value={`${currentRate.toFixed(1)}%`}
            subtitle="-0.4%"
            trend="down"
            icon="⚠️"
            color="red"
          />
          <MetricCard
            title="Average Rate (Period)"
            value={`${avgRate.toFixed(1)}%`}
            subtitle="Last 7 days"
            trend="down"
            icon="📊"
            color="orange"
          />
          <MetricCard
            title="Total False Positives"
            value={totalFalsePositives.toString()}
            subtitle="-12"
            trend="down"
            icon="🚫"
            color="yellow"
          />
          <MetricCard
            title="Impact on Accuracy"
            value="-2.1%"
            subtitle="Potential gain"
            trend="neutral"
            icon="🎯"
            color="blue"
          />
        </div>

        {/* View Selector */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Analysis Views</h2>
            <div className="flex flex-wrap gap-2">
              <ViewButton view="overview" label="Overview" active={selectedView === "overview"} onClick={() => setSelectedView("overview")} />
              <ViewButton view="causes" label="Root Causes" active={selectedView === "causes"} onClick={() => setSelectedView("causes")} />
              <ViewButton view="fields" label="Field Analysis" active={selectedView === "fields"} onClick={() => setSelectedView("fields")} />
              <ViewButton view="correlation" label="Correlations" active={selectedView === "correlation"} onClick={() => setSelectedView("correlation")} />
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex space-x-2 mb-6">
            <TimeRangeButton range="24h" label="24 Hours" active={timeRange === "24h"} onClick={() => setTimeRange("24h")} />
            <TimeRangeButton range="7d" label="7 Days" active={timeRange === "7d"} onClick={() => setTimeRange("7d")} />
            <TimeRangeButton range="30d" label="30 Days" active={timeRange === "30d"} onClick={() => setTimeRange("30d")} />
          </div>

          {/* Overview Chart */}
          {selectedView === "overview" && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#666" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#666" fontSize={12} tickFormatter={(value) => `${value}%`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="rate" fill="#fecaca" stroke="#ef4444" strokeWidth={3} fillOpacity={0.3} />
                  <Bar yAxisId="right" dataKey="falsePos" fill="#f87171" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Root Causes Analysis */}
          {selectedView === "causes" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Causes</h3>
                <div className="space-y-4">
                  {falsePositiveCauses.map((cause, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{cause.cause}</h4>
                          <p className="text-sm text-gray-600">{cause.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">{cause.count}</span>
                          <p className="text-sm text-gray-600">{cause.percentage}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${cause.percentage}%`,
                            backgroundColor: cause.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cause Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={falsePositiveCauses} cx="50%" cy="50%" labelLine={false} label={(entry: any) => `${entry.cause}: ${entry.percentage}%`} outerRadius={100} fill="#8884d8" dataKey="count" nameKey="cause">
                        {falsePositiveCauses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Field Analysis */}
          {selectedView === "fields" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {fieldFalsePositives.map((field, index) => (
                  <div key={index} className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{field.field}</h4>
                        <p className="text-sm text-gray-600">{field.environment} • {field.soil} soil</p>
                      </div>
                      <div className={`flex items-center space-x-1 text-sm ${field.trend === "down" ? "text-green-600" : field.trend === "up" ? "text-red-600" : "text-gray-600"}`}>
                        <span>{field.trend === "down" ? "↘️" : field.trend === "up" ? "↗️" : "➡️"}</span>
                        <span className="font-medium">{field.trend}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{field.rate}%</div>
                        <div className="text-xs text-gray-600">Current Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{field.lastWeek}%</div>
                        <div className="text-xs text-gray-600">Last Week</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{field.detections}</div>
                        <div className="text-xs text-gray-600">Detections</div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${field.rate <= 2 ? "bg-green-500" : field.rate <= 3 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${Math.min(field.rate * 20, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Time-Based Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {timeAnalysis.map((period, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-2">{period.period}</h4>
                      <div className="text-2xl font-bold text-red-600 mb-1">{period.rate}%</div>
                      <p className="text-sm text-gray-600 mb-2">{period.conditions}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${period.quality === "High" ? "bg-green-100 text-green-800" : period.quality === "Medium" ? "bg-yellow-100 text-yellow-800" : period.quality === "Low" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>
                        {period.quality} Quality
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Correlation Analysis */}
          {selectedView === "correlation" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence vs False Positive Rate</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="confidence" stroke="#666" fontSize={12} tickFormatter={(value) => `${value}%`} />
                        <YAxis dataKey="falsePositive" stroke="#666" fontSize={12} tickFormatter={(value) => `${value}%`} />
                        <Tooltip
                          formatter={(value: any, name: any) => [
                            name === "falsePositive" ? `${value}%` : value,
                            name === "falsePositive" ? "False Positive Rate" : name === "confidence" ? "Confidence Level" : "Detections",
                          ]}
                        />
                        <Scatter data={confidenceAnalysis} dataKey="falsePositive" fill="#ef4444" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trend Comparison</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={falsePositiveData["7d"]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="time" stroke="#666" fontSize={12} />
                        <YAxis stroke="#666" fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={3} name="False Positive Rate (%)" />
                        <Line type="monotone" dataKey="confidence" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Avg Confidence (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
                <h3 className="text-lg font-semibold text-red-800 mb-4">🔍 Key Insights & Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Critical Issues</h4>
                    <ul className="space-y-2 text-sm text-red-600">
                      <li>• Field B-2 shows concerning 4.1% false positive rate</li>
                      <li>• Afternoon periods consistently show higher error rates</li>
                      <li>• Similar vegetation causing 32.8% of false positives</li>
                      <li>• Confidence levels below 80% correlate with higher errors</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Recommended Actions</h4>
                    <ul className="space-y-2 text-sm text-red-600">
                      <li>• Increase minimum confidence threshold to 85%</li>
                      <li>• Schedule additional training for similar vegetation</li>
                      <li>• Optimize lighting conditions for afternoon scans</li>
                      <li>• Review Field B-2 environmental factors</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
            Download False Positive Report
          </button>
          <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
            Schedule Model Retraining
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Adjust Detection Thresholds
          </button>
          <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
            View Training Data
          </button>
        </div>
      </div>

      <footer className="bg-green-600 text-white py-8 px-6 mt-16">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm">
          <div className="text-center md:text-left mb-4 md:mb-0">© {new Date().getFullYear()} Weed Detection Dashboard. All rights reserved.</div>
          <div className="flex space-x-6">
            <a href="/docs" className="hover:underline hover:text-green-200 transition-colors">📄 Documentation</a>
            <a href="/support" className="hover:underline hover:text-green-200 transition-colors">🛠 Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FalsePositiveRatePage;
