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
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleSignOut = () => {
    signOut().then(() => { window.location.href = "/"; });
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map((item) => {
        const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            data-testid={`nav-link-${item.label.toLowerCase()}`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:flex",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
              R
            </div>
            <span className="font-bold text-xl tracking-tight">ReportFlow</span>
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto md:hidden" onClick={closeMobileMenu}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <NavLinks onClick={closeMobileMenu} />
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <img 
              src={user?.imageUrl} 
              alt={user?.fullName || "User"} 
              className="h-8 w-8 rounded-full bg-muted"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
            data-testid="button-signout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center px-4 md:px-8 border-b bg-background sticky top-0 z-30 shrink-0">
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={toggleMobileMenu}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          {/* Header actions can go here */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
