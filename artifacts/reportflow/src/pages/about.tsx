import { Link } from "wouter";
import {
  ArrowLeft,
  Zap,
  Target,
  Heart,
  Users,
  Globe,
  Shield,
  ArrowRight,
} from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const values = [
  {
    icon: Zap,
    title: "Speed over complexity",
    desc: "Every decision we make is guided by one question: does this make it faster to create a great report? If it doesn't, we don't build it.",
  },
  {
    icon: Target,
    title: "Purpose-built tools win",
    desc: "Generic tools make you adapt to them. ReportFlow adapts to you. It exists for one job — client reporting — and it does that job exceptionally well.",
  },
  {
    icon: Heart,
    title: "Freelancers deserve great software too",
    desc: "Enterprise software gets all the investment. We believe solo operators and small agencies deserve equally polished, powerful tools.",
  },
  {
    icon: Shield,
    title: "Simplicity is a feature",
    desc: "We deliberately keep the feature set focused. No bloat, no features you'll never use, no learning curve. Just the right tools done right.",
  },
];

const team = [
  {
    name: "LS DevCo",
    role: "Builder & Founder",
    desc: "A software development company passionate about building focused, high-quality tools for professionals who value their time. ReportFlow is our flagship product.",
    initials: "LS",
    color: "#2563eb",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <a href={basePath || "/"} className="flex items-center gap-2.5 mr-4">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
              RF
            </div>
            <span className="font-bold text-lg tracking-tight">ReportFlow</span>
          </a>
          <nav className="hidden sm:flex items-center gap-5 text-sm text-muted-foreground">
            <a href={`${basePath}/about`} className="text-foreground font-medium">About</a>
            <a href={`${basePath}/contact`} className="hover:text-foreground transition-colors">Contact</a>
            <a href={`${basePath}/privacy`} className="hover:text-foreground transition-colors">Privacy</a>
          </nav>
          <div className="flex-1" />
          <a
            href={`${basePath}/sign-up`}
            className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Get started free
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full border border-primary/20">
            Built by LS DevCo
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            About ReportFlow
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We built ReportFlow because we kept watching talented freelancers and agency owners
            waste hours every week doing something a well-designed piece of software should handle in minutes.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-muted/20">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">The problem we solved</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Client reporting is one of the most time-consuming recurring tasks for marketing
              freelancers and small agencies. A single weekly or monthly report could take anywhere
              from 2 to 5 hours — pulling numbers from multiple platforms, formatting them in
              spreadsheets, copying into a deck, cleaning up the design, and finally exporting and
              sending.
            </p>
            <p>
              The tools available either required expensive enterprise subscriptions, had steep
              learning curves, or produced generic-looking reports that didn't reflect the quality
              of work being done. We knew there had to be a better way.
            </p>
            <p>
              <span className="text-foreground font-semibold">ReportFlow was born from that frustration.</span> We
              set out to build a tool that felt purpose-built — fast, clean, and focused entirely
              on one job: helping you create and share polished client reports without the overhead.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">What we believe</h2>
            <p className="text-muted-foreground">The principles that guide every decision we make.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-card border rounded-xl p-6 space-y-3">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Company */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Who we are</h2>
            <p className="text-muted-foreground">The team behind ReportFlow.</p>
          </div>
          <div className="bg-card border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div
              className="h-20 w-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0"
              style={{ backgroundColor: "#2563eb" }}
            >
              LS
            </div>
            <div className="text-center sm:text-left space-y-3">
              <div>
                <h3 className="text-xl font-bold">LS DevCo</h3>
                <p className="text-sm text-primary font-medium">Software Development Company</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                LS DevCo is a software development company focused on building clean, efficient,
                and user-first web applications. We specialize in creating focused tools that solve
                real problems for professionals — without the bloat of enterprise software.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ReportFlow is our flagship SaaS product, designed from the ground up for marketing
                freelancers and agencies. We're committed to continuously improving it based on real
                user feedback and building software we'd want to use ourselves.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                  <Globe className="h-3.5 w-3.5" /> Web Applications
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                  <Zap className="h-3.5 w-3.5" /> SaaS Products
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                  <Users className="h-3.5 w-3.5" /> User-Focused Design
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 text-center">
        <div className="max-w-xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold">Try ReportFlow free today</h2>
          <p className="text-muted-foreground">
            No credit card. No commitment. Just faster client reporting.
          </p>
          <a
            href={`${basePath}/sign-up`}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-md font-semibold hover:bg-primary/90 transition-colors"
          >
            Get started free <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xs">RF</div>
            <span>
              ReportFlow by <span className="font-semibold text-foreground">LS DevCo</span>
            </span>
          </div>
          <div className="flex gap-5">
            <a href={basePath || "/"} className="hover:text-foreground transition-colors">Home</a>
            <a href={`${basePath}/contact`} className="hover:text-foreground transition-colors">Contact</a>
            <a href={`${basePath}/privacy`} className="hover:text-foreground transition-colors">Privacy</a>
          </div>
          <p>© 2026 LS DevCo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
