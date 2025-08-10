import React, { useEffect, useState } from "react";
import { 
  User, Bell, Shield, Palette, 
  Camera, Database, Save, Upload, Download, 
  Eye, EyeOff, Monitor, Smartphone,
  CheckCircle, AlertCircle, Info
} from "lucide-react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    detection: true,
    reports: true
  });
  const [profile, setProfile] = useState({
    firstName: "Huey",
    lastName: "Yankey",
    username: "huey_yankey",
    email: "huey@example.com",
    bio: "Agricultural researcher specializing in precision farming and weed detection systems.",
    location: "Kumasi, Ghana",
    website: "",
    avatar: null
  });
  const [detectionSettings, setDetectionSettings] = useState({
    confidence: 0.85,
    model: "yolov5",
    autoProcess: true,
    saveResults: true,
    realTimeMode: false
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'detection', label: 'Detection', icon: Camera },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Privacy', icon: Database }
  ];

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = () => {
    alert('Settings saved successfully!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    `${profile.firstName[0]}${profile.lastName[0]}`
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                  <Upload className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{profile.firstName} {profile.lastName}</h3>
                <p className="text-gray-500">@{profile.username}</p>
                <p className="text-sm text-gray-400">{profile.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => handleProfileChange('username', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => handleProfileChange('location', e.target.value)}
                  placeholder="City, Country"
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => handleProfileChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'detection':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Detection Configuration</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-200">Configure your weed detection model settings for optimal performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Detection Model</label>
                <select
                  value={detectionSettings.model}
                  onChange={(e) => setDetectionSettings(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500"
                >
                  <option value="yolov5">YOLOv5 (Recommended)</option>
                  <option value="yolov8">YOLOv8 (Latest)</option>
                  <option value="maskrcnn">Mask R-CNN</option>
                  <option value="unet">U-Net</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Confidence Threshold: {(detectionSettings.confidence * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={detectionSettings.confidence}
                  onChange={(e) => setDetectionSettings(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={detectionSettings.autoProcess}
                  onChange={(e) => setDetectionSettings(prev => ({ ...prev, autoProcess: e.target.checked }))}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <div>
                  <span className="font-medium">Auto-process uploaded images</span>
                  <p className="text-sm text-gray-500">Automatically run detection on newly uploaded images</p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={detectionSettings.saveResults}
                  onChange={(e) => setDetectionSettings(prev => ({ ...prev, saveResults: e.target.checked }))}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <div>
                  <span className="font-medium">Save detection results</span>
                  <p className="text-sm text-gray-500">Store processed results and annotations in your account</p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={detectionSettings.realTimeMode}
                  onChange={(e) => setDetectionSettings(prev => ({ ...prev, realTimeMode: e.target.checked }))}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <div>
                  <span className="font-medium">Real-time detection mode</span>
                  <p className="text-sm text-gray-500">Enable live camera feed processing (requires compatible device)</p>
                </div>
              </label>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Notification Preferences</h4>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-200">Choose how you want to receive updates and alerts.</p>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-3">Detection Alerts</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Email Notifications</span>
                      <p className="text-sm text-gray-500">Receive detection reports via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={() => handleNotificationChange('email')}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Push Notifications</span>
                      <p className="text-sm text-gray-500">Browser push notifications for instant alerts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={() => handleNotificationChange('push')}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">SMS Alerts</span>
                      <p className="text-sm text-gray-500">Critical detection alerts via text message</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={() => handleNotificationChange('sms')}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                  </label>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-3">Report Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Weekly Reports</span>
                      <p className="text-sm text-gray-500">Summary of detection activity</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.reports}
                      onChange={() => handleNotificationChange('reports')}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Detection Completed</span>
                      <p className="text-sm text-gray-500">Notify when batch processing is complete</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.detection}
                      onChange={() => handleNotificationChange('detection')}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-purple-900 dark:text-purple-100">Appearance Settings</h4>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-200">Customize the look and feel of your dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">Theme Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDarkMode(false)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      !darkMode 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    Light
                  </button>
                  <button
                    onClick={() => setDarkMode(true)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      darkMode 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    Dark
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500">
                  <option>English</option>
                  <option>Twi</option>
                  <option>French</option>
                  <option>Spanish</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Time Zone</label>
                <select className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500">
                  <option>GMT (Ghana)</option>
                  <option>UTC</option>
                  <option>EST</option>
                  <option>PST</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date Format</label>
                <select className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-red-900 dark:text-red-100">Security Settings</h4>
              </div>
              <p className="text-sm text-red-700 dark:text-red-200">Protect your account with strong security measures.</p>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-4">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full p-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-4">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable 2FA</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-4">Login Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Last login: Today at 10:30 AM</span>
                    <span className="text-green-600">Current session</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous login: Yesterday at 2:15 PM</span>
                    <span className="text-gray-500">Ghana</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700">View all activity</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900 dark:text-green-100">Data & Privacy</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-200">Manage your data and privacy preferences.</p>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-3">Data Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                  <button className="flex items-center gap-2 p-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <AlertCircle className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-3">Privacy Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Make profile public</span>
                      <p className="text-sm text-gray-500">Allow others to view your profile</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Share detection statistics</span>
                      <p className="text-sm text-gray-500">Help improve the system with anonymous data</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Marketing communications</span>
                      <p className="text-sm text-gray-500">Receive updates about new features</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                  </label>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-3">Storage Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Images</span>
                    <span>2.3 GB of 5 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '46%'}}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Models & Results</span>
                    <span>Reports & Exports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="bg-green-600 text-white px-4 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <h1 className="text-2xl font-bold">Weed Detection Dashboard</h1>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex gap-4">
              <a href="/" className="hover:text-green-200">Home</a>
              <a href="#" className="hover:text-green-200">Gallery</a>
            </nav>
            <div className="flex items-center space-x-2">
              <label className="text-sm">Dark Mode</label>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                className="toggle-checkbox h-4 w-4"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Settings</h2>
            <button
              onClick={saveSettings}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-l-4 border-green-600'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h3>
                <div className="h-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full w-16"></div>
              </div>
              
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-600 text-white mt-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-2 md:space-y-0">
          <p>© {new Date().getFullYear()} Weed Detection Dashboard</p>
          <div className="flex gap-4">
            <a href="/docs" className="hover:underline">Documentation</a>
            <a href="/support" className="hover:underline">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}