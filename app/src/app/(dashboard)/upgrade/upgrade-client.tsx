"use client";

import { useState } from "react";
import { CheckCircle, ArrowRight, Loader2, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

const PRICING = {
  starter: { monthly: 9, annual: 79, monthlyFromAnnual: 6.58 },
  pro: { monthly: 29, annual: 249, monthlyFromAnnual: 20.75 },
} as const;

const SAVINGS_PERCENTAGE = 30;

function getPricing(plan: string, isAnnual: boolean) {
  const p = PRICING[plan as keyof typeof PRICING];
  if (!p) return { price: "$0", period: "forever", annualLabel: null };
  if (isAnnual) {
    return {
      price: `$${p.monthlyFromAnnual.toFixed(2)}`,
      period: "/mo",
      annualLabel: `billed $${p.annual}/yr (Save ${SAVINGS_PERCENTAGE}%)`,
      originalPrice: `$${p.monthly}/mo`,
    };
  }
  return { price: `$${p.monthly}`, period: "/mo", annualLabel: null };
}

function getPlans(isAnnual: boolean) {
  const starterPricing = getPricing("starter", isAnnual);
  const proPricing = getPricing("pro", isAnnual);

  return [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "For freelancers just getting started",
      features: [
        "1 client",
        "3 reports total",
        "Shareable links",
      ],
      notIncluded: [
        "PDF export",
        "Custom notes",
        "White-label branding",
      ],
      cta: "Get Started",
      href: "/sign-up",
      popular: false,
    },
    {
      name: "Starter",
      price: starterPricing.price,
      period: starterPricing.period,
      annualLabel: starterPricing.annualLabel,
      originalPrice: starterPricing.originalPrice,
      description: "For growing agencies",
      features: [
        "5 clients",
        "Unlimited reports",
        "PDF export",
        "Custom notes",
        "Priority support",
      ],
      notIncluded: [
        "White-label branding",
      ],
      cta: "Start Starter",
      plan: "starter",
      popular: true,
    },
    {
      name: "Pro",
      price: proPricing.price,
      period: proPricing.period,
      annualLabel: proPricing.annualLabel,
      originalPrice: proPricing.originalPrice,
      description: "For established agencies",
      features: [
        "Unlimited clients",
        "Unlimited reports",
        "PDF export",
        "Custom notes",
        "White-label branding",
        "Priority support",
      ],
      notIncluded: [],
      cta: "Start Pro",
      plan: "pro",
      popular: false,
    },
  ];
}

interface UpgradeClientProps {
  currentPlan: string;
}

export default function UpgradeClient({ currentPlan: initialPlan }: UpgradeClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [checkoutOpened, setCheckoutOpened] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(initialPlan);
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = getPlans(isAnnual);

  const handleCheckout = async (plan: string) => {
    setLoading(plan);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing: isAnnual ? "annual" : "monthly" }),
      });

      const data = await res.json();

      if (data.checkoutUrl) {
        // Open checkout in a new tab so user stays in the app
        window.open(data.checkoutUrl, "_blank");
        setCheckoutOpened(true);
      } else {
        alert("Failed to create checkout. Please try again.");
      }
    } catch {
      alert("Failed to create checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleVerifyPayment = async () => {
    setVerifying(true);
    try {
      const res = await fetch("/api/verify-payment", { method: "POST" });
      const data = await res.json();

      if (data.updated && data.plan !== "free") {
        setCurrentPlan(data.plan);
        setCheckoutOpened(false);
      } else if (data.plan === "free") {
        alert("No active subscription found yet. If you just completed payment, please wait a moment and try again.");
      } else {
        alert(data.message || "Could not verify payment. Please try again in a moment.");
      }
    } catch {
      alert("Failed to verify payment. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const isPaidPlan = currentPlan !== "free";

  return (
    <div className="max-w-6xl mx-auto">
      {/* Success banner when already on a paid plan */}
      {isPaidPlan && (
        <div className="mb-8 rounded-lg border border-green-500/30 bg-green-500/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-700">You&apos;re on the {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan!</p>
              <p className="text-sm text-muted-foreground">You have access to all {currentPlan === "pro" ? "premium" : "starter"} features.</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button size="sm" variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      )}

      {/* Checkout opened banner */}
      {checkoutOpened && !isPaidPlan && (
        <div className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium">Payment page opened in a new tab</p>
              <p className="text-sm text-muted-foreground">Complete your payment, then click &quot;Verify Payment&quot; to activate your plan.</p>
            </div>
          </div>
          <Button size="sm" onClick={handleVerifyPayment} disabled={verifying}>
            {verifying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {verifying ? "Checking..." : "Verify Payment"}
          </Button>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight">
          {isPaidPlan ? "Your Plan" : "Upgrade Your Plan"}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          {isPaidPlan
            ? "You're currently on a paid plan. Here's what you have access to."
            : "Choose the plan that fits your needs. Start free and upgrade as you grow."
          }
        </p>
      </div>

      {!isPaidPlan && (
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-3 bg-muted rounded-full p-1">
            <span className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${!isAnnual ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              aria-label="Toggle annual billing"
            />
            <span className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${isAnnual ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
              Annual
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full ml-1">
              <Sparkles className="h-3 w-3" />
              Save {SAVINGS_PERCENTAGE}%
            </span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrentPlan = plan.name.toLowerCase() === currentPlan.toLowerCase();
          const isDowngrade = isPaidPlan && !isCurrentPlan && (
            (currentPlan === "pro" && plan.plan === "starter") ||
            (currentPlan !== "free" && !plan.plan)
          );

          return (
            <Card key={plan.name} className={`${plan.popular && !isPaidPlan ? "border-primary shadow-lg relative" : ""} ${isCurrentPlan ? "border-green-500 shadow-lg relative ring-2 ring-green-500/20" : ""}`}>
              {plan.popular && !isPaidPlan && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Your Current Plan
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  {plan.originalPrice && isAnnual && (
                    <span className="text-lg text-muted-foreground line-through mr-2">{plan.originalPrice}</span>
                  )}
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                  {plan.annualLabel && (
                    <p className="text-xs text-muted-foreground mt-1">{plan.annualLabel}</p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 shrink-0 ${isCurrentPlan ? "text-green-600" : "text-primary"}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.notIncluded.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Not included:</p>
                    <ul className="space-y-1">
                      {plan.notIncluded.map((feature) => (
                        <li key={feature} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {isCurrentPlan ? (
                  <div className="w-full py-2 px-4 rounded-md bg-green-50 border border-green-200 text-center text-sm font-medium text-green-700">
                    ✓ Active Plan
                  </div>
                ) : plan.plan ? (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleCheckout(plan.plan!)}
                    disabled={loading !== null || isDowngrade}
                  >
                    {loading === plan.plan ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isDowngrade ? "Current or Lower Tier" : plan.cta}
                  </Button>
                ) : (
                  isPaidPlan ? (
                    <Button className="w-full" variant="outline" disabled>
                      Included in Your Plan
                    </Button>
                  ) : (
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                      <a href={plan.href}>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Can I change my plan later?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What payment methods do you accept?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards through our secure payment processor.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What is white-labeling?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                White-label allows you to remove ReportFlow branding from shared reports, making them look like they came directly from your agency.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}