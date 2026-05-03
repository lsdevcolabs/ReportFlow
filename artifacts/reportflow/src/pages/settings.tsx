import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const { user } = useUser();
  const { toast } = useToast();

  const [agencyName, setAgencyName] = useState(
    user?.fullName ? `${user.fullName}'s Agency` : "My Agency",
  );
  const [website, setWebsite] = useState("");
  const [brandColor, setBrandColor] = useState("#2563eb");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSavingProfile(false);
    toast({ title: "Agency profile saved", description: "Your details have been updated." });
  };

  const handleSavePrefs = async () => {
    setIsSavingPrefs(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSavingPrefs(false);
    toast({ title: "Preferences saved", description: "Your white-label settings have been updated." });
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and white-label preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Profile</CardTitle>
            <CardDescription>Your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user?.fullName || "User"}
                  className="h-16 w-16 rounded-full bg-muted object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                  {user?.fullName?.charAt(0).toUpperCase() ?? "U"}
                </div>
              )}
              <div>
                <p className="font-medium text-lg">{user?.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              Account details are managed through your authentication provider.
              You can update your name, email, and password there.
            </p>

            <Button variant="outline" className="w-full" disabled>
              Manage Account (coming soon)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agency Profile</CardTitle>
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
            <Button className="w-full" onClick={handleSaveProfile} disabled={isSavingProfile}>
              {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Agency Profile
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>White-Labeling</CardTitle>
            <CardDescription>Customize the look and feel of your shared reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Agency Logo</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
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

                <Button onClick={handleSavePrefs} disabled={isSavingPrefs}>
                  {isSavingPrefs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Preferences
                </Button>
              </div>

              <div className="bg-muted/30 rounded-xl p-6 border flex flex-col items-center justify-center text-center">
                <div className="h-48 w-full bg-card rounded-lg border shadow-sm flex flex-col overflow-hidden">
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
