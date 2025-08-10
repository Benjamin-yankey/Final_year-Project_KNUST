import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Server, 
  Wifi, 
  Database, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Calendar,
  BarChart3,
  Zap,
  Globe,
  Home,
  Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

interface ResponseTimeMetric {
  timestamp: string;
  apiResponse: number;
  aiProcessing: number;
  imageUpload: number;
  database: number;
  overall: number;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  icon: React.ReactNode;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  service: string;
}

const WeedWiseResponseTimePage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('overall');
  
  // Generate mock data for response times
  const generateMockData = (hours: number): ResponseTimeMetric[] => {
    const data: ResponseTimeMetric[] = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        timestamp: timestamp.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          ...(hours > 24 ? { month: 'short', day: 'numeric' } : {})
        }),
        apiResponse: Math.random() * 200 + 50,
        aiProcessing: Math.random() * 800 + 200,
        imageUpload: Math.random() * 400 + 100,
        database: Math.random() * 150 + 30,
        overall: Math.random() * 300 + 150
      });
    }
    return data;
  };

  const [responseData, setResponseData] = useState<ResponseTimeMetric[]>(
    generateMockData(timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720)
  );

  const services: ServiceStatus[] = [
    {
      name: 'AI Detection API',
      status: 'healthy',
      responseTime: 245,
      uptime: 99.8,
      lastCheck: '2 minutes ago',
      icon: <Camera className="w-5 h-5" />
    },
    {
      name: 'Image Processing',
      status: 'healthy',
      responseTime: 156,
      uptime: 99.9,
      lastCheck: '1 minute ago',
      icon: <Zap className="w-5 h-5" />
    },
    {
      name: 'Database',
      status: 'degraded',
      responseTime: 387,
      uptime: 98.5,
      lastCheck: '30 seconds ago',
      icon: <Database className="w-5 h-5" />
    },
    {
      name: 'Authentication',
      status: 'healthy',
      responseTime: 89,
      uptime: 99.95,
      lastCheck: '1 minute ago',
      icon: <Server className="w-5 h-5" />
    },
    {
      name: 'CDN',
      status: 'healthy',
      responseTime: 67,
      uptime: 99.99,
      lastCheck: '3 minutes ago',
      icon: <Globe className="w-5 h-5" />
    },
    {
      name: 'Notifications',
      status: 'down',
      responseTime: 0,
      uptime: 95.2,
      lastCheck: '5 minutes ago',
      icon: <Wifi className="w-5 h-5" />
    }
  ];

  const alerts: PerformanceAlert[] = [
    {
      id: '1',
      type: 'warning',
      message: 'Database response time increased by 15% in the last hour',
      timestamp: '5 minutes ago',
      service: 'Database'
    },
    {
      id: '2',
      type: 'error',
      message: 'Notification service is currently unavailable',
      timestamp: '12 minutes ago',
      service: 'Notifications'
    },
    {
      id: '3',
      type: 'info',
      message: 'AI Detection API performance improved by 8%',
      timestamp: '1 hour ago',
      service: 'AI Detection API'
    }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    setResponseData(generateMockData(hours));
    setIsRefreshing(false);
  };

  const handleTimeRangeChange = (range: '1h' | '24h' | '7d' | '30d') => {
    setTimeRange(range);
    const hours = range === '1h' ? 1 : range === '24h' ? 24 : range === '7d' ? 168 : 720;
    setResponseData(generateMockData(hours));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 border-green-200';
      case 'degraded': return 'bg-yellow-100 border-yellow-200';
      case 'down': return 'bg-red-100 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const averageResponseTime = responseData.reduce((sum, item) => sum + item.overall, 0) / responseData.length;
  const healthyServices = services.filter(s => s.status === 'healthy').length;
  const totalUptime = services.reduce((sum, service) => sum + service.uptime, 0) / services.length;

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing) {
        const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
        setResponseData(generateMockData(hours));
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange, isRefreshing]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
              </div>
              <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Performance Monitor
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
              <a href="/" className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Home className="w-4 h-4" />
                <span className="hidden sm:block">Dashboard</span>
              </a>
              <a href="/Settings" className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:block">Settings</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">System Performance</h1>
          <p className="text-gray-600 dark:text-gray-300">Monitor response times and system health across all WeedWise services</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(averageResponseTime)}ms</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  12% faster
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Healthy Services</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{healthyServices}/{services.length}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  All critical up
                </p>
              </div>
              <Server className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Uptime</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUptime.toFixed(2)}%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +0.1% this week
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.length}</p>
                <p className="text-sm text-yellow-600 flex items-center mt-1">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  1 critical
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Time Range Selector & Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">Response Time Trends</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Metric:</label>
                  <select 
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="px-3 py-1 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="overall">Overall</option>
                    <option value="apiResponse">API Response</option>
                    <option value="aiProcessing">AI Processing</option>
                    <option value="imageUpload">Image Upload</option>
                    <option value="database">Database</option>
                  </select>
                </div>
                <div className="flex rounded-lg border dark:border-gray-600 overflow-hidden">
                  {(['1h', '24h', '7d', '30d'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => handleTimeRangeChange(range)}
                      className={`px-3 py-1 text-sm font-medium transition-colors ${
                        timeRange === range
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={responseData}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="timestamp" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#colorMetric)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Service Status</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Real-time status of all WeedWise services</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${getStatusBg(service.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={getStatusColor(service.status)}>
                          {service.icon}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{service.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.status === 'healthy' ? 'bg-green-200 text-green-800' :
                          service.status === 'degraded' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {service.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {service.responseTime > 0 ? `${service.responseTime}ms` : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{service.lastCheck}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Uptime: {service.uptime}%</span>
                      <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            service.uptime >= 99 ? 'bg-green-500' : 
                            service.uptime >= 95 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${service.uptime}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Alerts</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Recent performance notifications and issues</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-4 rounded-lg border dark:border-gray-700">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{alert.service}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{alert.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All Alerts →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Response Time by Service Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mt-8">
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Response Time by Service</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Average response times across different services</p>
          </div>
          <div className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={responseData.slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="apiResponse" fill="#3B82F6" name="API Response" />
                  <Bar dataKey="aiProcessing" fill="#10B981" name="AI Processing" />
                  <Bar dataKey="imageUpload" fill="#F59E0B" name="Image Upload" />
                  <Bar dataKey="database" fill="#EF4444" name="Database" />
                </BarChart>
              </ResponsiveContainer>
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

export default WeedWiseResponseTimePage;