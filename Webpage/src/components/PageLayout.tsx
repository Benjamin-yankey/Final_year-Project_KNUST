import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface PageLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: "/", label: "Home" },
  { to: "/ExportMap", label: "Export Map" },
  { to: "/Gallery", label: "Gallery" },
  { to: "/AccuracyPage", label: "Accuracy" },
  { to: "/FalsePositiveRatePage", label: "False Positives" },
  { to: "/WeedWiseResponseTimePage", label: "Response Time" },
  { to: "/WeedWiseCoverageEfficiencyPage", label: "Coverage" },
  { to: "/Settings", label: "Settings" },
  { to: "/WeedDetectionDocs", label: "Docs" },
];

export default function PageLayout({ children }: PageLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-green-600 text-white p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl font-bold">WeedWise Dashboard</h1>
          <nav className="flex flex-wrap justify-center sm:justify-end items-center gap-3 sm:gap-6 text-sm sm:text-base">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`transition-colors ${
                  location.pathname === item.to ? "text-green-200 underline" : "hover:text-green-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}