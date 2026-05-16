"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PRICING = {
  monthly: { starter: 9, pro: 29 },
  annual: { starter: 7, pro: 24 }, // monthly equivalent when billed annually
};

const plans = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "For freelancers just getting started",
    features: [
      "1 client",
      "3 reports total",
      "Shareable links",
    ],
  },
  {
    name: "Starter",
    price: { monthly: PRICING.monthly.starter, annual: PRICING.annual.starter },
    description: "For growing agencies",
    features: [
      "5 clients",
      "Unlimited reports",
      "PDF export",
      "Custom notes",
    ],
    popular: true,
  },
  {
    name: "Pro",
    price: { monthly: PRICING.monthly.pro, annual: PRICING.annual.pro },
    description: "For established agencies",
    features: [
      "Unlimited clients",
      "Unlimited reports",
      "PDF export",
      "Custom notes",
      "White-label",
    ],
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-20" id="pricing">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
        <p className="text-muted-foreground text-center mb-8">Start free, upgrade when you need more.</p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isAnnual}
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAnnual ? "bg-primary" : "bg-input"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual
            <span className="ml-1 text-xs text-primary font-semibold">Save 20%</span>
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const price = isAnnual ? plan.price.annual : plan.price.monthly;
            return (
              <Card key={plan.name} className={plan.popular ? "border-primary shadow-lg" : ""}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {isAnnual && price > 0 && (
                    <p className="text-xs text-muted-foreground">Billed annually (${price * 12}/year)</p>
                  )}
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.name === "Free" ? "/sign-up" : "/sign-up?plan=" + plan.name.toLowerCase()}>
                    <Button className="w-full mt-6" variant={plan.popular ? "default" : "outline"}>
                      {plan.name === "Free" ? "Get Started" : "Start Free Trial"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
