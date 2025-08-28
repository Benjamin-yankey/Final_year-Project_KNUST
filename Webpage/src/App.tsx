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
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import CaseStudies from "./pages/CaseStudies";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Documentation from "./pages/Documentation";
import APIReference from "./pages/APIReference";
import HelpCenter from "./pages/HelpCenter";
import Webinars from "./pages/Webinars";
import Community from "./pages/Community";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";

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
        <Route path="/SystemStatus" element={<SystemStatus />} />
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
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/api-reference" element={<APIReference />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/webinars" element={<Webinars />} />
        <Route path="/community" element={<Community />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
