import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Clients", href: "/clients" },
  { icon: FileBarChart, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  const handleSignOut = () => {
    signOut().then(() => { window.location.href = "/"; });
  };

  const isActive = (href: string) =>
    location === href || (location.startsWith(href) && href !== "/");

  return (
    <div className="flex h-[100dvh] bg-muted/20 overflow-hidden">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar — desktop persistent, mobile slide-in */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r flex flex-col transition-transform duration-200 ease-in-out",
          "md:translate-x-0 md:static md:flex",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={closeSidebar}>
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              RF
            </div>
            <span className="font-bold text-lg tracking-tight">ReportFlow</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden h-8 w-8"
            onClick={closeSidebar}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid={`nav-link-${item.label.toLowerCase()}`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User / sign out */}
        <div className="p-3 border-t shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user?.fullName || "User"}
                className="h-8 w-8 rounded-full bg-muted shrink-0 object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                {user?.fullName?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground text-sm h-9"
            onClick={handleSignOut}
            data-testid="button-signout"
          >
            <LogOut className="h-4 w-4 mr-2 shrink-0" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header (mobile only hamburger + desktop spacer) */}
        <header className="h-14 md:h-16 flex items-center px-4 md:px-6 border-b bg-background sticky top-0 z-30 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2 h-9 w-9"
            onClick={() => setSidebarOpen(true)}
            data-testid="button-open-sidebar"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>

          {/* Mobile logo (shown in header when sidebar is closed) */}
          <div className="md:hidden flex items-center gap-2">
            <div className="h-7 w-7 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-xs">
              RF
            </div>
            <span className="font-bold text-base tracking-tight">ReportFlow</span>
          </div>

          <div className="flex-1" />
        </header>

        {/* Page content — scrollable, with bottom padding on mobile for tab bar */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-6">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom tab bar — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background border-t flex items-stretch">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors min-h-[56px]",
                active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              data-testid={`bottom-nav-${item.label.toLowerCase()}`}
            >
              <item.icon
                className={cn("h-5 w-5 transition-colors", active ? "text-primary" : "text-muted-foreground")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
