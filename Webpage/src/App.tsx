import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/index";
import NotFound from "./pages/NotFound";
import RecentScans from "./pages/RecentScans";
import React from "react";
import UploadImagery from "./pages/UploadImagery";
import ExportMap from "./pages/ExportMap";
import SystemStatus from "./pages/SystemStatus";
import AccuracyPage from "./pages/AccuracyPage";
import FalsePositiveRatePage from "./pages/FalsePositiveRatePage";
import WeedWiseHelpPage from "./pages/WeedWiseHelpPage";
import WeedWiseResponseTimePage from "./pages/WeedWiseResponseTimePage";
import WeedWiseCoverageEfficiencyPage from "./pages/WeedWiseCoverageEfficiencyPage";
import WeedDetectionDocs from "./pages/WeedDetectionDocs";
import Gallery from "./pages/Gallery";
import MediCoAuth from "./pages/MediCoAuth";
import Clerk from "./pages/clerk";
import Settings from "./pages/Settings";
import AIStatus from "./pages/AIStatus";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/RecentScans" element={<RecentScans />} />
        <Route path="/UploadImagery" element={<UploadImagery />} />
        <Route path="/ExportMap" element={<ExportMap />} />
        <Route path="/system-status" element={<SystemStatus />} />
        <Route path="/AccuracyPage" element={<AccuracyPage />} />
        <Route
          path="/FalsePositiveRatePage"
          element={<FalsePositiveRatePage />}
        />
        <Route path="/WeedWiseHelpPage" element={<WeedWiseHelpPage />} />
        <Route
          path="/WeedWiseResponseTimePage"
          element={<WeedWiseResponseTimePage />}
        />
        <Route
          path="/WeedWiseCoverageEfficiencyPage"
          element={<WeedWiseCoverageEfficiencyPage />}
        />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/WeedDetectionDocs" element={<WeedDetectionDocs />} />
        <Route path="/Gallery" element={<Gallery />} />
        <Route path="/clerk" element={<Clerk />} />
        <Route path="/ai-status" element={<AIStatus />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
