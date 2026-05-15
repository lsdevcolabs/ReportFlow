"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile navigation is visible only on small screens */}
      <MobileSidebar />
      
      {/* Desktop sidebar is visible only on md+ screens */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main content area shifts right on desktop to make room for the fixed sidebar */}
      <div className="md:pl-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}