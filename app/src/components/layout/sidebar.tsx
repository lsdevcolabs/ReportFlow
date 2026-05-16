"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  Settings,
  CreditCard,
  Zap,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const mainNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Reports", href: "/reports", icon: FileBarChart },
];

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Upgrade", href: "/upgrade", icon: CreditCard },
];

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

export function Sidebar() {
  const pathname = usePathname();
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.plan) {
            setPlan(data.user.plan);
          }
        }
      } catch {
        // Ignore errors
      }
    }
    fetchPlan();
  }, [pathname]); // Re-fetch when navigating to catch plan updates

  return (
    <div className="fixed inset-y-0 z-50 flex w-64 flex-col bg-card border-r">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">ReportFlow</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-y-6 px-4 py-6">
        <div className="space-y-1">
          {mainNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <Separator />

        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            const isUpgradeHighlight = item.name === "Upgrade" && plan === "free" && !isActive;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isUpgradeHighlight
                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {isUpgradeHighlight && (
                  <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    !
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer / Plan Badge */}
      <div className="shrink-0 border-t p-4">
        <div className={cn(
          "rounded-lg p-3",
          plan !== "free" ? "bg-primary/10" : "bg-muted/50"
        )}>
          <p className="text-xs font-medium text-muted-foreground">Current Plan</p>
          <p className={cn(
            "text-sm font-semibold capitalize",
            plan !== "free" && "text-primary"
          )}>
            {PLAN_LABELS[plan] || "Free"}
          </p>
        </div>
      </div>
    </div>
  );
}