import React from 'react';

const SystemStatus = () => {
  const systemStats = {
    uptime: '23 days, 4 hours',
    cpuUsage: '35%',
    memoryUsage: '62%',
    lastScan: 'August 5, 2025 - 10:45 AM',
    status: 'Operational',
    lastIncident: 'No recent incidents',
    recentActivities: [
      'New image uploaded for analysis',
      'User Huey accessed Metrics Dashboard',
      'Map data synced successfully',
      'Model retrained with latest dataset'
    ]
  };

  return (
    <div className="min-h-screen bg-green-50 text-gray-800">
      {/* Header */}
      <header className="bg-green-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Weed Detection Dashboard</h1>
          <nav className="flex space-x-6">
            <a href="/" className="hover:text-green-200 transition-colors">Home</a>
            <a href="#" className="hover:text-green-200 transition-colors">Map</a>
            <a href="#" className="hover:text-green-200 transition-colors">Metrics</a>
            <a href="#" className="hover:text-green-200 transition-colors">Gallery</a>
            <a href="#" className="hover:text-green-200 transition-colors">Settings</a>
            <a href="#" className="hover:text-green-200 transition-colors">Help</a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="p-6">
        <h2 className="text-2xl font-semibold mb-6 text-green-800">System Status Overview</h2>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Uptime */}
          <div className="bg-white p-4 shadow rounded">
            <h3 className="text-lg font-medium text-green-700">Server Uptime</h3>
            <p className="text-xl font-bold mt-2">{systemStats.uptime}</p>
          </div>

          {/* CPU */}
          <div className="bg-white p-4 shadow rounded">
            <h3 className="text-lg font-medium text-green-700">CPU Usage</h3>
            <div className="mt-2 w-full bg-green-100 rounded-full h-5">
              <div
                className="bg-green-500 h-5 rounded-full"
                style={{ width: systemStats.cpuUsage }}
              ></div>
            </div>
            <p className="mt-1 text-sm">{systemStats.cpuUsage} used</p>
          </div>

          {/* Memory */}
          <div className="bg-white p-4 shadow rounded">
            <h3 className="text-lg font-medium text-green-700">Memory Usage</h3>
            <div className="mt-2 w-full bg-green-100 rounded-full h-5">
              <div
                className="bg-green-500 h-5 rounded-full"
                style={{ width: systemStats.memoryUsage }}
              ></div>
            </div>
            <p className="mt-1 text-sm">{systemStats.memoryUsage} used</p>
          </div>

          {/* Last Scan */}
          <div className="bg-white p-4 shadow rounded">
            <h3 className="text-lg font-medium text-green-700">Last Scan</h3>
            <p className="mt-2">{systemStats.lastScan}</p>
          </div>

          {/* System Health */}
          <div className="bg-white p-4 shadow rounded col-span-1 md:col-span-2">
            <h3 className="text-lg font-medium text-green-700">System Health</h3>
            <p className="text-green-600 text-xl mt-2 font-bold">{systemStats.status}</p>
            <p className="text-sm mt-1 text-gray-600">{systemStats.lastIncident}</p>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Run Diagnostics
            </button>
          </div>

          {/* Activity Logs */}
          <div className="bg-white p-4 shadow rounded col-span-1 md:col-span-2">
            <h3 className="text-lg font-medium text-green-700 mb-3">Recent Activity</h3>
            <ul className="list-disc list-inside text-sm space-y-2 text-gray-700">
              {systemStats.recentActivities.map((activity, idx) => (
                <li key={idx}>{activity}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
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

export default SystemStatus;
