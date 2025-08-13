import React, { useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ScaleControl } from "react-leaflet";
import html2canvas from "html2canvas";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue - using CDN URLs
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Enhanced location data with more agricultural details
const scanLocations = [
  { 
    id: 1, 
    lat: 7.9465, 
    lng: -1.0232, 
    label: "Central Ghana Farmlands", 
    description: "Primary maize cultivation region",
    scanCount: 1250,
    status: "active",
    cropType: "Maize",
    weedDensity: "Medium",
    lastScan: "2023-06-15",
    area: "450 hectares"
  },
  { 
    id: 2, 
    lat: 5.5600, 
    lng: -0.2050, 
    label: "Accra Coastal Plains", 
    description: "Vegetable and root crop zone",
    scanCount: 2340,
    status: "active",
    cropType: "Mixed Vegetables",
    weedDensity: "High",
    lastScan: "2023-06-18",
    area: "320 hectares"
  },
  { 
    id: 3, 
    lat: 6.6910, 
    lng: -1.6080, 
    label: "Kumasi North Plantations", 
    description: "Cocoa and oil palm region",
    scanCount: 890,
    status: "maintenance",
    cropType: "Cocoa",
    weedDensity: "Low",
    lastScan: "2023-06-10",
    area: "680 hectares"
  },
  { 
    id: 4, 
    lat: 9.4000, 
    lng: -0.8500, 
    label: "Northern Savannah Fields", 
    description: "Sorghum and millet belt",
    scanCount: 760,
    status: "active",
    cropType: "Sorghum",
    weedDensity: "Very High",
    lastScan: "2023-06-12",
    area: "550 hectares"
  },
];

// Map bounds calculator component
const MapBoundsUpdater: React.FC<{ locations: typeof scanLocations }> = ({ locations }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, locations]);
  
  return null;
};

// Custom marker icons
const createCustomIcon = (status: string) => {
  let iconColor;
  switch (status) {
    case 'active': iconColor = '#10B981'; 
    case 'maintenance': iconColor = '#F59E0B'; 
    default: iconColor = '#EF4444'; 
  }
  
  return new L.DivIcon({
    html: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="${iconColor}" stroke-width="2" fill="white" class="transform -translate-x-1/2 -translate-y-1/2">
      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
};

// Export configuration interface
interface ExportConfig {
  format: 'png' | 'jpeg' | 'svg';
  quality: number;
  scale: number;
  includeAttribution: boolean;
  includeLegend: boolean;
  includeScale: boolean;
  title: string;
  subtitle: string;
}

const ExportMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'png',
    quality: 1.0,
    scale: 2,
    includeAttribution: true,
    includeLegend: true,
    includeScale: true,
    title: 'Ghana Agricultural Scan Locations',
    subtitle: 'Weed detection and crop health monitoring'
  });
  const [lastExportTime, setLastExportTime] = useState<Date | null>(null);
  const [activeLocation, setActiveLocation] = useState<typeof scanLocations[0] | null>(null);

  const handleExport = useCallback(async () => {
    if (!mapRef.current || isExporting) return;

    setIsExporting(true);
    
    try {
      // Create a temporary overlay with export configuration
      const overlay = document.createElement('div');
      overlay.className = 'absolute top-0 left-0 w-full h-full pointer-events-none z-10';
      overlay.innerHTML = `
        <div class="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded shadow-lg max-w-xs">
          <h3 class="font-bold text-lg">${exportConfig.title}</h3>
          <p class="text-sm mb-2">${exportConfig.subtitle}</p>
          ${exportConfig.includeLegend ? `
            <div class="flex flex-col space-y-1 text-xs">
              <div class="flex items-center">
                <span class="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span>Active Location</span>
              </div>
              <div class="flex items-center">
                <span class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                <span>Maintenance</span>
              </div>
              <div class="flex items-center">
                <span class="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                <span>Inactive</span>
              </div>
            </div>
          ` : ''}
        </div>
        <div class="absolute bottom-4 right-4 bg-white bg-opacity-90 p-2 rounded text-xs">
          ${exportConfig.includeAttribution ? 'Map data © OpenStreetMap contributors' : ''}
        </div>
      `;
      mapRef.current.appendChild(overlay);

      // Wait for map tiles and overlay to render
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: exportConfig.scale,
        backgroundColor: '#ffffff',
        logging: false,
        ignoreElements: (element) => {
          // Ignore elements that shouldn't be in the export
          return element.classList.contains('leaflet-control-container') && !exportConfig.includeScale;
        }
      });

      // Remove the temporary overlay
      mapRef.current.removeChild(overlay);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `ghana-agri-scan-map-${timestamp}.${exportConfig.format}`;

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
      
      // Show success notification
      showNotification(`Map exported successfully as ${filename}`, 'success');
      
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('Export failed. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [exportConfig, isExporting]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const exportToPDF = useCallback(async () => {
    if (!mapRef.current) return;
    
    try {
      // Create temporary overlay for PDF export
      const overlay = document.createElement('div');
      overlay.className = 'absolute top-0 left-0 w-full h-full pointer-events-none z-10';
      overlay.innerHTML = `
        <div class="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded shadow-lg max-w-xs">
          <h3 class="font-bold text-lg">${exportConfig.title}</h3>
          <p class="text-sm mb-2">${exportConfig.subtitle}</p>
          ${exportConfig.includeLegend ? `
            <div class="flex flex-col space-y-1 text-xs">
              <div class="flex items-center">
                <span class="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span>Active Location</span>
              </div>
              <div class="flex items-center">
                <span class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                <span>Maintenance</span>
              </div>
              <div class="flex items-center">
                <span class="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                <span>Inactive</span>
              </div>
            </div>
          ` : ''}
        </div>
        <div class="absolute bottom-4 right-4 bg-white bg-opacity-90 p-2 rounded text-xs">
          ${exportConfig.includeAttribution ? 'Map data © OpenStreetMap contributors' : ''}
        </div>
      `;
      mapRef.current.appendChild(overlay);

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        scale: 3,
        backgroundColor: '#ffffff'
      });
      
      // Remove overlay
      mapRef.current.removeChild(overlay);

      // Create a new window with the image and print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${exportConfig.title}</title>
              <style>
                @page { size: auto; margin: 10mm; }
                body { margin: 0; padding: 20px; text-align: center; font-family: Arial, sans-serif; }
                .header { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                .map-container { margin: 0 auto; max-width: 100%; }
                img { max-width: 100%; height: auto; border: 1px solid #ddd; }
                h1 { font-size: 24px; margin-bottom: 5px; color: #333; }
                .subtitle { font-size: 16px; color: #666; margin-bottom: 15px; }
                .footer { margin-top: 20px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
                .location-details { margin-top: 20px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${exportConfig.title}</h1>
                <p class="subtitle">${exportConfig.subtitle}</p>
                <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              </div>
              
              <div class="map-container">
                <img src="${canvas.toDataURL()}" alt="${exportConfig.title}" />
              </div>
              
              ${activeLocation ? `
                <div class="location-details">
                  <h3>Selected Location: ${activeLocation.label}</h3>
                  <table>
                    <tr><th>Description</th><td>${activeLocation.description}</td></tr>
                    <tr><th>Crop Type</th><td>${activeLocation.cropType}</td></tr>
                    <tr><th>Weed Density</th><td>${activeLocation.weedDensity}</td></tr>
                    <tr><th>Area</th><td>${activeLocation.area}</td></tr>
                    <tr><th>Last Scan</th><td>${activeLocation.lastScan}</td></tr>
                    <tr><th>Total Scans</th><td>${activeLocation.scanCount.toLocaleString()}</td></tr>
                    <tr><th>Status</th><td>${activeLocation.status.charAt(0).toUpperCase() + activeLocation.status.slice(1)}</td></tr>
                    <tr><th>Coordinates</th><td>${activeLocation.lat.toFixed(4)}, ${activeLocation.lng.toFixed(4)}</td></tr>
                  </table>
                </div>
              ` : ''}
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} WeedWise Analytics. All rights reserved.</p>
                ${exportConfig.includeAttribution ? '<p>Map data © OpenStreetMap contributors</p>' : ''}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
      }
    } catch (error) {
      console.error('PDF export failed:', error);
      showNotification('PDF export failed. Please try the image export instead.', 'error');
    }
  }, [exportConfig, activeLocation]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'maintenance': return 'text-yellow-600';
      case 'inactive': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getWeedDensityColor = (density: string) => {
    switch (density.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'very high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <h1 className="text-xl md:text-2xl font-bold">WeedWise Analytics</h1>
            </div>
            <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
              <a href="/" className="hover:text-green-200 transition-colors flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </a>
              <a href="/maps" className="text-green-200 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Maps
              </a>
              <a href="/Settings" className="hover:text-green-200 transition-colors flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Agricultural Scan Locations</h1>
          <p className="text-gray-600">Interactive map of weed detection scan locations across Ghana</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Locations</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{scanLocations.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Scans</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {scanLocations.reduce((sum, loc) => sum + loc.scanCount, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Locations</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {scanLocations.filter(loc => loc.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Last Updated</h3>
  <div className="mt-2 text-3xl font-semibold text-gray-900">
    {new Date(
      Math.max(
        ...scanLocations.map(loc => new Date(loc.lastScan).getTime())
      )
    ).toLocaleDateString()}
  </div>
</div>

        </div>

        {/* Export Configuration Panel */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Export Configuration</h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Map Title</label>
                <input
                  type="text"
                  value={exportConfig.title}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={exportConfig.subtitle}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={exportConfig.format}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value as 'png' | 'jpeg' | 'svg' }))}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="png">PNG (High Quality)</option>
                  <option value="jpeg">JPEG (Smaller Size)</option>
                  <option value="svg">SVG (Vector)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
                <select
                  value={exportConfig.quality}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  disabled={exportConfig.format === 'png' || exportConfig.format === 'svg'}
                >
                  <option value={1.0}>High (100%)</option>
                  <option value={0.9}>Very Good (90%)</option>
                  <option value={0.8}>Good (80%)</option>
                  <option value={0.7}>Medium (70%)</option>
                  <option value={0.6}>Low (60%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
                <select
                  value={exportConfig.scale}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, scale: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value={1}>Standard (1x)</option>
                  <option value={2}>High (2x)</option>
                  <option value={3}>Ultra (3x)</option>
                </select>
              </div>
              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    id="attribution"
                    name="attribution"
                    type="checkbox"
                    checked={exportConfig.includeAttribution}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, includeAttribution: e.target.checked }))}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>
                <label htmlFor="attribution" className="ml-2 block text-sm text-gray-700">
                  Include Attribution
                </label>
              </div>
              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    id="legend"
                    name="legend"
                    type="checkbox"
                    checked={exportConfig.includeLegend}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, includeLegend: e.target.checked }))}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>
                <label htmlFor="legend" className="ml-2 block text-sm text-gray-700">
                  Include Legend
                </label>
              </div>
              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    id="scale"
                    name="scale"
                    type="checkbox"
                    checked={exportConfig.includeScale}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, includeScale: e.target.checked }))}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>
                <label htmlFor="scale" className="ml-2 block text-sm text-gray-700">
                  Include Scale
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Map and Location Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <div
              ref={mapRef}
              className="h-[500px] w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 relative"
            >
              <MapContainer 
                center={[7.9465, -1.0232]} 
                zoom={7} 
                scrollWheelZoom={true} 
                className="h-full w-full"
                zoomControl={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution={exportConfig.includeAttribution ? '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors' : ''}
                  maxZoom={18}
                />
                <ScaleControl position="bottomleft" imperial={false} />
                <MapBoundsUpdater locations={scanLocations} />
                {scanLocations.map((loc) => (
                  <Marker 
                    key={loc.id} 
                    position={[loc.lat, loc.lng]}
                    eventHandlers={{
                      click: () => setActiveLocation(loc),
                    }}
                    icon={createCustomIcon(loc.status)}
                  >
                    <Popup>
                      <div className="p-2 min-w-[250px]">
                        <h4 className="font-semibold text-lg">{loc.label}</h4>
                        <p className="text-gray-600 mb-2">{loc.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><strong>Crop:</strong></div>
                          <div>{loc.cropType}</div>
                          <div><strong>Weed Density:</strong></div>
                          <div className={getWeedDensityColor(loc.weedDensity)}>{loc.weedDensity}</div>
                          <div><strong>Status:</strong></div>
                          <div className={getStatusBadge(loc.status)}>
                            {loc.status.charAt(0).toUpperCase() + loc.status.slice(1)}
                          </div>
                          <div><strong>Last Scan:</strong></div>
                          <div>{loc.lastScan}</div>
                          <div><strong>Total Scans:</strong></div>
                          <div>{loc.scanCount.toLocaleString()}</div>
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

              <div className="text-sm text-gray-600 ml-0 sm:ml-auto">
                {lastExportTime && (
                  <p className="whitespace-nowrap">Last export: {lastExportTime.toLocaleString()}</p>
                )}
                <p>Total locations: {scanLocations.length}</p>
              </div>
            </div>
          </div>

          {/* Location Details Panel */}
          <div className="bg-white rounded-lg shadow overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {activeLocation ? activeLocation.label : 'Location Details'}
              </h3>
            </div>
            <div className="px-6 py-4">
              {activeLocation ? (
                <div className="space-y-4">
                  <p className="text-gray-600">{activeLocation.description}</p>
                  <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activeLocation.status)}`}>
                    {activeLocation.status.charAt(0).toUpperCase() + activeLocation.status.slice(1)}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Crop Type</h4>
                  <p className="text-gray-900">{activeLocation.cropType}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Weed Density</h4>
                  <p className={`${getWeedDensityColor(activeLocation.weedDensity)}`}>
                    {activeLocation.weedDensity}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Scan</h4>
                  <p className="text-gray-900">{activeLocation.lastScan}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total Scans</h4>
                  <p className="text-gray-900">{activeLocation.scanCount.toLocaleString()}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Area</h4>
                  <p className="text-gray-900">{activeLocation.area}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Coordinates</h4>
                  <p className="text-gray-900">{activeLocation.lat.toFixed(4)}, {activeLocation.lng.toFixed(4)}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button
  // onClick={() => {
  //   const map = mapRef.current;
  //   if (map) {
  //     map.flyTo([activeLocation.lat, activeLocation.lng], 12);
  //   }
  // }}
  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
>
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
  Zoom to Location
</button>

              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No location selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Click on a marker to view detailed information about the scan location.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </main>

  {/* Footer */}
  <footer className="bg-gray-800 text-white py-8">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-xl font-bold">WeedWise Analytics</span>
          </div>
          <p className="mt-2 text-gray-400 text-sm">
            Precision agriculture solutions for weed detection and crop health monitoring.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">API Reference</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Tutorials</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-gray-400 text-center">
        <p>© {new Date().getFullYear()} WeedWise Analytics. All rights reserved.</p>
      </div>
    </div>
  </footer>
</div>
);
};

export default ExportMap;