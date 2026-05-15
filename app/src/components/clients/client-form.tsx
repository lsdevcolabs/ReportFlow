"use client";

import { useState, useEffect, useRef } from "react";
import { Building2, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ClientFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: ClientFormData) => Promise<void>;
  initialData?: Partial<ClientFormData>;
  mode?: "create" | "edit";
}

export interface ClientFormData {
  name: string;
  email: string;
  website: string;
  industry: string;
  brandColor: string;
  logoFile?: File;
  logoUrl?: string;
}

export function ClientForm({ 
  open = false, 
  onOpenChange, 
  onSubmit,
  initialData,
  mode = "create" 
}: ClientFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [industry, setIndustry] = useState(initialData?.industry || "");
  const [brandColor, setBrandColor] = useState(initialData?.brandColor || "#2563EB");
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && mode === "create") {
      setName("");
      setEmail("");
      setWebsite("");
      setIndustry("");
      setBrandColor("#2563EB");
      setLogoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open, mode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File too large. Maximum size is 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const file = fileInputRef.current?.files?.[0];
      await onSubmit?.({ name, email, website, industry, brandColor, logoFile: file });
      if (mode === "create") {
        setName("");
        setEmail("");
        setWebsite("");
        setIndustry("");
        setBrandColor("#2563EB");
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add New Client" : "Edit Client"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" 
                ? "Create a new client profile to start generating reports."
                : "Update the client's information."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corporation"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Digital Marketing, E-commerce, SaaS..."
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="brandColor">Brand Color</Label>
              <div className="flex gap-3">
                <Input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="flex-1 font-mono uppercase"
                  placeholder="#2563EB"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This color will be used in reports for this client.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label>Client Logo</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {logoPreview ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to upload logo</p>
                  <p className="text-xs text-muted-foreground mt-1">SVG, PNG, or JPG (max 2MB)</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Add Client" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}