import React, { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

const AccuracyPage = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [showDetails, setShowDetails] = useState(false);

  // Mock data for different time ranges
  const accuracyData = {
    '24h': [
      { time: '00:00', accuracy: 94.2, detections: 45, precision: 93.1, recall: 95.3, f1Score: 94.2 },
      { time: '04:00', accuracy: 95.1, detections: 38, precision: 94.5, recall: 95.7, f1Score: 95.1 },
      { time: '08:00', accuracy: 96.8, detections: 67, precision: 96.2, recall: 97.4, f1Score: 96.8 },
      { time: '12:00', accuracy: 95.4, detections: 89, precision: 94.8, recall: 96.0, f1Score: 95.4 },
      { time: '16:00', accuracy: 97.2, detections: 72, precision: 96.9, recall: 97.5, f1Score: 97.2 },
      { time: '20:00', accuracy: 94.7, detections: 56, precision: 93.9, recall: 95.5, f1Score: 94.7 }
    ],
    '7d': [
      { time: 'Mon', accuracy: 95.2, detections: 234, precision: 94.8, recall: 95.6, f1Score: 95.2 },
      { time: 'Tue', accuracy: 96.1, detections: 189, precision: 95.7, recall: 96.5, f1Score: 96.1 },
      { time: 'Wed', accuracy: 94.8, detections: 267, precision: 94.2, recall: 95.4, f1Score: 94.8 },
      { time: 'Thu', accuracy: 97.3, detections: 198, precision: 96.9, recall: 97.7, f1Score: 97.3 },
      { time: 'Fri', accuracy: 95.9, detections: 245, precision: 95.4, recall: 96.4, f1Score: 95.9 },
      { time: 'Sat', accuracy: 94.5, detections: 156, precision: 93.8, recall: 95.2, f1Score: 94.5 },
      { time: 'Sun', accuracy: 96.7, detections: 178, precision: 96.2, recall: 97.2, f1Score: 96.7 }
    ],
    '30d': [
      { time: 'Week 1', accuracy: 95.4, detections: 1456, precision: 94.9, recall: 95.9, f1Score: 95.4 },
      { time: 'Week 2', accuracy: 96.2, detections: 1678, precision: 95.8, recall: 96.6, f1Score: 96.2 },
      { time: 'Week 3', accuracy: 94.9, detections: 1534, precision: 94.3, recall: 95.5, f1Score: 94.9 },
      { time: 'Week 4', accuracy: 97.1, detections: 1789, precision: 96.7, recall: 97.5, f1Score: 97.1 }
    ]
  };

  const weedTypeAccuracy = [
    { name: 'Dandelions', accuracy: 97.8, count: 456, color: '#22c55e' },
    { name: 'Plantain', accuracy: 95.2, count: 324, color: '#16a34a' },
    { name: 'Clover', accuracy: 93.6, count: 278, color: '#15803d' },
    { name: 'Crabgrass', accuracy: 91.4, count: 189, color: '#166534' },
    { name: 'Chickweed', accuracy: 89.7, count: 145, color: '#14532d' },
    { name: 'Other', accuracy: 87.3, count: 98, color: '#052e16' }
  ];

  const fieldAccuracy = [
    { field: 'Field A-1', accuracy: 96.8, area: '12.4 ha', lastScan: '2h ago' },
    { field: 'Field A-2', accuracy: 95.3, area: '8.7 ha', lastScan: '1h ago' },
    { field: 'Field B-1', accuracy: 97.2, area: '15.6 ha', lastScan: '30m ago' },
    { field: 'Field B-2', accuracy: 94.1, area: '9.8 ha', lastScan: '3h ago' },
    { field: 'Field C-1', accuracy: 98.1, area: '11.2 ha', lastScan: '45m ago' },
    { field: 'Field C-2', accuracy: 93.7, area: '7.9 ha', lastScan: '2h ago' }
  ];

  const confusionMatrix = [
    { predicted: 'Weed', actual: 'Weed', count: 1847, percentage: 92.4 },
    { predicted: 'Weed', actual: 'No Weed', count: 76, percentage: 3.8 },
    { predicted: 'No Weed', actual: 'Weed', count: 45, percentage: 2.3 },
    { predicted: 'No Weed', actual: 'No Weed', count: 32, percentage: 1.5 }
  ];

  const currentData = accuracyData[timeRange];
  const currentAccuracy = currentData[currentData.length - 1]?.accuracy || 0;
  const avgAccuracy = currentData.reduce((sum, item) => sum + item.accuracy, 0) / currentData.length;

  const MetricCard = ({ title, value, subtitle, trend, icon }: {
    title: string;
    value: string;
    subtitle: string;
    trend: 'up' | 'down' | 'neutral';
    icon: string;
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-green-100 rounded-lg">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className={`flex items-center space-x-1 text-sm ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
        }`}>
          <span>{trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '➡️'}</span>
          <span className="font-medium">{subtitle}</span>
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  );

  const TimeRangeButton = ({ range, label }: { range: string; label: string }) => (
    <button
      onClick={() => setTimeRange(range)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        timeRange === range
          ? 'bg-green-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Weed Detection Dashboard</h1>
            <nav className="flex space-x-6">
              <a href="/" className="hover:text-green-200 transition-colors">Home</a>
              <a href="#" className="hover:text-green-200 transition-colors">Gallery</a>
              <a href="/Settings" className="hover:text-green-200 transition-colors">Settings</a>
              <a href="#" className="hover:text-green-200 transition-colors">Help</a>
            </nav>
          </div>
        </header>
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Detection Accuracy Analytics</h1>
              <p className="mt-2 text-gray-600">Comprehensive analysis of system performance and detection precision</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Accuracy Trends</h2>
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
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
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
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value, name) => [`${value}%`, name === 'accuracy' ? 'Accuracy' : name]}
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
            {['overall', 'precision', 'recall', 'f1Score'].map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedMetric === metric
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {metric === 'overall' ? 'Overall Accuracy' : 
                 metric === 'f1Score' ? 'F1 Score' : 
                 metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weed Type Accuracy */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Accuracy by Weed Type</h3>
            <div className="space-y-4">
              {weedTypeAccuracy.map((weed, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: weed.color }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{weed.name}</p>
                      <p className="text-sm text-gray-600">{weed.count} detections</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{weed.accuracy}%</p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${weed.accuracy}%`,
                          backgroundColor: weed.color 
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
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Field Performance</h3>
            <div className="space-y-4">
              {fieldAccuracy.map((field, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{field.field}</h4>
                      <p className="text-sm text-gray-600">{field.area} • Last scan: {field.lastScan}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      field.accuracy >= 96 ? 'bg-green-100 text-green-800' :
                      field.accuracy >= 94 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {field.accuracy}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        field.accuracy >= 96 ? 'bg-green-500' :
                        field.accuracy >= 94 ? 'bg-yellow-500' :
                        'bg-red-500'
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
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Confusion Matrix Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600 mb-2">Actual</div>
                      <div className="space-y-2">
                        <div className="bg-green-100 p-4 rounded-lg">
                          <div className="text-lg font-bold text-green-800">1,847</div>
                          <div className="text-sm text-green-600">True Positive</div>
                        </div>
                        <div className="bg-red-100 p-4 rounded-lg">
                          <div className="text-lg font-bold text-red-800">45</div>
                          <div className="text-sm text-red-600">False Negative</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600 mb-2">Predicted</div>
                      <div className="space-y-2">
                        <div className="bg-yellow-100 p-4 rounded-lg">
                          <div className="text-lg font-bold text-yellow-800">76</div>
                          <div className="text-sm text-yellow-600">False Positive</div>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-lg">
                          <div className="text-lg font-bold text-blue-800">32</div>
                          <div className="text-sm text-blue-600">True Negative</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Precision</span>
                      <span className="text-xl font-bold text-gray-900">96.0%</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">TP / (TP + FP)</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Recall (Sensitivity)</span>
                      <span className="text-xl font-bold text-gray-900">97.6%</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">TP / (TP + FN)</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Specificity</span>
                      <span className="text-xl font-bold text-gray-900">29.6%</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">TN / (TN + FP)</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-700">F1 Score</span>
                      <span className="text-xl font-bold text-green-800">96.8%</span>
                    </div>
                    <div className="text-sm text-green-600 mt-1">2 × (Precision × Recall) / (Precision + Recall)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Detection Confidence Distribution</h3>
                <div className="space-y-4">
                  {[
                    { range: '95-100%', count: 1456, percentage: 72.8, color: 'bg-green-500' },
                    { range: '90-95%', count: 378, percentage: 18.9, color: 'bg-blue-500' },
                    { range: '85-90%', count: 134, percentage: 6.7, color: 'bg-yellow-500' },
                    { range: '80-85%', count: 32, percentage: 1.6, color: 'bg-orange-500' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-20 text-sm font-medium text-gray-700">{item.range}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{item.count} detections</span>
                          <span className="font-medium">{item.percentage}%</span>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Processing Time vs Accuracy</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { time: 0.5, accuracy: 89.2 },
                      { time: 1.0, accuracy: 93.7 },
                      { time: 1.5, accuracy: 95.8 },
                      { time: 2.0, accuracy: 96.4 },
                      { time: 2.5, accuracy: 96.1 },
                      { time: 3.0, accuracy: 95.9 }
                    ]}>
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
                        formatter={(value, name) => [`${value}%`, 'Accuracy']}
                        labelFormatter={(value) => `Processing Time: ${value}s`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
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

      <footer className="bg-green-600 text-white py-8 px-6 mt-16">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm">
          <div className="text-center md:text-left mb-4 md:mb-0">
            © {new Date().getFullYear()} Weed Detection Dashboard. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="/docs" className="hover:underline hover:text-green-200 transition-colors">📄 Documentation</a>
            <a href="/support" className="hover:underline hover:text-green-200 transition-colors">🛠 Support</a>
          </div>
        </div>
      </footer>
    </div>

    
  );
};

export default AccuracyPage;