import { useState } from "react";
import { useLocation } from "wouter";
import {
  useSaveUserProfile,
  useCreateBillingCheckout,
  getGetUserProfileQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Check, Zap, Loader2, ArrowRight } from "lucide-react";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try it out with one client",
    features: [
      "1 client",
      "5 reports per month",
      "Shareable public links",
      "CSV import",
    ],
    highlight: false,
    badge: null,
  },
  {
    id: "starter" as const,
    name: "Starter",
    price: "$9",
    period: "per month",
    description: "For growing freelancers",
    features: [
      "5 clients",
      "Unlimited reports",
      "White-label branding",
      "CSV import",
      "Priority support",
    ],
    highlight: true,
    badge: "Most popular",
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For agencies at scale",
    features: [
      "Unlimited clients",
      "Unlimited reports",
      "White-label branding",
      "Custom domain",
      "API access",
      "Priority support",
    ],
    highlight: false,
    badge: null,
  },
];

export default function Onboarding() {
  const [selected, setSelected] = useState<"free" | "starter" | "pro" | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const saveProfile = useSaveUserProfile();
  const createCheckout = useCreateBillingCheckout();

  const isPending = saveProfile.isPending || createCheckout.isPending;

  const handleContinue = () => {
    if (!selected) {
      toast({ title: "Please choose a plan to continue.", variant: "destructive" });
      return;
    }

    if (selected === "free") {
      // Free plan: save profile immediately and go to dashboard
      saveProfile.mutate(
        { data: { plan: "free" } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
            setLocation("/dashboard");
          },
          onError: () => {
            toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
          },
        },
      );
    } else {
      // Paid plan: create Lemon Squeezy checkout and redirect
      createCheckout.mutate(
        { data: { plan: selected } },
        {
          onSuccess: ({ checkoutUrl }) => {
            window.location.href = checkoutUrl;
          },
          onError: () => {
            toast({
              title: "Could not start checkout. Please try again.",
              variant: "destructive",
            });
          },
        },
      );
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10 max-w-2xl">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
            RF
          </div>
          <span className="font-bold text-xl tracking-tight">ReportFlow</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20 mb-4">
          <Zap className="h-3.5 w-3.5" />
          Welcome! One last step
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Choose your plan
        </h1>
        <p className="text-muted-foreground text-lg">
          You can upgrade or downgrade at any time. Start free, no credit card required.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 w-full max-w-4xl">
        {plans.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan.id)}
              className={`relative text-left bg-card border rounded-2xl p-6 flex flex-col gap-5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isSelected
                  ? "border-primary ring-2 ring-primary shadow-lg scale-[1.02]"
                  : plan.highlight
                  ? "border-primary/40 shadow-md"
                  : "border-border hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div
                className={`absolute top-4 right-4 h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground scale-100"
                    : "bg-muted border scale-75 opacity-0"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </div>

              <div>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{plan.description}</p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.id !== "free" && (
                <p className="text-xs text-muted-foreground">
                  You'll be taken to a secure checkout
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <Button
          size="lg"
          className="px-10 text-base gap-2"
          onClick={handleContinue}
          disabled={!selected || isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {selected === "free" ? "Start for free" : selected ? `Subscribe to ${plans.find((p) => p.id === selected)?.name}` : "Select a plan"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        {!selected && (
          <p className="text-sm text-muted-foreground">Select a plan above to continue</p>
        )}
        {selected !== "free" && selected && (
          <p className="text-xs text-muted-foreground">
            Secure payment via Lemon Squeezy · Cancel anytime
          </p>
        )}
      </div>
    </div>
  );
}
