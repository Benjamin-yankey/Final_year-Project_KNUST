import React, { useEffect, useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Camera,
  Database,
  Save,
  Upload,
  Download,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Info,
  LogOut,
  ChevronDown,
  ChevronRight,
  Settings as SettingsIcon,
  HardDrive,
  Globe,
  Calendar,
  Clock,
  Mail,
  Smartphone as Phone,
} from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import {
  Lock,
  FileText,
  FileSpreadsheet,
  FileArchive,
  ImageIcon,
} from "lucide-react";

// Toast component moved outside
interface ToastProps {
  show: boolean;
  message: string;
  type: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ show, message, type, onClose }) => {
  if (!show) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "info":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`px-4 py-2 rounded-lg shadow-lg ${getTypeStyles()}`}>
        <div className="flex items-center justify-between">
          <span>{message}</span>
          <button
            onClick={onClose}
            className="ml-2 text-white/80 hover:text-white"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// ProgressBar component moved outside
interface ProgressBarProps {
  value: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, className = "" }) => {
  return (
    <div
      className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${className}`}
    >
      <div
        className="bg-green-500 h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

// User profile interface
interface UserProfile {
  firstName?: string;
  lastName?: string;
  username?: string;
  primaryEmailAddress?: {
    emailAddress?: string;
  };
  imageUrl?: string | null;
}

export default function Settings() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();

  // ALL HOOKS MUST BE DECLARED HERE AT THE TOP - BEFORE ANY CONDITIONAL LOGIC OR EARLY RETURNS
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [toastState, setToastState] = useState({
    show: false,
    message: "",
    type: "",
  });

  const [expandedSections, setExpandedSections] = useState({
    notifications: true,
    security: true,
    data: true,
    reports: true,
    updates: true,
    password: true,
    twofa: true,
    sessions: true,
    export: true,
    storage: true,
    privacy: true,
    maintenance: true,
  });

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    bio: "Agricultural researcher specializing in precision farming and weed detection systems.",
    location: "Kumasi, Ghana",
    website: "",
    avatar: null as string | null,
    role: "Premium Member",
    joinDate: "Joined March 2023",
    lastActive: "Active 2 hours ago",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    detection: true,
    reports: true,
    weeklyDigest: true,
    productUpdates: false,
    maintenance: false,
  });

  const [detectionSettings, setDetectionSettings] = useState({
    confidence: 0.85,
    model: "yolov5",
    autoProcess: true,
    saveResults: true,
    realTimeMode: false,
    exportFormat: "JSON",
    notificationThreshold: 0.7,
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    activeSessions: [
      {
        id: 1,
        device: "Chrome on Windows",
        location: "Kumasi, GH",
        current: true,
        lastActive: "Now",
      },
      {
        id: 2,
        device: "Safari on iPhone",
        location: "Accra, GH",
        current: false,
        lastActive: "2 days ago",
      },
    ],
  });

  // Update profile when user data changes
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        firstName: user.firstName || "Huey",
        lastName: user.lastName || "Yankey",
        username: user.username || "huey_yankey",
        email: user.primaryEmailAddress?.emailAddress || "huey@example.com",
        avatar: user.imageUrl || null,
      }));
    }
  }, [user]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Check for saved theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setDarkMode(initialTheme === "dark");
  }, []);

  // NOW CONDITIONAL LOGIC CAN SAFELY HAPPEN AFTER ALL HOOKS
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to access settings.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "detection", label: "Detection", icon: Camera },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
    { id: "data", label: "Data & Privacy", icon: Database },
  ];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (type: string) => {
    setNotifications((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Image size should be less than 2MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setProfile((prev) => ({ ...prev, avatar: result }));
          showToast("Profile picture updated successfully", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const showToast = (message: string, type: string) => {
    setToastState({ show: true, message, type });
    setTimeout(() => setToastState((prev) => ({ ...prev, show: false })), 3000);
  };

  const saveSettings = () => {
    showToast("Settings saved successfully!", "success");
  };

  const terminateSession = (id: number) => {
    setSecurity((prev) => ({
      ...prev,
      activeSessions: prev.activeSessions.filter(
        (session) => session.id !== id
      ),
    }));
    showToast("Session terminated", "info");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative group">
                <Avatar
                  src={profile.avatar || undefined}
                  className="ring-4 ring-green-500/20"
                  sx={{ width: 64, height: 64 }}
                >
                  {`${profile.firstName?.[0] ?? ""}${
                    profile.lastName?.[0] ?? ""
                  }`}
                </Avatar>
                <label className="absolute bottom-2 right-2 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-all shadow-lg group-hover:opacity-100 opacity-90">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <Badge color="primary">{profile.role}</Badge>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  @{profile.username}
                </p>

                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Globe className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{profile.joinDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{profile.lastActive}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) =>
                    handleProfileChange("firstName", e.target.value)
                  }
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) =>
                    handleProfileChange("lastName", e.target.value)
                  }
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) =>
                    handleProfileChange("username", e.target.value)
                  }
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>
        );
      // case detection
      case "detection":
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6 rounded-xl border border-green-500/20">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Info className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    Detection Configuration
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Optimize your weed detection model settings for the best
                    performance. Adjust sensitivity, model type, and processing
                    options.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Detection Model
                  </label>
                  <select
                    value={detectionSettings.model}
                    onChange={(e) =>
                      setDetectionSettings((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="yolov5">YOLOv5 (Recommended)</option>
                    <option value="yolov8">YOLOv8 (Latest)</option>
                    <option value="maskrcnn">Mask R-CNN</option>
                    <option value="unet">U-Net</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confidence Threshold:{" "}
                    <span className="font-bold">
                      {(detectionSettings.confidence * 100).toFixed(0)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={detectionSettings.confidence}
                    onChange={(e) =>
                      setDetectionSettings((prev) => ({
                        ...prev,
                        confidence: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10% (More results)</span>
                    <span>100% (Most accurate)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notification Threshold
                  </label>
                  <select
                    value={detectionSettings.notificationThreshold}
                    onChange={(e) =>
                      setDetectionSettings((prev) => ({
                        ...prev,
                        notificationThreshold: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="0.5">50% (All detections)</option>
                    <option value="0.7">70% (Significant detections)</option>
                    <option value="0.9">90% (High confidence only)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={detectionSettings.autoProcess}
                      onChange={(e) =>
                        setDetectionSettings((prev) => ({
                          ...prev,
                          autoProcess: e.target.checked,
                        }))
                      }
                      className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <div>
                      <span className="font-medium">
                        Auto-process uploaded images
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Automatically run detection on newly uploaded images
                        without manual initiation
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={detectionSettings.saveResults}
                      onChange={(e) =>
                        setDetectionSettings((prev) => ({
                          ...prev,
                          saveResults: e.target.checked,
                        }))
                      }
                      className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <div>
                      <span className="font-medium">
                        Save detection results
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Store processed results and annotations in your account
                        for future reference
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={detectionSettings.realTimeMode}
                      onChange={(e) =>
                        setDetectionSettings((prev) => ({
                          ...prev,
                          realTimeMode: e.target.checked,
                        }))
                      }
                      className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <div>
                      <span className="font-medium">
                        Real-time detection mode
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enable live camera feed processing (requires compatible
                        device and browser permissions)
                      </p>
                    </div>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Export Format
                  </label>
                  <select
                    value={detectionSettings.exportFormat}
                    onChange={(e) =>
                      setDetectionSettings((prev) => ({
                        ...prev,
                        exportFormat: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="JSON">JSON (Recommended)</option>
                    <option value="CSV">CSV (Spreadsheets)</option>
                    <option value="XML">XML (Legacy systems)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      // case "notifications":
      case "notifications":
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-6 rounded-xl border border-yellow-500/20">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    Notification Preferences
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Choose how you want to receive updates and alerts about your
                    weed detection activities and account.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection("notifications")}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Detection Alerts</span>
                  </div>
                  {expandedSections.notifications ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>

                {expandedSections.notifications && (
                  <div className="p-4 pt-0 space-y-4">
                    <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <div>
                        <span className="font-medium">Email Notifications</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Notifications about new features and improvements
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.productUpdates}
                        onChange={() =>
                          handleNotificationChange("productUpdates")
                        }
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <div>
                        <span className="font-medium">Maintenance Alerts</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Notifications about scheduled maintenance and downtime
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.maintenance}
                        onChange={() => handleNotificationChange("maintenance")}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 rounded-xl border border-purple-500/20">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    Appearance Settings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Customize the look and feel of your dashboard to match your
                    preferences.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Theme Mode
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDarkMode(false)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      !darkMode
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Monitor className="w-6 h-6" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setDarkMode(true)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      darkMode
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Smartphone className="w-6 h-6" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      // case "security":
      case "notifications":
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-6 rounded-xl border border-yellow-500/20">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    Notification Preferences
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Choose how you want to receive updates and alerts about your
                    weed detection activities and account.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection("notifications")}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Detection Alerts</span>
                  </div>
                  {expandedSections.notifications ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>

                {expandedSections.notifications && (
                  <div className="p-4 pt-0 space-y-4">
                    <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <div>
                        <span className="font-medium">Email Notifications</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Notifications about new features and improvements
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.productUpdates}
                        onChange={() =>
                          handleNotificationChange("productUpdates")
                        }
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <div>
                        <span className="font-medium">Maintenance Alerts</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Notifications about scheduled maintenance and downtime
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.maintenance}
                        onChange={() => handleNotificationChange("maintenance")}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      // case "security":
      case "security":
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-6 rounded-xl border border-red-500/20">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    Security Settings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Protect your account with strong security measures and
                    monitor active sessions.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection("password")}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">
                      Password & Authentication
                    </span>
                  </div>
                  {expandedSections.password ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>

                {expandedSections.password && (
                  <div className="p-4 pt-0 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full p-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className="pt-2">
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection("2fa")}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span className="font-medium">
                      Two-Factor Authentication
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        security.twoFactorEnabled
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {security.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </span>
                    {expandedSections.twofa ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {expandedSections.twofa && (
                  <div className="p-4 pt-0 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable 2FA</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={security.twoFactorEnabled}
                          onChange={() =>
                            setSecurity((prev) => ({
                              ...prev,
                              twoFactorEnabled: !prev.twoFactorEnabled,
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                    {security.twoFactorEnabled && (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                              <p className="font-medium">
                                Set up authenticator app
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Scan the QR code with an authenticator app like
                                Google Authenticator or Authy
                              </p>
                              <div className="mt-3 flex flex-wrap gap-4">
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  {/* Placeholder for QR code */}
                                  <div className="w-32 h-32 bg-gray-100 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">
                                      QR Code
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Manual entry code
                                      </label>
                                      <div className="mt-1 font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                        JBSWY3DPEHPK3PXP
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Verification code
                                      </label>
                                      <input
                                        type="text"
                                        className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 mt-1"
                                        placeholder="Enter 6-digit code"
                                      />
                                    </div>
                                    <button className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                                      Verify & Activate
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <Phone className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium">SMS verification</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Receive verification codes via text message
                              </p>
                              <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Phone number
                                </label>
                                <div className="mt-1 flex gap-2">
                                  <select className="w-20 p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                                    <option>+233</option>
                                    <option>+1</option>
                                    <option>+44</option>
                                  </select>
                                  <input
                                    type="tel"
                                    className="flex-1 p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                    placeholder="Phone number"
                                  />
                                </div>
                                <button className="mt-3 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                                  Send Verification Code
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection("sessions")}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Active Sessions</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {security.activeSessions.length} active
                    </span>
                  </div>
                  {expandedSections.sessions ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>

                {expandedSections.sessions && (
                  <div className="p-4 pt-0 space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      These are devices that are currently logged in to your
                      account. Revoke any sessions that you don't recognize.
                    </p>

                    <div className="space-y-3">
                      {security.activeSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-3 rounded-lg border ${
                            session.current
                              ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {session.device.includes("iPhone") ||
                              session.device.includes("Android") ? (
                                <Smartphone className="w-5 h-5 text-gray-500" />
                              ) : (
                                <Monitor className="w-5 h-5 text-gray-500" />
                              )}
                              <div>
                                <p className="font-medium">{session.device}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {session.location} • {session.lastActive}
                                  {session.current && (
                                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                                      Current session
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            {!session.current && (
                              <button
                                onClick={() => terminateSession(session.id)}
                                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Revoke all other sessions
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              This section is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-6 h-6 text-green-500" />
                <h1 className="text-2xl font-bold">Settings</h1>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 sm:p-8">{renderTabContent()}</div>

              <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-700/20 flex justify-end">
                <button
                  onClick={saveSettings}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      <Toast
        show={toastState.show}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
