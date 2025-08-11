import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/index";
import NotFound from "./pages/NotFound";
import RecentScans from "./pages/RecentScans";
import React from "react";
import UploadImagery from "./pages/UploadImagery.tsx";
import ExportMap from "./pages/ExportMap";
import SystemStatus from './pages/SystemStatus';
import Settings from './pages/Settings';
import AccuracyPage from './pages/AccuracyPage';
import FalsePositiveRatePage from "./pages/FalsePositiveRatePage.tsx"; 
import WeedWiseHelpPage from "./pages/WeedWiseHelpPage.tsx";
import WeedWiseResponseTimePage from "./pages/WeedWiseResponseTimePage.tsx";
import WeedWiseCoverageEfficiencyPage from "./pages/WeedWiseCoverageEfficiencyPage.tsx";
import WeedDetectionDocs from "./pages/WeedDetectionDocs.tsx";
import Gallery from "./pages/Gallery.tsx";
import MediCoAuth from "./pages/MediCoAuth.tsx";




const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/RecentScans" element={<RecentScans />} />
           <Route path="/UploadImagery" element={<UploadImagery />} />
           <Route path="/ExportMap" element={<ExportMap />} />
          <Route path="/SystemStatus" element={<SystemStatus />} />
           <Route path="/Settings" element={<Settings />} />
           <Route path="/AccuracyPage" element={<AccuracyPage />} />
          <Route path="/FalsePositiveRatePage" element={<FalsePositiveRatePage />} />
          <Route path="/WeedWiseHelpPage" element={<WeedWiseHelpPage />} />
          <Route path="/WeedWiseResponseTimePage" element={<WeedWiseResponseTimePage />} />
          <Route path="/WeedWiseCoverageEfficiencyPage" element={<WeedWiseCoverageEfficiencyPage />} />
          <Route path="/WeedDetectionDocs" element={<WeedDetectionDocs />} />
          <Route path="/Gallery" element={<Gallery />} />
          <Route path="/MediCoAuth" element={<MediCoAuth />} />
          {/* Add more routes as needed */}
          

           
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
