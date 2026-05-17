"use client";

import { useState, useEffect } from "react";
import { CreditCard, Building2, User, Palette, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUser, useClerk } from "@clerk/nextjs";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();

  const [agencyName, setAgencyName] = useState("My Agency");
  const [website, setWebsite] = useState("");
  const [brandColor, setBrandColor] = useState("#2563EB");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setAgencyName(data.user.agencyName || "My Agency");
            setWebsite(data.user.agencyWebsite || "");
            setBrandColor(data.user.agencyBrandColor || "#2563EB");
            setLogoUrl(data.user.agencyLogoUrl || null);
            setCurrentPlan(data.user.plan || "free");
            setSubscriptionStatus(data.user.subscriptionStatus || "inactive");
          }
        }
      } catch (error) {
        console.error("Failed to load user settings", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName,
          agencyWebsite: website,
          agencyBrandColor: brandColor,
          agencyLogoUrl: logoUrl,
        }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
    } catch (error) {
      console.error("Error saving settings", error);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgrade = (plan: "starter" | "pro") => {
    // This would redirect to Lemon Squeezy checkout
    console.log(`Upgrading to ${plan}`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Maximum size is 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const userName = user?.fullName || user?.firstName || "User Account";
  const userInitial = userName.charAt(0).toUpperCase();
  const userEmail = user?.primaryEmailAddress?.emailAddress || "No email";

  return (
    <div className="p-4 md:p-8 max-w-4xl space-y-8 mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              Account Profile
            </CardTitle>
            <CardDescription>Your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              {isLoaded && user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={userName} 
                  className="h-12 w-12 rounded-full object-cover border" 
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                  {isLoaded ? userInitial : <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{isLoaded ? userName : "Loading..."}</p>
                <p className="text-sm text-muted-foreground truncate">{isLoaded ? userEmail : ""}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Account details are managed through your authentication provider.
              You can update your name, email, and password there.
            </p>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => clerk.openUserProfile()}
              disabled={!isLoaded}
            >
              Manage Account
            </Button>
          </CardContent>
        </Card>

        {/* Billing & Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Plan & Billing
            </CardTitle>
            <CardDescription>Your current subscription.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between bg-muted/40 rounded-lg px-4 py-3 border">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{PLAN_LABELS[currentPlan] || "Free"} Plan</span>
              </div>
              <Badge variant={currentPlan !== "free" ? "default" : "secondary"}>
                {currentPlan !== "free" ? "Active" : "Free Tier"}
              </Badge>
            </div>

            {currentPlan === "free" ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Upgrade to unlock more clients and features.</p>
                <a href="/upgrade">
                  <Button size="sm" className="w-full">
                    <ExternalLink className="mr-2 h-3 w-3" />
                    View Upgrade Options
                  </Button>
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  You are on the <strong>{PLAN_LABELS[currentPlan]}</strong> plan. Enjoy all your premium features!
                </p>
                <a href="/upgrade">
                  <Button variant="outline" className="w-full">
                    Manage Plan
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agency Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Agency Profile
            </CardTitle>
            <CardDescription>Details that appear on your generated reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agencyName">Agency Name</Label>
              <Input
                id="agencyName"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="My Agency"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://youragency.com"
              />
            </div>
            <Button className="w-full" onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Agency Profile
            </Button>
          </CardContent>
        </Card>

        {/* White-Labeling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              White-Labeling
            </CardTitle>
            <CardDescription>Customize the look and feel of your shared reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Controls Row */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Left Column: Logo */}
              <div className="space-y-2 flex flex-col">
                <Label>Agency Logo</Label>
                <Label htmlFor="logo-upload" className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer flex-1">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Agency Logo" className="h-16 object-contain mb-2" />
                  ) : (
                    <>
                      <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <p className="font-medium">Click to upload logo</p>
                      <p className="text-xs text-muted-foreground mt-1">SVG, PNG, or JPG (max 2MB)</p>
                    </>
                  )}
                  <Input 
                    id="logo-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleLogoUpload}
                  />
                </Label>
              </div>

              {/* Right Column: Brand Color & Save */}
              <div className="space-y-6 flex flex-col">
                <div className="space-y-2 flex-1">
                  <Label>Default Brand Color</Label>
                  <div className="flex gap-3">
                    <Input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="flex-1 font-mono uppercase"
                      placeholder="#2563eb"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Used on reports where a client has no specific brand color set.
                  </p>
                </div>
                
                <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Preferences
                </Button>
              </div>
            </div>

            <Separator />

            {/* Preview Row (Full Width Below) */}
            <div>
              <Label className="mb-4 block">Report Preview</Label>
              <div className="bg-muted/30 rounded-xl p-6 border flex flex-col items-center justify-center text-center w-full">
                <div className="bg-card rounded-lg border shadow-sm flex flex-col overflow-hidden w-full max-w-md mx-auto">
                  <div className="h-2 w-full" style={{ backgroundColor: brandColor }} />
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <div className="h-3 w-16 bg-muted rounded" />
                        <div className="h-4 w-32 bg-muted rounded" />
                      </div>
                      <div
                        className="h-8 w-auto min-w-[2rem] rounded text-white flex items-center justify-center text-xs font-bold overflow-hidden"
                      >
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="h-8 object-contain" />
                        ) : (
                          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary" style={{ backgroundColor: brandColor }}>
                            {agencyName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <div className="h-12 bg-muted/50 rounded" />
                      <div className="h-12 bg-muted/50 rounded" />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium mt-4">Live preview of shared report header</p>
                <p className="text-xs text-muted-foreground mt-1">Updates as you change settings above</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}