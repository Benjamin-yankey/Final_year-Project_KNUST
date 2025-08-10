// Types for our scan data
export interface ScanData {
  id: number;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  weedCount: number;
  status: "Completed" | "Processing" | "Failed";
  accuracy: string;
}

// Key for localStorage
const SCANS_STORAGE_KEY = 'weed_detection_scans';

// Get all scans from localStorage
export const getScans = (): ScanData[] => {
  try {
    const stored = localStorage.getItem(SCANS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading scans from localStorage:', error);
    return [];
  }
};

// Save a new scan to localStorage
export const saveScan = (scan: Omit<ScanData, 'id'>): ScanData => {
  try {
    const scans = getScans();
    const newScan: ScanData = {
      ...scan,
      id: Date.now(), // Simple ID generation using timestamp
    };
    
    // Add to beginning of array (newest first)
    scans.unshift(newScan);
    
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(scans));
    return newScan;
  } catch (error) {
    console.error('Error saving scan to localStorage:', error);
    throw error;
  }
};

// Generate mock scan data (simulating real-time collection)
export const generateMockScan = (): Omit<ScanData, 'id'> => {
  const locations = ["Field A-North", "Field B-South", "Field C-West", "Field D-East"];
  const now = new Date();
  
  return {
    date: now.toISOString().split('T')[0], // YYYY-MM-DD format
    time: now.toTimeString().split(' ')[0].slice(0, 5), // HH:MM format
    location: locations[Math.floor(Math.random() * locations.length)],
    imageUrl: "/placeholder.svg", // We'll improve this later
    weedCount: Math.floor(Math.random() * 100) + 1,
    status: Math.random() > 0.8 ? "Processing" : "Completed",
    accuracy: Math.random() > 0.8 ? "N/A" : `${Math.floor(Math.random() * 10) + 90}%`
  };
};