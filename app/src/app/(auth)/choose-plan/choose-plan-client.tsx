"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
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
    cta: "Continue Free",
    plan: "free",
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
    cta: "Get Starter",
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
    cta: "Get Pro",
    plan: "pro",
    popular: false,
  },
];

export default function ChoosePlanClient() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleContinueFree = () => {
    router.push("/dashboard");
  };

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
        window.location.assign(data.checkoutUrl);
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
    <div className="max-w-6xl mx-auto w-full">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          Welcome! Choose your plan
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Start free and upgrade as you grow. You can always change your plan later.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
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
              {plan.plan === "free" ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleContinueFree}
                  disabled={loading !== null}
                >
                  {plan.cta}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleCheckout(plan.plan)}
                  disabled={loading !== null}
                >
                  {loading === plan.plan ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {plan.cta}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        By choosing a plan, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}