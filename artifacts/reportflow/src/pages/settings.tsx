import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/react";

export default function Settings() {
  const { user } = useUser();

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
              <img 
                src={user?.imageUrl} 
                alt={user?.fullName || "User"} 
                className="h-16 w-16 rounded-full bg-muted"
              />
              <div>
                <p className="font-medium text-lg">{user?.fullName}</p>
                <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              Account details are managed through Clerk authentication. 
              Click below to manage your profile, security, and connected accounts.
            </p>
            
            {/* We just provide a placeholder since Clerk's UserProfile is complex to style 
                and they usually manage this via their own hosted pages or the UserButton */}
            <Button variant="outline" className="w-full" disabled>
              Manage Account (External)
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
              <Input id="agencyName" defaultValue={user?.fullName ? `${user.fullName}'s Agency` : "My Agency"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://..." />
            </div>
            <Button className="w-full">Save Agency Profile</Button>
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
                    <Input type="color" defaultValue="#2563eb" className="w-12 h-10 p-1 cursor-pointer" />
                    <Input type="text" defaultValue="#2563eb" className="flex-1 font-mono uppercase" />
                  </div>
                  <p className="text-xs text-muted-foreground">This color will be used for reports if a client doesn't have a specific brand color set.</p>
                </div>
                
                <Button>Save Preferences</Button>
              </div>

              <div className="bg-muted/30 rounded-xl p-6 border flex flex-col items-center justify-center text-center">
                <div className="h-48 w-full bg-card rounded-lg border shadow-sm flex flex-col overflow-hidden">
                  <div className="h-2 w-full bg-blue-600"></div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <div className="h-3 w-16 bg-muted rounded"></div>
                        <div className="h-4 w-32 bg-muted rounded"></div>
                      </div>
                      <div className="h-8 w-8 bg-blue-600 rounded-full text-white flex items-center justify-center text-xs font-bold">L</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <div className="h-12 bg-muted/50 rounded"></div>
                      <div className="h-12 bg-muted/50 rounded"></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium mt-4">Preview of shared report</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}