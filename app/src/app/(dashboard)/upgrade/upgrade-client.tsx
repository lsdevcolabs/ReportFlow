"use client";

import { useState } from "react";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
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
    price: "$9",
    period: "/month",
    annualPrice: "$79/year",
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
    price: "$29",
    period: "/month",
    annualPrice: "$249/year",
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

interface UpgradeClientProps {
  currentPlan: string;
}

export default function UpgradeClient({ currentPlan }: UpgradeClientProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: string) => {
    setLoading(plan);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Failed to create checkout. Please try again.");
      }
    } catch {
      alert("Failed to create checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight">Upgrade Your Plan</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Choose the plan that fits your needs. Start free and upgrade as you grow.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrentPlan = plan.name.toLowerCase() === currentPlan.toLowerCase();

          return (
            <Card key={plan.name} className={plan.popular ? "border-primary shadow-lg relative" : ""}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                  {plan.annualPrice && (
                    <p className="text-sm text-primary mt-1">{plan.annualPrice}</p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
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
                {plan.plan ? (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleCheckout(plan.plan)}
                    disabled={isCurrentPlan || loading !== null}
                  >
                    {loading === plan.plan ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isCurrentPlan ? "Current Plan" : plan.cta}
                  </Button>
                ) : (
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                    <a href={plan.href}>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
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
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
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