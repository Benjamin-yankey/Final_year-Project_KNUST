import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import '../index.css';


const Index = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Add authentication state
  const [showLoginModal, setShowLoginModal] = useState(false); // Modal state
  const [isGuest, setIsGuest] = useState(false); // Track if user is a guest

  // Check authentication state on component mount and page visibility changes
  useEffect(() => {
    // Check if user was authenticated in this session
    const checkAuthStatus = () => {
      const sessionAuth = sessionStorage.getItem('token');
      console.log("Session Auth: ", sessionAuth)
      const sessionGuest = sessionStorage.getItem('weedwise_guest');
      
      if (sessionAuth) {
        setIsLoggedIn(true);
        setIsGuest(false);
      } else if (sessionGuest) {
        setIsLoggedIn(true);
        setIsGuest(true);
      } else {
        setIsLoggedIn(false);
        setIsGuest(false);
      }
    };

    checkAuthStatus();

    // Listen for page visibility changes (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When page becomes visible, check if it's a new session
        const sessionStart = sessionStorage.getItem('weedwise_session_start');
        const currentTime = Date.now();
        const sessionDuration = 30 * 60 * 1000; // 30 minutes

        if (!sessionStart || (currentTime - parseInt(sessionStart)) > sessionDuration) {
          // Session expired or new session, require re-authentication
          sessionStorage.removeItem('weedwise_auth');
          sessionStorage.removeItem('weedwise_guest');
          sessionStorage.removeItem('weedwise_session_start');
          setIsLoggedIn(false);
          setIsGuest(false);
        }
      }
    };

    // Listen for storage changes (when user logs out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'weedwise_auth' || e.key === 'weedwise_guest') {
        checkAuthStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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

  // Function to handle successful authentication
  const handleSuccessfulAuth = (isGuestLogin = false) => {
    setIsLoggedIn(true);
    setIsGuest(isGuestLogin);
    
    // Store authentication state in sessionStorage (clears when browser closes)
    if (isGuestLogin) {
      sessionStorage.setItem('weedwise_guest', 'true');
      sessionStorage.setItem('weedwise_session_start', Date.now().toString());
    } else {
      sessionStorage.setItem('weedwise_auth', 'true');
      sessionStorage.setItem('weedwise_session_start', Date.now().toString());
    }
  };

  // Function to handle login button click - connects to your MediCoAuth
  const handleLoginClick = () => {
    setShowLoginModal(true);
    // Here you would integrate with your MediCoAuth component
    // Example: window.location.href = '/MediCoAuth';
    // Or: setCurrentPage('MediCoAuth');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsGuest(false);
    
    // Clear all session data
    sessionStorage.removeItem('weedwise_auth');
    sessionStorage.removeItem('weedwise_guest');
    sessionStorage.removeItem('weedwise_session_start');
    
    // Clear any uploaded images
    setImage(null);
  };

  // If not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-lg border max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-green-600 mb-2">WeedWise</h1>
            <h2 className="text-xl font-semibold text-gray-800">Autonomous Weed Detection System</h2>
          </div>
          
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-6">Please authenticate to access the dashboard</p>
          </div>

          {/* Login Integration Point */}
          <div className="space-y-4">
            
            {/* Alternative: Direct navigation to MediCoAuth page */}
            <Link 
              to="/MediCoAuth" 
              className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors font-medium border"
            >
              Go to Login Page
            </Link>
          </div>

          {/* Demo/Guest Access Button (optional) */}
          <button
            onClick={() => handleSuccessfulAuth(true)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Continue as Guest (Demo)
          </button>
          
          {/* Session Info for Guest Users */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-700">
              <strong>Note:</strong> Guest sessions are temporary and will expire after 30 minutes of inactivity or when you navigate away from the site.
            </p>
          </div>
        </div>

        {/* Login Modal (if you prefer modal approach) */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Authentication Required</h3>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mb-4">Redirecting to MediCoAuth login...</p>
              {/* Here you would embed or redirect to your MediCoAuth component */}
              <div className="bg-gray-50 p-4 rounded border-2 border-dashed border-gray-300 text-center">
                <p className="text-sm text-gray-500">MediCoAuth Login Component</p>
                <p className="text-xs text-gray-400 mt-1">Connect your login component here</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-green-600 text-white p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-xl font-bold">Weed Detection Dashboard</h1>
            
            {/* Navigation - Responsive */}
            <nav className="flex flex-wrap justify-center sm:justify-end items-center gap-3 sm:gap-6 text-sm sm:text-base">
              <a href="#" className="hover:text-green-200 transition-colors">Home</a>
              <a href="#" className="hover:text-green-200 transition-colors">Map</a>
              <a href="#" className="hover:text-green-200 transition-colors">Metrics</a>
              <a href="/Gallery" className="hover:text-green-200 transition-colors">Gallery</a>
              <a href="/Settings" className="hover:text-green-200 transition-colors">Settings</a>
              <a href="/WeedWiseHelpPage" className="hover:text-green-200 transition-colors">Help</a>
              
              {/* User Menu */}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-green-400">
                <span className="hidden sm:inline text-sm">
                  {isGuest ? 'Welcome, Guest' : 'Welcome, User'}
                </span>
                {isGuest && (
                  <div className="hidden sm:flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Guest Mode
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-green-700 hover:bg-green-800 px-3 py-1 rounded text-sm transition-colors"
                >
                  {isGuest ? 'Exit Guest' : 'Logout'}
                </button>
              </div>
            </nav>
          </div>
        </header>

        {/* Guest Mode Warning Banner */}
        {isGuest && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 sm:mx-8 mt-4 rounded-r-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    You're in <strong>Guest Mode</strong>. Your session is temporary and data won't be saved permanently.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Link
                  to="/MediCoAuth"
                  className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md transition-colors"
                >
                  Sign In for Full Access
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Left Column - Stack on mobile */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <ul className="space-y-3 text-green-600 text-sm sm:text-base">
                  <li>
                    <Link to="/RecentScans" className="block p-2 sm:p-3 rounded hover:text-green-800 hover:bg-green-100">
                      Recent Scans
                    </Link>
                  </li>
                  <li><a href="/Uploadimagery" className="block p-2 sm:p-3 rounded hover:text-green-800 hover:bg-green-100">Upload Imagery</a></li>
                  <li><a href="/ExportMap" className="block p-2 sm:p-3 rounded hover:text-green-800 hover:bg-green-100">Export Map</a></li>
                  <li><a href="/SystemStatus" className="block p-2 sm:p-3 rounded hover:text-green-800 hover:bg-green-100">System Status</a></li>
                </ul>
              </div>

              <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Detection Metrics</h3>
                <ul className="space-y-3 text-green-600 text-sm sm:text-base">
                  <li><a href="/AccuracyPage" className="block p-2 sm:p-3 rounded hover:text-green-800 hover:bg-green-100">Accuracy</a></li>
                  <li><a href="/FalsePositiveRatePage" className="block p-2 sm:p-3 rounded hover:text-green-800 hover:bg-green-100">False Positive Rate</a></li>
                  <li><a href="/WeedWiseResponseTimePage" className="block p-2 sm:p-3 rounded hover:text-green-800 hover:bg-green-100">Response Time</a></li>
                  <li><a href="/WeedWiseCoverageEfficiencyPage" className="block p-2 sm:p-3 rounded hover:text-green-800 hover:bg-green-100">Coverage Efficiency</a></li>
                </ul>
              </div>
            </div>

            {/* Middle Column */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Green Header - Responsive text size */}
              <div className="bg-green-600 text-white text-xl sm:text-2xl lg:text-3xl font-bold rounded-md p-4 text-center">
                Autonomous Weed Detection System
              </div>

              {/* Upload + Label - Better mobile layout */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
                {/* Upload */}
                <div className="flex justify-center sm:justify-start w-full sm:w-auto">
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition text-sm sm:text-base"
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

                {/* Label - Responsive text */}
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-center sm:text-right w-full sm:w-auto">
                  AUTOMONIS <span className="text-green-600">WEED</span>
                </h2>
              </div>

              {/* Two Boxes - Stack on mobile */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Left - Recent Activity */}
                <div className="bg-card rounded-lg p-4 sm:p-6 shadow-md border text-base sm:text-lg flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4">Recent Activity</h3>
                  {image ? (
                    <img
                      src={image}
                      alt="Uploaded"
                      className="rounded-md w-full max-h-40 sm:max-h-60 object-contain"
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm sm:text-base">No recent activity to display</p>
                  )}
                </div>

                {/* Right - Recent1 */}
                <div className="bg-card rounded-lg p-4 sm:p-6 shadow-md border text-base sm:text-lg flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4">Recent1</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">No recent activity to display</p>
                </div>
              </div>
            </div>

            {/* Right Column - Full width on mobile */}
            <div className="lg:col-span-2 bg-card rounded-lg p-4 sm:p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">System Overview</h3>
              <p className="text-muted-foreground text-sm sm:text-base">System running normally</p>
            </div>
          </div>
        </main>
      </div>

      {/* Footer - Better mobile layout */}
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
    </>
  );
};

export default Index;