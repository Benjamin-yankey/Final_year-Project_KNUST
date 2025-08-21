import React, { useState, useEffect } from "react";
import { getScans } from "@/lib/scanStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Download,
  MapPin,
  Search,
  Filter,
  Calendar,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Share,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

// Enhanced mock data with realistic scan results
const mockScans = [
  {
    id: 1,
    date: "2024-08-14",
    time: "09:15",
    location: "North Field - Section A2",
    imageUrl:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop",
    originalImage:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop",
    weedCount: 67,
    totalArea: "2.3 hectares",
    weedDensity: "29 weeds/m²",
    status: "Completed",
    accuracy: "96.2%",
    detectionModel: "YOLOv8",
    processingTime: "1.2s",
    dominantWeedTypes: ["Dandelion", "Plantain", "Clover"],
    recommendations: "Targeted herbicide application recommended in zones 3-7",
    uploadedBy: "John Farmer",
    tags: ["High Priority", "Treatment Required"],
  },
  {
    id: 2,
    date: "2024-08-14",
    time: "11:30",
    location: "South Field - Section B1",
    imageUrl:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
    originalImage:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop",
    weedCount: 23,
    totalArea: "1.8 hectares",
    weedDensity: "13 weeds/m²",
    status: "Completed",
    accuracy: "94.7%",
    detectionModel: "YOLOv8",
    processingTime: "0.9s",
    dominantWeedTypes: ["Crabgrass", "Chickweed"],
    recommendations: "Low weed pressure - monitor for 2 weeks",
    uploadedBy: "Sarah Chen",
    tags: ["Low Priority", "Monitor"],
  },
  {
    id: 3,
    date: "2024-08-14",
    time: "14:45",
    location: "East Field - Section C3",
    imageUrl:
      "https://images.unsplash.com/photo-1592982634040-c0be17c52bf4?w=400&h=300&fit=crop",
    originalImage:
      "https://images.unsplash.com/photo-1592982634040-c0be17c52bf4?w=800&h=600&fit=crop",
    weedCount: 156,
    totalArea: "3.1 hectares",
    weedDensity: "50 weeds/m²",
    status: "Processing",
    accuracy: "N/A",
    detectionModel: "YOLOv8",
    processingTime: "Processing...",
    dominantWeedTypes: [],
    recommendations: "Analysis in progress...",
    uploadedBy: "Mike Johnson",
    tags: ["Processing"],
  },
  {
    id: 4,
    date: "2024-08-13",
    time: "16:20",
    location: "West Field - Section D1",
    imageUrl:
      "https://images.unsplash.com/photo-1566838803980-97ebf5319d7e?w=400&h=300&fit=crop",
    originalImage:
      "https://images.unsplash.com/photo-1566838803980-97ebf5319d7e?w=800&h=600&fit=crop",
    weedCount: 89,
    totalArea: "2.7 hectares",
    weedDensity: "33 weeds/m²",
    status: "Completed",
    accuracy: "97.1%",
    detectionModel: "YOLOv8",
    processingTime: "1.5s",
    dominantWeedTypes: ["Thistle", "Wild Oat", "Field Bindweed"],
    recommendations: "Immediate treatment required - high infestation detected",
    uploadedBy: "Emma Wilson",
    tags: ["Urgent", "Treatment Required"],
  },
  {
    id: 5,
    date: "2024-08-13",
    time: "10:10",
    location: "North Field - Section A1",
    imageUrl:
      "https://images.unsplash.com/photo-1586771107045-af842e192fc5?w=400&h=300&fit=crop",
    originalImage:
      "https://images.unsplash.com/photo-1586771107045-af842e192fc5?w=800&h=600&fit=crop",
    weedCount: 12,
    totalArea: "1.2 hectares",
    weedDensity: "10 weeds/m²",
    status: "Completed",
    accuracy: "95.8%",
    detectionModel: "YOLOv8",
    processingTime: "0.7s",
    dominantWeedTypes: ["Lamb's quarters"],
    recommendations: "Excellent field health - continue current management",
    uploadedBy: "David Park",
    tags: ["Clean Field", "Good Health"],
  },
  {
    id: 6,
    date: "2024-08-12",
    time: "08:45",
    location: "Central Field - Section E2",
    imageUrl:
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=300&fit=crop",
    originalImage:
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&h=600&fit=crop",
    weedCount: 0,
    totalArea: "0.9 hectares",
    weedDensity: "0 weeds/m²",
    status: "Failed",
    accuracy: "N/A",
    detectionModel: "YOLOv8",
    processingTime: "Failed",
    dominantWeedTypes: [],
    recommendations:
      "Image quality too low - please retake with better lighting",
    uploadedBy: "Lisa Zhang",
    tags: ["Failed", "Retake Required"],
  },
];

const RecentScans = () => {
  const [scans, setScans] = useState(mockScans);
  const [filteredScans, setFilteredScans] = useState(mockScans);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedScan, setSelectedScan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load saved scans from localStorage and prepend to mock data
  useEffect(() => {
    try {
      const saved = getScans();
      if (saved && saved.length > 0) {
        // Map saved scans to the richer table shape by filling defaults
        const enriched = saved.map((s) => ({
          ...s,
          originalImage: s.imageUrl,
          totalArea: "N/A",
          weedDensity: `${s.weedCount} weeds/m²`,
          detectionModel: "YOLO (local)",
          processingTime: s.status === "Completed" ? "~1.0s" : s.status,
          dominantWeedTypes: [],
          recommendations: s.weedCount > 50 ? "High weed pressure" : "Normal",
          uploadedBy: "You",
          tags: s.status === "Completed" ? ["Completed"] : [s.status],
        }));
        const combined = [...enriched, ...mockScans];
        setScans(combined);
        setFilteredScans(combined);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Filter scans based on search and status
  useEffect(() => {
    let filtered = scans;

    if (searchTerm) {
      filtered = filtered.filter(
        (scan) =>
          scan.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scan.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scan.dominantWeedTypes.some((weed) =>
            weed.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (scan) => scan.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredScans(filtered);
  }, [searchTerm, statusFilter, scans]);

  // Simulate real-time updates for processing scans
  useEffect(() => {
    const interval = setInterval(() => {
      setScans((prevScans) =>
        prevScans.map((scan) => {
          if (scan.status === "Processing" && Math.random() > 0.7) {
            return {
              ...scan,
              status: "Completed",
              accuracy: `${(Math.random() * 5 + 95).toFixed(1)}%`,
              processingTime: `${(Math.random() * 2 + 0.5).toFixed(1)}s`,
              dominantWeedTypes: ["Dandelion", "Clover", "Plantain"].slice(
                0,
                Math.floor(Math.random() * 3) + 1
              ),
              recommendations:
                scan.weedCount > 50
                  ? "High weed pressure - immediate treatment recommended"
                  : "Moderate weed pressure - schedule treatment within 1 week",
            };
          }
          return scan;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleViewDetails = (scan) => {
    setSelectedScan(scan);
    setShowDetailModal(true);
  };

  const handleDownload = (scan) => {
    // Simulate download
    const link = document.createElement("a");
    link.href = scan.originalImage;
    link.download = `scan_${scan.id}_${scan.date}.jpg`;
    link.click();
  };

  const handleDelete = (scanId) => {
    setScans((prevScans) => prevScans.filter((scan) => scan.id !== scanId));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Processing":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Failed":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (tags) => {
    if (tags.includes("Urgent")) return "text-red-600";
    if (tags.includes("High Priority")) return "text-orange-600";
    if (tags.includes("Low Priority")) return "text-green-600";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Weed Detection Dashboard</h1>
          <nav className="flex space-x-6">
            <a href="/" className="hover:text-green-200 transition-colors">
              Home
            </a>
            <a href="#" className="hover:text-green-200 transition-colors">
              Map
            </a>
            <a href="#" className="hover:text-green-200 transition-colors">
              Analytics
            </a>
            <a href="#" className="hover:text-green-200 transition-colors">
              Reports
            </a>
            <a href="#" className="hover:text-green-200 transition-colors">
              Settings
            </a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-8 px-4 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by location, uploader, or weed type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Upload Button */}
          <Link to="/UploadImagery">
            <Button className="bg-green-600 hover:bg-green-700">
              Upload New Image
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                  <p className="text-2xl font-bold">{scans.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {scans.filter((s) => s.status === "Completed").length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {scans.filter((s) => s.status === "Processing").length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Accuracy</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(
                      scans
                        .filter((s) => s.status === "Completed")
                        .reduce((acc, s) => acc + parseFloat(s.accuracy), 0) /
                      scans.filter((s) => s.status === "Completed").length
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scan History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Scan History ({filteredScans.length} results)</span>
              {filteredScans.length !== scans.length && (
                <Badge variant="secondary">
                  Filtered from {scans.length} total
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Weed Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScans.map((scan) => (
                    <TableRow key={scan.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="relative">
                          <img
                            src={scan.imageUrl}
                            alt="Scan preview"
                            className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => handleViewDetails(scan)}
                          />
                          {scan.weedCount > 50 && (
                            <AlertTriangle className="absolute top-0 right-0 w-4 h-4 text-orange-500 bg-white rounded-full p-0.5" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{scan.date}</div>
                          <div className="text-sm text-muted-foreground">
                            {scan.time}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="max-w-32 truncate">
                            {scan.location}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {scan.weedDensity}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span
                            className={`font-semibold ${getPriorityColor(
                              scan.tags
                            )}`}
                          >
                            {scan.weedCount}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            weeds found
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(scan.status)}
                          <Badge
                            variant="outline"
                            className={getStatusBadgeColor(scan.status)}
                          >
                            {scan.status}
                          </Badge>
                        </div>
                        {scan.status === "Processing" && (
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                            <div
                              className="bg-green-600 h-1 rounded-full animate-pulse"
                              style={{ width: "60%" }}
                            ></div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{scan.accuracy}</span>
                        {scan.processingTime !== "Processing..." &&
                          scan.processingTime !== "Failed" && (
                            <div className="text-xs text-muted-foreground">
                              {scan.processingTime}
                            </div>
                          )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{scan.uploadedBy}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {scan.tags.slice(0, 2).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(scan)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(scan)}
                            disabled={scan.status !== "Completed"}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(scan.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredScans.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No scans found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedScan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Scan Details</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                >
                  ×
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedScan.originalImage}
                    alt="Scan result"
                    className="w-full h-64 object-cover rounded-lg border"
                  />

                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold">Detection Results</h3>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span>Weeds Found:</span>
                        <span className="font-medium">
                          {selectedScan.weedCount}
                        </span>
                        <span>Accuracy:</span>
                        <span className="font-medium">
                          {selectedScan.accuracy}
                        </span>
                        <span>Area Scanned:</span>
                        <span className="font-medium">
                          {selectedScan.totalArea}
                        </span>
                        <span>Processing Time:</span>
                        <span className="font-medium">
                          {selectedScan.processingTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Scan Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-medium">
                          {selectedScan.location}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date & Time:</span>
                        <span className="font-medium">
                          {selectedScan.date} {selectedScan.time}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uploaded By:</span>
                        <span className="font-medium">
                          {selectedScan.uploadedBy}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Model Used:</span>
                        <span className="font-medium">
                          {selectedScan.detectionModel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedScan.dominantWeedTypes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">
                        Detected Weed Types
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedScan.dominantWeedTypes.map((weed, index) => (
                          <Badge key={index} variant="secondary">
                            {weed}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">Recommendations</h3>
                    <p className="text-sm bg-blue-50 p-3 rounded">
                      {selectedScan.recommendations}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => handleDownload(selectedScan)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                    <Button variant="outline">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-200 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
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
            </div>
          </div>

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
    </div>
  );
};

export default RecentScans;
