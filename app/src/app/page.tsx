import Link from "next/link";
import { ArrowRight, CheckCircle, BarChart3, Link as LinkIcon, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "White-Label Reports",
    description: "Brand reports with your agency colors and logo for a professional look.",
    icon: FileText,
  },
  {
    title: "Shareable Links",
    description: "Share reports with clients via a simple link. No login required.",
    icon: LinkIcon,
  },
  {
    title: "Auto-Generated Charts",
    description: "Beautiful visualizations of traffic, conversions, and performance.",
    icon: BarChart3,
  },
  {
    title: "CSV Import",
    description: "Import data from Google Analytics, Meta Ads, and more in seconds.",
    icon: ArrowRight,
  },
];

const steps = [
  {
    number: "1",
    title: "Connect Your Data",
    description: "Enter metrics manually or import from CSV. No complex integrations needed.",
  },
  {
    number: "2",
    title: "Generate Report",
    description: "Our builder creates professional reports with charts and insights.",
  },
  {
    number: "3",
    title: "Share with Client",
    description: "Send a link or export as PDF. Client sees a branded report instantly.",
  },
];

const testimonials = [
  {
    quote: "I used to spend 4 hours every week on client reports. Now it takes 15 minutes.",
    author: "Sarah Chen",
    role: "SEO Consultant",
  },
  {
    quote: "My clients love receiving these reports. They feel professional and data-driven.",
    author: "Marcus Johnson",
    role: "PPC Manager",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For freelancers just getting started",
    features: [
      "1 client",
      "3 reports total",
      "Shareable links",
    ],
  },
  {
    name: "Starter",
    price: "$9",
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
    price: "$29",
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ReportFlow</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started Free</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Stop Wasting Hours on<br />Client Reports
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            ReportFlow automatically generates beautiful, branded reports your clients will love — in minutes, not hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free — No Credit Card
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Agitation */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Does this sound familiar?</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <span>Copying screenshots from Google Analytics every week</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <span>Formatting numbers in Google Sheets for hours</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <span>Creating PDFs that look unprofessional</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <span>Spending 2-5 hours per client per week on admin work</span>
              </li>
            </ul>
            <p className="mt-8 text-lg font-medium">
              For an agency with 10 clients, that's a full working day lost every single week.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20" id="pricing">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground text-center mb-12">Start free, upgrade when you need more.</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.popular ? "border-primary shadow-lg" : ""}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
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
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Users Say</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author}>
                <CardContent className="pt-6">
                  <p className="text-lg mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to save hours every week?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of marketers who create professional reports in minutes.</p>
          <Link href="/sign-up">
            <Button size="lg">
              Start Free Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">ReportFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 ReportFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}