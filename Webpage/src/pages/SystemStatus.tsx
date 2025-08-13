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

      {/* Professional Footer Component */}
<footer className="bg-gray-900 text-gray-200 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-700">
  <div className="max-w-7xl mx-auto">
    {/* Main Footer Content */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
      
      {/* Company Info */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
          <span className="text-xl font-bold text-white">WeedWise</span>
        </div>
        <p className="text-sm leading-relaxed">
          Advanced weed detection and agricultural analytics platform helping farmers optimize crop yields through AI-powered solutions.
        </p>
        <div className="flex space-x-4 pt-2">
          <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-green-400 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
          </a>
          <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-green-400 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
          </a>
          <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-green-400 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
          </a>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h3>
        <ul className="space-y-2">
          <li><a href="/features" className="hover:text-green-400 transition-colors">Features</a></li>
          <li><a href="/pricing" className="hover:text-green-400 transition-colors">Pricing</a></li>
          <li><a href="/case-studies" className="hover:text-green-400 transition-colors">Case Studies</a></li>
          <li><a href="/blog" className="hover:text-green-400 transition-colors">Blog</a></li>
          <li><a href="/contact" className="hover:text-green-400 transition-colors">Contact Us</a></li>
        </ul>
      </div>

      {/* Resources */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Resources</h3>
        <ul className="space-y-2">
          <li><a href="/documentation" className="hover:text-green-400 transition-colors">Documentation</a></li>
          <li><a href="/api" className="hover:text-green-400 transition-colors">API Reference</a></li>
          <li><a href="/help-center" className="hover:text-green-400 transition-colors">Help Center</a></li>
          <li><a href="/webinars" className="hover:text-green-400 transition-colors">Webinars</a></li>
          <li><a href="/community" className="hover:text-green-400 transition-colors">Community Forum</a></li>
        </ul>
      </div>

      {/* Newsletter */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Stay Updated</h3>
        <p className="text-sm">Subscribe to our newsletter for the latest updates and insights.</p>
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
        © {new Date().getFullYear()} WeedWise Analytics. All rights reserved.
      </div>
      <div className="flex space-x-6 mt-4 md:mt-0">
        <a href="/privacy" className="text-sm hover:text-green-400 transition-colors">Privacy Policy</a>
        <a href="/terms" className="text-sm hover:text-green-400 transition-colors">Terms of Service</a>
        <a href="/cookies" className="text-sm hover:text-green-400 transition-colors">Cookie Policy</a>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
};

export default SystemStatus;
