import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Zap, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Home,
  Settings,
  Crop,
  Layers,
  Activity,
  Clock,
  Award,
  Globe,
  Camera,
  Scan
} from 'lucide-react';
import { 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';

interface CoverageData {
  timestamp: string;
  totalArea: number;
  scannedArea: number;
  weedDetected: number;
  accuracy: number;
  efficiency: number;
  falsePositives: number;
  falseNegatives: number;
}

interface FieldCoverage {
  id: string;
  name: string;
  cropType: string;
  totalArea: number;
  scannedArea: number;
  weedDensity: number;
  lastScan: string;
  efficiency: number;
  status: 'complete' | 'partial' | 'pending' | 'failed';
  coordinates: { lat: number; lng: number };
}

interface DetectionMetrics {
  totalScans: number;
  successfulDetections: number;
  averageAccuracy: number;
  coveragePercentage: number;
  processingTime: number;
  costEfficiency: number;
}

interface CropTypeData {
  crop: string;
  area: number;
  coverage: number;
  efficiency: number;
  weedDensity: number;
  color: string;
}

const WeedWiseCoverageEfficiencyPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'season'>('week');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Generate mock coverage data
  const generateCoverageData = (): CoverageData[] => {
    const data: CoverageData[] = [];
    const days = timeRange === 'today' ? 1 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        timestamp: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalArea: 1000 + Math.random() * 200,
        scannedArea: 800 + Math.random() * 150,
        weedDetected: 45 + Math.random() * 20,
        accuracy: 92 + Math.random() * 6,
        efficiency: 85 + Math.random() * 12,
        falsePositives: 2 + Math.random() * 3,
        falseNegatives: 1 + Math.random() * 2
      });
    }
    return data;
  };

  const [coverageData, setCoverageData] = useState<CoverageData[]>(generateCoverageData());

  const fieldCoverageData: FieldCoverage[] = [
    {
      id: '1',
      name: 'North Field Alpha',
      cropType: 'Corn',
      totalArea: 250,
      scannedArea: 245,
      weedDensity: 12,
      lastScan: '2 hours ago',
      efficiency: 98,
      status: 'complete',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: '2',
      name: 'West Field Beta',
      cropType: 'Soybeans',
      totalArea: 180,
      scannedArea: 165,
      weedDensity: 8,
      lastScan: '4 hours ago',
      efficiency: 92,
      status: 'partial',
      coordinates: { lat: 40.7580, lng: -73.9855 }
    },
    {
      id: '3',
      name: 'South Field Gamma',
      cropType: 'Wheat',
      totalArea: 320,
      scannedArea: 320,
      weedDensity: 15,
      lastScan: '1 hour ago',
      efficiency: 95,
      status: 'complete',
      coordinates: { lat: 40.6892, lng: -74.0445 }
    },
    {
      id: '4',
      name: 'East Field Delta',
      cropType: 'Cotton',
      totalArea: 200,
      scannedArea: 120,
      weedDensity: 22,
      lastScan: '6 hours ago',
      efficiency: 78,
      status: 'partial',
      coordinates: { lat: 40.7362, lng: -73.9904 }
    },
    {
      id: '5',
      name: 'Center Field Epsilon',
      cropType: 'Tomatoes',
      totalArea: 150,
      scannedArea: 0,
      weedDensity: 0,
      lastScan: 'Never',
      efficiency: 0,
      status: 'pending',
      coordinates: { lat: 40.7505, lng: -73.9934 }
    }
  ];

  const cropTypeData: CropTypeData[] = [
    { crop: 'Corn', area: 250, coverage: 98, efficiency: 96, weedDensity: 12, color: '#10B981' },
    { crop: 'Soybeans', area: 180, coverage: 92, efficiency: 89, weedDensity: 8, color: '#3B82F6' },
    { crop: 'Wheat', area: 320, coverage: 100, efficiency: 95, weedDensity: 15, color: '#F59E0B' },
    { crop: 'Cotton', area: 200, coverage: 60, efficiency: 78, weedDensity: 22, color: '#EF4444' },
    { crop: 'Tomatoes', area: 150, coverage: 0, efficiency: 0, weedDensity: 0, color: '#8B5CF6' }
  ];

  const detectionMetrics: DetectionMetrics = {
    totalScans: 1247,
    successfulDetections: 1189,
    averageAccuracy: 94.2,
    coveragePercentage: 87.5,
    processingTime: 2.3,
    costEfficiency: 92.8
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCoverageData(generateCoverageData());
    setIsRefreshing(false);
  };

  const totalArea = fieldCoverageData.reduce((sum, field) => sum + field.totalArea, 0);
  const totalScannedArea = fieldCoverageData.reduce((sum, field) => sum + field.scannedArea, 0);
  const averageEfficiency = fieldCoverageData.reduce((sum, field) => sum + field.efficiency, 0) / fieldCoverageData.length;
  const overallCoverage = (totalScannedArea / totalArea) * 100;

  const efficiencyDistribution = [
    { name: 'Excellent (90-100%)', value: 45, fill: '#10B981' },
    { name: 'Good (80-89%)', value: 30, fill: '#3B82F6' },
    { name: 'Average (70-79%)', value: 15, fill: '#F59E0B' },
    { name: 'Poor (<70%)', value: 10, fill: '#EF4444' }
  ];

  useEffect(() => {
    setCoverageData(generateCoverageData());
  }, [timeRange]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                
              </div>
              <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Coverage Efficiency
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:block">Refresh</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span className="hidden sm:block">Export</span>
              </button>
              <a href="/" className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Home className="w-4 h-4" />
                <span className="hidden sm:block">Dashboard</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Coverage Efficiency Analysis</h1>
          <p className="text-gray-600 dark:text-gray-300">Monitor field scanning coverage and detection efficiency across your farm operations</p>
        </div>

        {/* Control Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range:</label>
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as 'today' | 'week' | 'month' | 'season')}
                  className="px-3 py-1 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="season">This Season</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Field:</label>
                <select 
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Fields</option>
                  {fieldCoverageData.map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex rounded-lg border dark:border-gray-600 overflow-hidden">
              {(['overview', 'detailed', 'comparison'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-sm font-medium capitalize transition-colors ${
                    viewMode === mode
                      ? 'bg-green-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Coverage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallCoverage.toFixed(1)}%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +5.2% vs last week
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Efficiency</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageEfficiency.toFixed(1)}%</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +2.8% improvement
                </p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Detection Accuracy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{detectionMetrics.averageAccuracy}%</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <Award className="w-4 h-4 mr-1" />
                  Industry leading
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost Efficiency</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${(detectionMetrics.costEfficiency * 10).toFixed(0)}/acre</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  -15% cost reduction
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Coverage Trends */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Coverage Efficiency Trends</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Field scanning performance over time</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={coverageData}>
                    <defs>
                      <linearGradient id="colorCoverage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="timestamp" className="text-xs" tick={{ fontSize: 12 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="efficiency"
                      stackId="1"
                      stroke="#10B981"
                      fill="url(#colorCoverage)"
                      name="Efficiency %"
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stackId="2"
                      stroke="#3B82F6"
                      fill="url(#colorEfficiency)"
                      name="Accuracy %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Efficiency Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Efficiency Distribution</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Performance breakdown by category</p>
            </div>
            <div className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={efficiencyDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {efficiencyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {efficiencyDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.fill }}></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Field Coverage Details */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Field Coverage Status</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Individual field scanning progress and efficiency</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {fieldCoverageData.map((field) => (
                  <div key={field.id} className="border dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Crop className="w-5 h-5 text-green-500" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{field.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{field.cropType} • {field.totalArea} acres</p>
                        </div>
                      </div>
                      <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(field.status)}`}>
                        {getStatusIcon(field.status)}
                        <span className="capitalize">{field.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Coverage</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {((field.scannedArea / field.totalArea) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Efficiency</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{field.efficiency}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Scanned: {field.scannedArea}/{field.totalArea} acres</span>
                        <span className="text-gray-500 dark:text-gray-400">Weed density: {field.weedDensity}/acre</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(field.scannedArea / field.totalArea) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last scan: {field.lastScan}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Crop Type Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance by Crop Type</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Detection efficiency across different crop varieties</p>
            </div>
            <div className="p-6">
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cropTypeData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="crop" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="coverage" fill="#10B981" name="Coverage %" />
                    <Bar dataKey="efficiency" fill="#3B82F6" name="Efficiency %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-3">
                {cropTypeData.map((crop, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded`} style={{ backgroundColor: crop.color }}></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{crop.crop}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{crop.area} acres</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{crop.efficiency}% efficiency</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{crop.weedDensity} weeds/acre</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mt-8">
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Insights & Recommendations</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">AI-powered insights to optimize your coverage efficiency</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="bg-blue-500 rounded-full p-2">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Coverage Optimization</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    East Field Delta shows 60% coverage. Consider scheduling additional scans during optimal weather conditions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="bg-green-500 rounded-full p-2">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">High Performance</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    North Field Alpha maintains 98% efficiency. Use similar scanning patterns for other fields.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="bg-yellow-500 rounded-full p-2">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Scheduling Alert</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Center Field Epsilon requires initial scanning. Weed growth may be accelerating without monitoring.
                  </p>
                </div>
              </div>
            </div>
          </div>
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

export default WeedWiseCoverageEfficiencyPage;