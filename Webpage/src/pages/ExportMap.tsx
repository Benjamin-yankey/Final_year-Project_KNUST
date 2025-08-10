// src/pages/ExportMap.tsx
import React, { useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import html2canvas from "html2canvas";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue - using CDN URLs
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Enhanced location data with more details
const scanLocations = [
  { 
    id: 1, 
    lat: 7.9465, 
    lng: -1.0232, 
    label: "Central Ghana", 
    description: "Main scanning facility",
    scanCount: 1250,
    status: "active"
  },
  { 
    id: 2, 
    lat: 5.5600, 
    lng: -0.2050, 
    label: "Accra Field", 
    description: "Primary urban deployment",
    scanCount: 2340,
    status: "active"
  },
  { 
    id: 3, 
    lat: 6.6910, 
    lng: -1.6080, 
    label: "Kumasi North", 
    description: "Regional coverage point",
    scanCount: 890,
    status: "maintenance"
  },
];

// Map bounds calculator component
const MapBoundsUpdater: React.FC<{ locations: typeof scanLocations }> = ({ locations }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, locations]);
  
  return null;
};

// Export configuration interface
interface ExportConfig {
  format: 'png' | 'jpeg';
  quality: number;
  scale: number;
  includeAttribution: boolean;
}

const ExportMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'png',
    quality: 1.0,
    scale: 2,
    includeAttribution: true
  });
  const [lastExportTime, setLastExportTime] = useState<Date | null>(null);

  const handleExport = useCallback(async () => {
    if (!mapRef.current || isExporting) return;

    setIsExporting(true);
    
    try {
      // Wait for map tiles to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: exportConfig.scale,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure all images are loaded in the cloned document
          const images = clonedDoc.getElementsByTagName('img');
          return Promise.all(
            Array.from(images).map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
              });
            })
          );
        }
      });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `ghana-scan-locations-${timestamp}.${exportConfig.format}`;

      // Create download link
      const link = document.createElement("a");
      link.download = filename;
      
      if (exportConfig.format === 'jpeg') {
        link.href = canvas.toDataURL("image/jpeg", exportConfig.quality);
      } else {
        link.href = canvas.toDataURL("image/png");
      }
      
      link.click();
      setLastExportTime(new Date());
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.textContent = `Map exported successfully as ${filename}`;
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);
      
    } catch (error) {
      console.error('Export failed:', error);
      
      // Show error message
      const errorMsg = document.createElement('div');
      errorMsg.textContent = 'Export failed. Please try again.';
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      document.body.appendChild(errorMsg);
      setTimeout(() => document.body.removeChild(errorMsg), 3000);
    } finally {
      setIsExporting(false);
    }
  }, [exportConfig, isExporting]);

  const exportToPDF = useCallback(async () => {
    if (!mapRef.current) return;
    
    try {
      // For now, we'll export as high-quality image and suggest PDF conversion
      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        scale: 3,
        backgroundColor: '#ffffff'
      });
      
      // Create a new window with the image and print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Ghana Scan Locations Map</title>
              <style>
                body { margin: 0; padding: 20px; text-align: center; }
                img { max-width: 100%; height: auto; }
                h1 { font-family: Arial, sans-serif; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <h1>Ghana Scan Locations Map</h1>
              <img src="${canvas.toDataURL()}" alt="Ghana Scan Locations Map" />
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
      }
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try the image export instead.');
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'maintenance': return 'text-yellow-600';
      case 'inactive': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="bg-green-600 text-white p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Weed Detection Dashboard</h1>
            <nav className="flex space-x-6">
              <a href="/" className="hover:text-green-200 transition-colors">Home</a>
              <a href="#" className="hover:text-green-200 transition-colors">Gallery</a>
              <a href="/Settings" className="hover:text-green-200 transition-colors">Settings</a>
              <a href="#" className="hover:text-green-200 transition-colors">Help</a>
            </nav>
          </div>
        </header>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Ghana Scan Locations Map</h1>
        <p className="text-gray-600">Export interactive maps with scan location data</p>
      </div>

      {/* Export Configuration Panel */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Export Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Format</label>
            <select 
              value={exportConfig.format}
              onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value as 'png' | 'jpeg' }))}
              className="w-full p-2 border rounded"
            >
              <option value="png">PNG (High Quality)</option>
              <option value="jpeg">JPEG (Smaller Size)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Quality</label>
            <select 
              value={exportConfig.quality}
              onChange={(e) => setExportConfig(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
              className="w-full p-2 border rounded"
              disabled={exportConfig.format === 'png'}
            >
              <option value={1.0}>High (100%)</option>
              <option value={0.8}>Medium (80%)</option>
              <option value={0.6}>Low (60%)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Resolution</label>
            <select 
              value={exportConfig.scale}
              onChange={(e) => setExportConfig(prev => ({ ...prev, scale: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded"
            >
              <option value={1}>Standard (1x)</option>
              <option value={2}>High (2x)</option>
              <option value={3}>Ultra (3x)</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input 
                type="checkbox"
                checked={exportConfig.includeAttribution}
                onChange={(e) => setExportConfig(prev => ({ ...prev, includeAttribution: e.target.checked }))}
                className="mr-2"
              />
              Include Attribution
            </label>
          </div>
        </div>
      </div>

      {/* Location Summary */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Location Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scanLocations.map((location) => (
            <div key={location.id} className="bg-white rounded p-3 shadow-sm">
              <h4 className="font-medium">{location.label}</h4>
              <p className="text-sm text-gray-600 mb-1">{location.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span>Scans: {location.scanCount.toLocaleString()}</span>
                <span className={`font-medium ${getStatusColor(location.status)}`}>
                  {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="h-[400px] md:h-[600px] w-full rounded-lg overflow-hidden shadow-lg border-2 border-gray-200"
      >
        <MapContainer 
          center={[7.9465, -1.0232]} 
          zoom={6} 
          scrollWheelZoom={true} 
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution={exportConfig.includeAttribution ? '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors' : ''}
            maxZoom={18}
          />
          <MapBoundsUpdater locations={scanLocations} />
          {scanLocations.map((loc) => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]}>
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-lg">{loc.label}</h4>
                  <p className="text-gray-600 mb-2">{loc.description}</p>
                  <div className="text-sm">
                    <p><strong>Total Scans:</strong> {loc.scanCount.toLocaleString()}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-1 font-medium ${getStatusColor(loc.status)}`}>
                        {loc.status.charAt(0).toUpperCase() + loc.status.slice(1)}
                      </span>
                    </p>
                    <p><strong>Coordinates:</strong> {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Export Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`${
            isExporting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          } text-white px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2`}
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export as Image
            </>
          )}
        </button>

        <button
          onClick={exportToPDF}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Print/Save as PDF
        </button>

        <div className="text-sm text-gray-600">
          {lastExportTime && (
            <p>Last export: {lastExportTime.toLocaleString()}</p>
          )}
          <p>Total locations: {scanLocations.length}</p>
        </div>
      </div>

      {/* Export Tips */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Export Tips</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Wait for all map tiles to load before exporting for best quality</li>
          <li>• Use PNG format for highest quality, JPEG for smaller file sizes</li>
          <li>• Higher resolution (2x, 3x) creates larger, more detailed images</li>
          <li>• PDF export opens a print dialog - use "Save as PDF" in your browser</li>
        </ul>
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
};export default ExportMap;