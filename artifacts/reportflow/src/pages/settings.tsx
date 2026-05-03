import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/react";
import { useToast } from "@/hooks/use-toast";
import {
  useGetBillingSubscription,
  useGetBillingPortal,
  useGetUserProfile,
  getGetUserProfileQueryKey,
  useCreateBillingCheckout,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, CreditCard, Zap, Building2, ExternalLink } from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  on_trial: { label: "Trial", variant: "secondary" },
  paused: { label: "Paused", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  expired: { label: "Expired", variant: "destructive" },
  past_due: { label: "Past due", variant: "destructive" },
  unpaid: { label: "Unpaid", variant: "destructive" },
};

export default function Settings() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [agencyName, setAgencyName] = useState(
    user?.fullName ? `${user.fullName}'s Agency` : "My Agency",
  );
  const [website, setWebsite] = useState("");
  const [brandColor, setBrandColor] = useState("#2563eb");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isRedirectingPortal, setIsRedirectingPortal] = useState(false);

  const { data: userProfile } = useGetUserProfile({
    query: { queryKey: getGetUserProfileQueryKey() },
  });
  const { data: subscription } = useGetBillingSubscription();
  const createCheckout = useCreateBillingCheckout();

  const currentPlan = userProfile?.plan ?? "free";
  const hasPaidPlan = currentPlan === "starter" || currentPlan === "pro";

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

  const handleManageSubscription = async () => {
    setIsRedirectingPortal(true);
    try {
      const res = await fetch("/api/billing/portal");
      if (!res.ok) throw new Error("Failed");
      const { portalUrl } = await res.json();
      window.open(portalUrl, "_blank", "noopener");
    } catch {
      toast({ title: "Could not open billing portal. Please try again.", variant: "destructive" });
    } finally {
      setIsRedirectingPortal(false);
    }
  };

  const handleUpgrade = (plan: "starter" | "pro") => {
    createCheckout.mutate(
      { data: { plan } },
      {
        onSuccess: ({ checkoutUrl }) => {
          window.location.href = checkoutUrl;
        },
        onError: () => {
          toast({ title: "Could not start checkout. Please try again.", variant: "destructive" });
        },
      },
    );
  };

  const statusInfo = subscription ? STATUS_BADGE[subscription.status] : null;
  const renewDate = subscription?.renewsAt
    ? new Date(subscription.renewsAt).toLocaleDateString(undefined, { dateStyle: "medium" })
    : null;
  const endsDate = subscription?.endsAt
    ? new Date(subscription.endsAt).toLocaleDateString(undefined, { dateStyle: "medium" })
    : null;

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and white-label preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Profile */}
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
            {/* Current plan badge */}
            <div className="flex items-center justify-between bg-muted/40 rounded-lg px-4 py-3 border">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-semibold">{PLAN_LABELS[currentPlan] ?? currentPlan} Plan</span>
              </div>
              {statusInfo && (
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              )}
              {!hasPaidPlan && (
                <Badge variant="secondary">Active</Badge>
              )}
            </div>

            {/* Subscription details */}
            {subscription && (
              <div className="text-sm text-muted-foreground space-y-1">
                {renewDate && !subscription.endsAt && (
                  <p>Renews on <span className="text-foreground font-medium">{renewDate}</span></p>
                )}
                {endsDate && (
                  <p>Access ends on <span className="text-foreground font-medium">{endsDate}</span></p>
                )}
                {subscription.trialEndsAt && (
                  <p>Trial ends on{" "}
                    <span className="text-foreground font-medium">
                      {new Date(subscription.trialEndsAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            {hasPaidPlan ? (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleManageSubscription}
                disabled={isRedirectingPortal}
              >
                {isRedirectingPortal
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <ExternalLink className="h-4 w-4" />}
                Manage Subscription
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Upgrade to unlock more clients and features.</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpgrade("starter")}
                    disabled={createCheckout.isPending}
                    className="gap-1"
                  >
                    {createCheckout.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Starter · $9/mo
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUpgrade("pro")}
                    disabled={createCheckout.isPending}
                    className="gap-1"
                  >
                    {createCheckout.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Pro · $29/mo
                  </Button>
                </div>
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
            <Button className="w-full" onClick={handleSaveProfile} disabled={isSavingProfile}>
              {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Agency Profile
            </Button>
          </CardContent>
        </Card>

        {/* White-labeling */}
        <Card>
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
