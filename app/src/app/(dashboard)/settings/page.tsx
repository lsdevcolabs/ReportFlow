"use client";

import { useState } from "react";
import { CreditCard, Building2, User, Palette, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

export default function SettingsPage() {
  const [agencyName, setAgencyName] = useState("My Agency");
  const [website, setWebsite] = useState("");
  const [brandColor, setBrandColor] = useState("#2563EB");
  const [isSaving, setIsSaving] = useState(false);
  
  const currentPlan = "free"; // This would come from user context

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000)); // Simulate API call
    setIsSaving(false);
  };

  const handleUpgrade = (plan: "starter" | "pro") => {
    // This would redirect to Lemon Squeezy checkout
    console.log(`Upgrading to ${plan}`);
  };

  return (
    <div className="p-8 max-w-4xl space-y-8">
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
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                U
              </div>
              <div>
                <p className="font-medium">User Account</p>
                <p className="text-sm text-muted-foreground">user@example.com</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Account details are managed through your authentication provider.
              You can update your name, email, and password there.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Manage Account (coming soon)
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
                <span className="font-semibold">{PLAN_LABELS[currentPlan]} Plan</span>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            {currentPlan === "free" ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Upgrade to unlock more clients and features.</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleUpgrade("starter")}>
                    Starter · $9/mo
                  </Button>
                  <Button size="sm" onClick={() => handleUpgrade("pro")}>
                    Pro · $29/mo
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full">
                Manage Subscription
              </Button>
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
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Agency Logo</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <p className="font-medium">Click to upload logo</p>
                    <p className="text-xs text-muted-foreground mt-1">SVG, PNG, or JPG (max 2MB)</p>
                  </div>
                </div>

                <div className="space-y-2">
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
                  <p className="text-xs text-muted-foreground">
                    Used on reports where a client has no specific brand color set.
                  </p>
                </div>

                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Preferences
                </Button>
              </div>

              <div className="bg-muted/30 rounded-xl p-6 border flex flex-col items-center justify-center text-center">
                <div className="bg-card rounded-lg border shadow-sm flex flex-col overflow-hidden w-full">
                  <div className="h-2 w-full" style={{ backgroundColor: brandColor }} />
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <div className="h-3 w-16 bg-muted rounded" />
                        <div className="h-4 w-32 bg-muted rounded" />
                      </div>
                      <div
                        className="h-8 w-8 rounded-full text-white flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: brandColor }}
                      >
                        {agencyName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <div className="h-12 bg-muted/50 rounded" />
                      <div className="h-12 bg-muted/50 rounded" />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium mt-4">Live preview of shared report</p>
                <p className="text-xs text-muted-foreground mt-1">Updates as you change the color above</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}