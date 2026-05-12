"use client";

import { useState } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  feature?: string;
}

export function UpgradePrompt({ open, onOpenChange, message, feature }: UpgradePromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            {feature ? `${feature} requires an upgrade` : "Upgrade Required"}
          </DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Not Now
          </Button>
          <Button asChild>
            <Link href="/upgrade">
              Upgrade Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PlanLimitBadgeProps {
  limit: number;
  current: number;
  type: "clients" | "reports";
}

export function PlanLimitBadge({ limit, current, type }: PlanLimitBadgeProps) {
  const percentage = limit === Infinity ? 0 : (current / limit) * 100;
  const isNearLimit = percentage >= 80;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">
        {current}/{limit === Infinity ? "∞" : limit} {type}
      </span>
      {isNearLimit && limit !== Infinity && (
        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
          Near limit
        </span>
      )}
    </div>
  );
}

interface FeatureGateProps {
  children: React.ReactNode;
  featureAllowed: boolean;
  featureName: string;
  upgradeMessage: string;
}

export function FeatureGate({ children, featureAllowed, featureName, upgradeMessage }: FeatureGateProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (!featureAllowed) {
    return (
      <>
        <div
          className="opacity-50 pointer-events-none relative"
          onClick={() => setShowUpgrade(true)}
        >
          {children}
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{featureName} requires upgrade</span>
            </div>
          </div>
        </div>
        <UpgradePrompt
          open={showUpgrade}
          onOpenChange={setShowUpgrade}
          message={upgradeMessage}
          feature={featureName}
        />
      </>
    );
  }

  return <>{children}</>;
}