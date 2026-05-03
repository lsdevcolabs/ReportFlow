import {
  BarChart3,
  FileBarChart,
  Link as LinkIcon,
  Users,
  Zap,
  Check,
  Clock,
  Globe,
  Shield,
  TrendingUp,
  Upload,
  Palette,
  Star,
  ArrowRight,
  ChevronRight,
  Mail,
  Download,
  BarChart2,
} from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const features = [
  {
    icon: Zap,
    title: "Generate reports in seconds",
    desc: "Stop spending hours formatting spreadsheets. Input your metrics, click generate, and your branded report is ready instantly.",
  },
  {
    icon: LinkIcon,
    title: "Shareable public links",
    desc: "Send clients a clean, professional URL. No logins, no downloads, no confusion — just a polished report they'll love.",
  },
  {
    icon: Upload,
    title: "CSV import",
    desc: "Already have data in a spreadsheet? Upload your CSV and all your metrics populate in one click. No manual re-entry.",
  },
  {
    icon: Palette,
    title: "White-label branding",
    desc: "Each client's report reflects their brand color. Looks like a custom product you built yourself.",
  },
  {
    icon: TrendingUp,
    title: "Visual charts & trends",
    desc: "Traffic, conversions, ad performance, social reach — all visualized with clean charts automatically.",
  },
  {
    icon: Users,
    title: "Multi-client management",
    desc: "Organize all your clients in one place with their contact info, project type, and full report history.",
  },
  {
    icon: Globe,
    title: "Always accessible",
    desc: "Cloud-based and mobile-friendly. Access your reports from any device, anywhere in the world.",
  },
  {
    icon: Shield,
    title: "Secure by default",
    desc: "Reports are private by default. Publish only when you're ready. Revoke access with one click.",
  },
];

const metrics = [
  { value: "5 min", label: "Average report creation time" },
  { value: "10×", label: "Faster than manual reporting" },
  { value: "100%", label: "White-label ready" },
  { value: "0", label: "Technical skills required" },
];

const comparisons = [
  { feature: "No spreadsheet formatting", us: true, others: false },
  { feature: "Instant shareable links", us: true, others: false },
  { feature: "White-label per client", us: true, others: false },
  { feature: "CSV data import", us: true, others: true },
  { feature: "Visual performance charts", us: true, others: true },
  { feature: "Multi-client management", us: true, others: true },
  { feature: "No per-report fee", us: true, others: false },
  { feature: "Set up in under 5 minutes", us: true, others: false },
];

const testimonials = [
  {
    quote: "I used to spend 3 hours every Friday doing client reports. Now it takes me under 10 minutes total. Absolute game changer.",
    name: "Sarah M.",
    title: "Freelance SEO Consultant",
    initials: "SM",
    color: "#6366f1",
  },
  {
    quote: "My clients love the clean shareable links. They actually look forward to their reports now. Huge win for client retention.",
    name: "James T.",
    title: "Digital Marketing Agency Owner",
    initials: "JT",
    color: "#0ea5e9",
  },
  {
    quote: "Finally a tool that gets out of the way. Clean UI, fast, and the white-labeling makes me look incredibly professional.",
    name: "Priya K.",
    title: "PPC Freelancer",
    initials: "PK",
    color: "#10b981",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: ["1 client", "5 reports/month", "Shareable links", "CSV import", "Basic charts"],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Starter",
    price: "$9",
    period: "per month",
    description: "For growing freelancers",
    features: ["5 clients", "Unlimited reports", "White-label branding", "CSV import", "All chart types", "Priority support"],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For agencies at scale",
    features: ["Unlimited clients", "Unlimited reports", "White-label branding", "Custom domain", "API access", "Dedicated support", "Team access"],
    cta: "Start free trial",
    highlight: false,
  },
];

const faqs = [
  {
    q: "Do my clients need an account to view reports?",
    a: "No. Clients receive a simple public link and can view their report instantly in any browser — no account, no app, no friction.",
  },
  {
    q: "Can I brand reports with my agency's colors?",
    a: "Yes. Each client can have their own brand color set, which is reflected throughout their reports. Your logo and agency name appear on every report.",
  },
  {
    q: "How does CSV import work?",
    a: "Export your data from Google Analytics, Google Ads, or any platform as a CSV, upload it in the report builder, and your metrics are automatically populated.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The free plan includes 1 client and up to 5 reports per month — no credit card required.",
  },
  {
    q: "Can I revoke a client's access to a report?",
    a: "Absolutely. Simply unpublish the report with one click and the shared link immediately stops working.",
  },
];

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
      {children}
    </a>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Sticky Nav ─────────────────────────── */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
              RF
            </div>
            <span className="font-bold text-lg tracking-tight">ReportFlow</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How it works</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href={`${basePath}/about`}>About</NavLink>
            <NavLink href={`${basePath}/contact`}>Contact</NavLink>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a href={`${basePath}/sign-in`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
              Sign in
            </a>
            <a
              href={`${basePath}/sign-up`}
              className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Get started free
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────── */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(221_83%_53%/0.08),transparent)]" />
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full border border-primary/20">
            <Zap className="h-3.5 w-3.5" />
            Trusted by freelancers & agencies worldwide
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Turn 5 hours of client reporting
            <br className="hidden sm:block" />
            {" "}into{" "}
            <span className="text-primary">5 minutes</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ReportFlow is the fastest way for freelancers and marketing agencies to generate
            polished, white-labeled client reports — and share them via a simple link.
            No spreadsheets. No formatting. No wasted Fridays.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-2">
            <a
              href={`${basePath}/sign-up`}
              className="bg-primary text-primary-foreground px-6 sm:px-8 py-3.5 rounded-md font-semibold hover:bg-primary/90 transition-colors text-base text-center flex items-center justify-center gap-2"
            >
              Start for free <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#how-it-works"
              className="bg-muted text-foreground px-6 sm:px-8 py-3.5 rounded-md font-semibold hover:bg-muted/80 transition-colors text-base text-center"
            >
              See how it works
            </a>
          </div>
          <p className="text-sm text-muted-foreground">No credit card required · Free plan available · Setup in 5 minutes</p>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────── */}
      <section className="py-8 sm:py-10 border-y bg-muted/20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="text-2xl sm:text-3xl font-bold text-primary">{m.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────── */}
      <section id="how-it-works" className="py-14 sm:py-20 px-4 sm:px-6 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">From data to client report in 3 steps</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No learning curve. No complex setup. Just fast, professional reports your clients will be impressed by.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-8 left-[calc(16.7%+1rem)] right-[calc(16.7%+1rem)] h-px bg-border" />
            {[
              {
                step: "1",
                icon: Users,
                title: "Add a client",
                desc: "Enter their name, email, project type, and optionally set their brand color for white-label reports.",
              },
              {
                step: "2",
                icon: BarChart3,
                title: "Input or import metrics",
                desc: "Manually enter your performance data across Traffic, Conversions, Paid Ads, and Audience tabs — or upload a CSV in one click.",
              },
              {
                step: "3",
                icon: LinkIcon,
                title: "Generate & share",
                desc: "Click Generate Report. Copy the shareable link and send it to your client. That's literally it.",
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center gap-4 relative">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl z-10 shadow-md">
                  {s.step}
                </div>
                <s.icon className="h-8 w-8 text-primary/60" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────── */}
      <section id="features" className="py-14 sm:py-20 px-4 sm:px-6 bg-muted/20 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Everything you need. Nothing you don't.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              ReportFlow is purpose-built for client reporting — not a bloated all-in-one platform with features you'll never use.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-card border rounded-xl p-5 space-y-3 hover:border-primary/40 hover:shadow-sm transition-all">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why ReportFlow ─────────────────────── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Why agencies choose ReportFlow</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              See how we compare to cobbling together reports in spreadsheets or generic tools not built for client reporting.
            </p>
          </div>
          <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 bg-muted/50 text-sm font-semibold border-b">
              <div className="px-4 sm:px-6 py-4 text-muted-foreground">Feature</div>
              <div className="px-4 sm:px-6 py-4 text-center text-primary">ReportFlow</div>
              <div className="px-4 sm:px-6 py-4 text-center text-muted-foreground">Spreadsheets / others</div>
            </div>
            {comparisons.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 text-sm border-b last:border-b-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                <div className="px-4 sm:px-6 py-3.5 font-medium">{row.feature}</div>
                <div className="px-4 sm:px-6 py-3.5 flex justify-center">
                  {row.us ? (
                    <span className="h-6 w-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    </span>
                  ) : (
                    <span className="h-6 w-6 bg-destructive/10 rounded-full flex items-center justify-center text-destructive text-xs font-bold">✕</span>
                  )}
                </div>
                <div className="px-4 sm:px-6 py-3.5 flex justify-center">
                  {row.others ? (
                    <span className="h-6 w-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    </span>
                  ) : (
                    <span className="h-6 w-6 bg-destructive/10 rounded-full flex items-center justify-center text-destructive text-xs font-bold">✕</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Loved by freelancers & agencies</h2>
            <div className="flex justify-center gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card border rounded-xl p-6 space-y-4 hover:shadow-sm transition-shadow">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────── */}
      <section id="pricing" className="py-14 sm:py-20 px-4 sm:px-6 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Simple, honest pricing</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Pay for clients you manage — not features locked behind paywalls.
              All plans include a free trial. No hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-card rounded-2xl border p-6 sm:p-7 flex flex-col gap-5 relative transition-shadow hover:shadow-md ${
                  plan.highlight ? "border-primary shadow-md ring-1 ring-primary/20" : ""
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                    Most popular
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-xl">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`${basePath}/sign-up`}
                  className={`block text-center py-3 rounded-lg text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80 border"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            All paid plans include a 14-day free trial. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-muted/20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-card border rounded-xl p-5 sm:p-6 space-y-2">
                <h3 className="font-semibold text-sm sm:text-base">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Still have questions?{" "}
            <a href={`${basePath}/contact`} className="text-primary hover:underline font-medium">
              Contact our team
            </a>
          </p>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to reclaim your Fridays?</h2>
          <p className="text-muted-foreground text-lg">
            Join hundreds of freelancers and agencies who've cut their reporting time by 90%.
          </p>
          <a
            href={`${basePath}/sign-up`}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-md font-semibold hover:bg-primary/90 transition-colors text-base"
          >
            Get started for free <ArrowRight className="h-5 w-5" />
          </a>
          <p className="text-sm text-muted-foreground">Free plan · No credit card · Live in 5 minutes</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────── */}
      <footer className="border-t bg-muted/10 px-4 sm:px-6 pt-12 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 sm:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs">RF</div>
                <span className="font-bold text-base">ReportFlow</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The client reporting platform built for freelancers and agencies who value their time.
              </p>
              <p className="text-xs text-muted-foreground">
                Made with ♥ by{" "}
                <a href={`${basePath}/about`} className="font-semibold text-foreground hover:text-primary transition-colors">
                  LS DevCo
                </a>
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Product</h4>
              <ul className="space-y-2">
                {[
                  { label: "Features", href: "#features" },
                  { label: "How it works", href: "#how-it-works" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Sign up free", href: `${basePath}/sign-up` },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Company</h4>
              <ul className="space-y-2">
                {[
                  { label: "About us", href: `${basePath}/about` },
                  { label: "Contact", href: `${basePath}/contact` },
                  { label: "Privacy Policy", href: `${basePath}/privacy` },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Support</h4>
              <ul className="space-y-2">
                {[
                  { label: "Help center", href: `${basePath}/contact` },
                  { label: "Contact support", href: `${basePath}/contact` },
                  { label: "Sign in", href: `${basePath}/sign-in` },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 ReportFlow by <span className="font-semibold text-foreground">LS DevCo</span>. All rights reserved.</p>
            <div className="flex gap-4">
              <a href={`${basePath}/privacy`} className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href={`${basePath}/contact`} className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
