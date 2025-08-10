import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Download, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for recent scans
const recentScans = [
  {
    id: 1,
    date: "2024-08-05",
    time: "14:30",
    location: "Field A-North",
    imageUrl: "/placeholder.svg",
    weedCount: 45,
    status: "Completed",
    accuracy: "94%"
  },
  {
    id: 2,
    date: "2024-08-05", 
    time: "12:15",
    location: "Field B-South",
    imageUrl: "/placeholder.svg",
    weedCount: 23,
    status: "Completed",
    accuracy: "96%"
  },
  {
    id: 3,
    date: "2024-08-04",
    time: "16:45",
    location: "Field C-West",
    imageUrl: "/placeholder.svg",
    weedCount: 67,
    status: "Processing",
    accuracy: "N/A"
  }
];

const RecentScans = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Green header */}
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
{/* Main content */}
<main className="max-w-5xl mx-auto py-8 px-4 space-y-8">
  <div className="flex justify-end mb-4">
  <Link to="/UploadImagery">
    <Button className="bg-green-600 hover:bg-green-700">
      Upload New Image
    </Button>
  </Link>
</div>

        
        <Card>
          <CardHeader>
            <CardTitle>Scan History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Weed Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentScans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell>
                      <img 
                        src={scan.imageUrl} 
                        alt="Scan image" 
                        className="w-16 h-16 object-cover rounded border"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{scan.date}</div>
                        <div className="text-sm text-muted-foreground">{scan.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {scan.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{scan.weedCount}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={scan.status === "Completed" ? "default" : "secondary"}
                        className={scan.status === "Completed" ? "bg-green-100 text-green-800" : ""}
                      >
                        {scan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{scan.accuracy}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RecentScans;