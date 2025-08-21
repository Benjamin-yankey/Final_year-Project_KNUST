import React, { useState } from "react";
import PageLayout from "../components/ui/PageLayout";
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
  AreaChart,
  Area,
} from "recharts";

const AccuracyPage = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("overall");
  const [showDetails, setShowDetails] = useState(false);

  // Mock data for different time ranges
  const accuracyData = {
    "24h": [
      {
        time: "00:00",
        accuracy: 94.2,
        detections: 45,
        precision: 93.1,
        recall: 95.3,
        f1Score: 94.2,
      },
      {
        time: "04:00",
        accuracy: 95.1,
        detections: 38,
        precision: 94.5,
        recall: 95.7,
        f1Score: 95.1,
      },
      {
        time: "08:00",
        accuracy: 96.8,
        detections: 67,
        precision: 96.2,
        recall: 97.4,
        f1Score: 96.8,
      },
      {
        time: "12:00",
        accuracy: 95.4,
        detections: 89,
        precision: 94.8,
        recall: 96.0,
        f1Score: 95.4,
      },
      {
        time: "16:00",
        accuracy: 97.2,
        detections: 72,
        precision: 96.9,
        recall: 97.5,
        f1Score: 97.2,
      },
      {
        time: "20:00",
        accuracy: 94.7,
        detections: 56,
        precision: 93.9,
        recall: 95.5,
        f1Score: 94.7,
      },
    ],
    "7d": [
      {
        time: "Mon",
        accuracy: 95.2,
        detections: 234,
        precision: 94.8,
        recall: 95.6,
        f1Score: 95.2,
      },
      {
        time: "Tue",
        accuracy: 96.1,
        detections: 189,
        precision: 95.7,
        recall: 96.5,
        f1Score: 96.1,
      },
      {
        time: "Wed",
        accuracy: 94.8,
        detections: 267,
        precision: 94.2,
        recall: 95.4,
        f1Score: 94.8,
      },
      {
        time: "Thu",
        accuracy: 97.3,
        detections: 198,
        precision: 96.9,
        recall: 97.7,
        f1Score: 97.3,
      },
      {
        time: "Fri",
        accuracy: 95.9,
        detections: 245,
        precision: 95.4,
        recall: 96.4,
        f1Score: 95.9,
      },
      {
        time: "Sat",
        accuracy: 94.5,
        detections: 156,
        precision: 93.8,
        recall: 95.2,
        f1Score: 94.5,
      },
      {
        time: "Sun",
        accuracy: 96.7,
        detections: 178,
        precision: 96.2,
        recall: 97.2,
        f1Score: 96.7,
      },
    ],
    "30d": [
      {
        time: "Week 1",
        accuracy: 95.4,
        detections: 1456,
        precision: 94.9,
        recall: 95.9,
        f1Score: 95.4,
      },
      {
        time: "Week 2",
        accuracy: 96.2,
        detections: 1678,
        precision: 95.8,
        recall: 96.6,
        f1Score: 96.2,
      },
      {
        time: "Week 3",
        accuracy: 94.9,
        detections: 1534,
        precision: 94.3,
        recall: 95.5,
        f1Score: 94.9,
      },
      {
        time: "Week 4",
        accuracy: 97.1,
        detections: 1789,
        precision: 96.7,
        recall: 97.5,
        f1Score: 97.1,
      },
    ],
  };

  const weedTypeAccuracy = [
    { name: "Dandelions", accuracy: 97.8, count: 456, color: "#22c55e" },
    { name: "Plantain", accuracy: 95.2, count: 324, color: "#16a34a" },
    { name: "Clover", accuracy: 93.6, count: 278, color: "#15803d" },
    { name: "Crabgrass", accuracy: 91.4, count: 189, color: "#166534" },
    { name: "Chickweed", accuracy: 89.7, count: 145, color: "#14532d" },
    { name: "Other", accuracy: 87.3, count: 98, color: "#052e16" },
  ];

  const fieldAccuracy = [
    { field: "Field A-1", accuracy: 96.8, area: "12.4 ha", lastScan: "2h ago" },
    { field: "Field A-2", accuracy: 95.3, area: "8.7 ha", lastScan: "1h ago" },
    {
      field: "Field B-1",
      accuracy: 97.2,
      area: "15.6 ha",
      lastScan: "30m ago",
    },
    { field: "Field B-2", accuracy: 94.1, area: "9.8 ha", lastScan: "3h ago" },
    {
      field: "Field C-1",
      accuracy: 98.1,
      area: "11.2 ha",
      lastScan: "45m ago",
    },
    { field: "Field C-2", accuracy: 93.7, area: "7.9 ha", lastScan: "2h ago" },
  ];

  const confusionMatrix = [
    { predicted: "Weed", actual: "Weed", count: 1847, percentage: 92.4 },
    { predicted: "Weed", actual: "No Weed", count: 76, percentage: 3.8 },
    { predicted: "No Weed", actual: "Weed", count: 45, percentage: 2.3 },
    { predicted: "No Weed", actual: "No Weed", count: 32, percentage: 1.5 },
  ];

  const currentData = accuracyData[timeRange];
  const currentAccuracy = currentData[currentData.length - 1]?.accuracy || 0;
  const avgAccuracy =
    currentData.reduce((sum, item) => sum + item.accuracy, 0) /
    currentData.length;

  const MetricCard = ({
    title,
    value,
    subtitle,
    trend,
    icon,
  }: {
    title: string;
    value: string;
    subtitle: string;
    trend: "up" | "down" | "neutral";
    icon: string;
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-green-100 rounded-lg">
          <span className="text-2xl">{icon}</span>
        </div>
        <div
          className={`flex items-center space-x-1 text-sm ${
            trend === "up"
              ? "text-green-600"
              : trend === "down"
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          <span>{trend === "up" ? "↗️" : trend === "down" ? "↘️" : "➡️"}</span>
          <span className="font-medium">{subtitle}</span>
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  );

  const TimeRangeButton = ({
    range,
    label,
  }: {
    range: string;
    label: string;
  }) => (
    <button
      onClick={() => setTimeRange(range)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        timeRange === range
          ? "bg-green-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <PageLayout>
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Detection Accuracy Analytics
              </h1>
              <p className="mt-2 text-gray-600">
                Comprehensive analysis of system performance and detection
                precision
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Current Accuracy"
            value={`${currentAccuracy.toFixed(1)}%`}
            subtitle="+1.2%"
            trend="up"
            icon="🎯"
          />
          <MetricCard
            title="Average Accuracy"
            value={`${avgAccuracy.toFixed(1)}%`}
            subtitle="Last 7 days"
            trend="up"
            icon="📊"
          />
          <MetricCard
            title="Total Detections"
            value="2,047"
            subtitle="+156"
            trend="up"
            icon="🔍"
          />
          <MetricCard
            title="False Positive Rate"
            value="2.3%"
            subtitle="-0.4%"
            trend="down"
            icon="⚠️"
          />
        </div>

        {/* Time Range Selector */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
              Accuracy Trends
            </h2>
            <div className="flex space-x-2">
              <TimeRangeButton range="24h" label="24 Hours" />
              <TimeRangeButton range="7d" label="7 Days" />
              <TimeRangeButton range="30d" label="30 Days" />
            </div>
          </div>

          {/* Main Chart */}
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData}>
                <defs>
                  <linearGradient
                    id="accuracyGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="time"
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value, name) => [
                    `${value}%`,
                    name === "accuracy" ? "Accuracy" : name,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#22c55e"
                  strokeWidth={3}
                  fill="url(#accuracyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Metric Selector */}
          <div className="flex flex-wrap gap-2">
            {["overall", "precision", "recall", "f1Score"].map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedMetric === metric
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {metric === "overall"
                  ? "Overall Accuracy"
                  : metric === "f1Score"
                  ? "F1 Score"
                  : metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weed Type Accuracy */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Accuracy by Weed Type
            </h3>
            <div className="space-y-4">
              {weedTypeAccuracy.map((weed, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: weed.color }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{weed.name}</p>
                      <p className="text-sm text-gray-600">
                        {weed.count} detections
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {weed.accuracy}%
                    </p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${weed.accuracy}%`,
                          backgroundColor: weed.color,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Field Performance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Field Performance
            </h3>
            <div className="space-y-4">
              {fieldAccuracy.map((field, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {field.field}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {field.area} • Last scan: {field.lastScan}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        field.accuracy >= 96
                          ? "bg-green-100 text-green-800"
                          : field.accuracy >= 94
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {field.accuracy}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        field.accuracy >= 96
                          ? "bg-green-500"
                          : field.accuracy >= 94
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${field.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        {showDetails && (
          <div className="space-y-8">
            {/* Confusion Matrix */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Confusion Matrix Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        Actual
                      </div>
                      <div className="space-y-2">
                        <div className="bg-green-100 p-4 rounded-lg">
                          <div className="text-lg font-bold text-green-800">
                            1,847
                          </div>
                          <div className="text-sm text-green-600">
                            True Positive
                          </div>
                        </div>
                        <div className="bg-red-100 p-4 rounded-lg">
                          <div className="text-lg font-bold text-red-800">
                            45
                          </div>
                          <div className="text-sm text-red-600">
                            False Negative
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        Predicted
                      </div>
                      <div className="space-y-2">
                        <div className="bg-yellow-100 p-4 rounded-lg">
                          <div className="text-lg font-bold text-yellow-800">
                            76
                          </div>
                          <div className="text-sm text-yellow-600">
                            False Positive
                          </div>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-lg">
                          <div className="text-lg font-bold text-blue-800">
                            32
                          </div>
                          <div className="text-sm text-blue-600">
                            True Negative
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        Precision
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        96.0%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      TP / (TP + FP)
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        Recall (Sensitivity)
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        97.6%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      TP / (TP + FN)
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        Specificity
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        29.6%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      TN / (TN + FP)
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-700">
                        F1 Score
                      </span>
                      <span className="text-xl font-bold text-green-800">
                        96.8%
                      </span>
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      2 × (Precision × Recall) / (Precision + Recall)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Detection Confidence Distribution
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      range: "95-100%",
                      count: 1456,
                      percentage: 72.8,
                      color: "bg-green-500",
                    },
                    {
                      range: "90-95%",
                      count: 378,
                      percentage: 18.9,
                      color: "bg-blue-500",
                    },
                    {
                      range: "85-90%",
                      count: 134,
                      percentage: 6.7,
                      color: "bg-yellow-500",
                    },
                    {
                      range: "80-85%",
                      count: 32,
                      percentage: 1.6,
                      color: "bg-orange-500",
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-20 text-sm font-medium text-gray-700">
                        {item.range}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            {item.count} detections
                          </span>
                          <span className="font-medium">
                            {item.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Processing Time vs Accuracy
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { time: 0.5, accuracy: 89.2 },
                        { time: 1.0, accuracy: 93.7 },
                        { time: 1.5, accuracy: 95.8 },
                        { time: 2.0, accuracy: 96.4 },
                        { time: 2.5, accuracy: 96.1 },
                        { time: 3.0, accuracy: 95.9 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="time"
                        stroke="#666"
                        fontSize={12}
                        tickFormatter={(value) => `${value}s`}
                      />
                      <YAxis
                        stroke="#666"
                        fontSize={12}
                        domain={[85, 100]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        formatter={(value, name) => [`${value}%`, "Accuracy"]}
                        labelFormatter={(value) => `Processing Time: ${value}s`}
                      />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            Download Full Report
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Schedule Accuracy Review
          </button>
          <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
            Configure Thresholds
          </button>
        </div>
      </div>

      {/* Professional Footer Component */}
      <footer className="bg-gray-900 text-gray-200 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-700">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xl font-bold text-white">WeedWise</span>
              </div>
              <p className="text-sm leading-relaxed">
                Advanced weed detection and agricultural analytics platform
                helping farmers optimize crop yields through AI-powered
                solutions.
              </p>
              <div className="flex space-x-4 pt-2">
                <a
                  href="#"
                  aria-label="Twitter"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/features"
                    className="hover:text-green-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="/pricing"
                    className="hover:text-green-400 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="/case-studies"
                    className="hover:text-green-400 transition-colors"
                  >
                    Case Studies
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="hover:text-green-400 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-green-400 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/documentation"
                    className="hover:text-green-400 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="/api"
                    className="hover:text-green-400 transition-colors"
                  >
                    API Reference
                  </a>
                </li>
                <li>
                  <a
                    href="/help-center"
                    className="hover:text-green-400 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="/webinars"
                    className="hover:text-green-400 transition-colors"
                  >
                    Webinars
                  </a>
                </li>
                <li>
                  <a
                    href="/community"
                    className="hover:text-green-400 transition-colors"
                  >
                    Community Forum
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Stay Updated
              </h3>
              <p className="text-sm">
                Subscribe to our newsletter for the latest updates and insights.
              </p>
              <form className="flex flex-col space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} WeedWise Analytics. All rights
              reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="/privacy"
                className="text-sm hover:text-green-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-sm hover:text-green-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/cookies"
                className="text-sm hover:text-green-400 transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </PageLayout>
  );
};

export default AccuracyPage;
