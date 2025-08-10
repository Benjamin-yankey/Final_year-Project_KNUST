import React, { useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-green-600 text-white p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Weed Detection Dashboard</h1>
            <nav className="flex space-x-6">
              <a href="#" className="hover:text-green-200 transition-colors">Home</a>
              <a href="#" className="hover:text-green-200 transition-colors">Map</a>
              <a href="#" className="hover:text-green-200 transition-colors">Metrics</a>
              <a href="/Gallery" className="hover:text-green-200 transition-colors">Gallery</a>
              <a href="/Settings" className="hover:text-green-200 transition-colors">Settings</a>
              <a href="/WeedWiseHelpPage" className="hover:text-green-200 transition-colors">Help</a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
<div className="bg-card rounded-lg p-6 shadow-sm border">
  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
  <ul className="space-y-3 text-green-600">
    <li>
      <Link to="/RecentScans" className="block p-3 rounded hover:text-green-800 hover:bg-green-100">
        Recent Scans
      </Link>
    </li>
    <li><a href="/Uploadimagery" className="block p-3 rounded hover:text-green-800 hover:bg-green-100">Upload Imagery</a></li>
    <li><a href="/ExportMap" className="block p-3 rounded hover:text-green-800 hover:bg-green-100">Export Map</a></li>
    <li><a href="/SystemStatus" className="block p-3 rounded hover:text-green-800 hover:bg-green-100">System Status</a></li>
  </ul>
</div>

              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Detection Metrics</h3>
                <ul className="space-y-3 text-green-600">
                  <li><a href="/AccuracyPage" className="block p-3 rounded hover:text-green-800 hover:bg-green-100">Accuracy</a></li>
                  <li><a href="/FalsePositiveRatePage" className="block p-3 rounded hover:text-green-800 hover:bg-green-100">False Positive Rate</a></li>
                  <li><a href="/WeedWiseResponseTimePage" className="block p-3 rounded hover:text-green-800 hover:bg-green-100">Response Time</a></li>
                  <li><a href="/WeedWiseCoverageEfficiencyPage" className="block p-3 rounded hover:text-green-800 hover:bg-green-100">Coverage Efficiency</a></li>
                </ul>
              </div>
            </div>

            {/* Middle Column */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Green Header */}
              <div className="bg-green-600 text-white text-3xl font-bold rounded-md p-4 text-center">
                Autonomous Weed Detection System
              </div>

              {/* Upload + Label */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
                {/* Upload */}
                <div className="flex justify-center sm:justify-start w-full sm:w-auto">
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                  >
                    Upload Image
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {/* Label */}
                <h2 className="text-2xl font-bold text-center sm:text-right w-full sm:w-auto">
                  AUTOMONIS <span className="text-green-600">WEED</span>
                </h2>
              </div>

              {/* Two Boxes */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Left - Recent Activity */}
                <div className="bg-card rounded-lg p-6 shadow-md border text-lg flex-1">
                  <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                  {image ? (
                    <img
                      src={image}
                      alt="Uploaded"
                      className="rounded-md max-h-60 object-contain"
                    />
                  ) : (
                    <p className="text-muted-foreground">No recent activity to display</p>
                  )}
                </div>

                {/* Right - Recent1 */}
                <div className="bg-card rounded-lg p-6 shadow-md border text-lg flex-1">
                  <h3 className="text-xl font-semibold mb-4">Recent1</h3>
                  <p className="text-muted-foreground">No recent activity to display</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-2 bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">System Overview</h3>
              <p className="text-muted-foreground">System running normally</p>
            </div>
          </div>
        </main>
      </div>

      

      {/* Footer */}
      <footer className="bg-green-600 text-white py-8 px-6 mt-16">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm">
          <div className="text-center md:text-left mb-4 md:mb-0">
            © {new Date().getFullYear()} Weed Detection Dashboard. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="/WeedDetectionDocs" className="hover:underline hover:text-green-200 transition-colors">📄 Documentation</a>
            <a href="/WeedWiseHelpPage" className="hover:underline hover:text-green-200 transition-colors">🛠 Support</a>
          </div>
        </div>
      </footer>

      
    </>

  );
};

export default Index;
