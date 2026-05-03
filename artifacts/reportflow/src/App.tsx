import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Redirect, Router as WouterRouter, Link } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  BarChart3,
  FileBarChart,
  Link as LinkIcon,
  Users,
  Zap,
  ChevronRight,
  Check,
} from "lucide-react";

import NotFound from "@/pages/not-found";
import { Dashboard, Clients, ClientDetail, Reports, NewReport, ReportDetail, SharedReport, Settings } from "@/pages";
import { AppLayout } from "@/components/layout";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(221 83% 53%)",
    colorForeground: "hsl(222 47% 11%)",
    colorMutedForeground: "hsl(215.4 16.3% 46.9%)",
    colorDanger: "hsl(0 84.2% 60.2%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(214.3 31.8% 91.4%)",
    colorInputForeground: "hsl(222 47% 11%)",
    colorNeutral: "hsl(214 32% 91%)",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg border border-border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold text-foreground",
    headerSubtitle: "text-sm text-muted-foreground",
    socialButtonsBlockButtonText: "text-sm font-medium text-foreground",
    formFieldLabel: "text-sm font-medium text-foreground",
    footerActionLink: "text-sm font-medium text-primary hover:text-primary/90",
    footerActionText: "text-sm text-muted-foreground",
    dividerText: "text-xs text-muted-foreground bg-white px-2",
    identityPreviewEditButton: "text-primary hover:text-primary/90",
    formFieldSuccessText: "text-sm text-green-600",
    alertText: "text-sm font-medium",
    logoBox: "mx-auto h-8",
    logoImage: "mx-auto h-8",
    socialButtonsBlockButton: "border-border hover:bg-secondary/50",
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
    formFieldInput: "bg-background border-input text-foreground flex h-10 w-full rounded-md border px-3 py-2 text-sm",
    footerAction: "flex justify-center items-center space-x-1",
    dividerLine: "bg-border",
    alert: "bg-destructive/10 border border-destructive/20 text-destructive rounded-md",
    otpCodeFieldInput: "border-input text-foreground",
    formFieldRow: "space-y-2",
    main: "space-y-4",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4 py-8">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4 py-8">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

const features = [
  {
    icon: Zap,
    title: "Generate in seconds",
    desc: "Input your metrics and click generate. Your branded report is ready instantly.",
  },
  {
    icon: LinkIcon,
    title: "Shareable links",
    desc: "Send clients a clean public URL. No logins, no downloads — just a polished report.",
  },
  {
    icon: Users,
    title: "Multi-client management",
    desc: "Organize all your clients in one place with their brand colors and project types.",
  },
  {
    icon: FileBarChart,
    title: "Visual charts",
    desc: "Traffic trends, conversion growth, ad performance — all visualized automatically.",
  },
  {
    icon: BarChart3,
    title: "CSV import",
    desc: "Paste or upload a CSV and your metrics populate instantly. No manual entry.",
  },
  {
    icon: ChevronRight,
    title: "White-label ready",
    desc: "Each client's brand color reflects in their report. Looks like your own product.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with one client",
    features: ["1 client", "5 reports/month", "Shareable links", "CSV import"],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Starter",
    price: "$9",
    period: "per month",
    description: "For growing freelancers",
    features: ["5 clients", "Unlimited reports", "White-label branding", "CSV import", "Priority support"],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For agencies at scale",
    features: ["Unlimited clients", "Unlimited reports", "White-label branding", "Custom domain", "API access", "Priority support"],
    cta: "Start free trial",
    highlight: false,
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
              RF
            </div>
            <span className="font-bold text-lg tracking-tight">ReportFlow</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`${basePath}/sign-in`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Sign in
            </a>
            <a
              href={`${basePath}/sign-up`}
              className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full border border-primary/20">
            <Zap className="h-3.5 w-3.5" />
            Save 2–5 hours per client per week
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
            Turn 5 hours of reporting
            <br className="hidden sm:block" />
            {" "}into{" "}
            <span className="text-primary">5 minutes</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Automatically generate clean, client-ready marketing reports. Connect your metrics,
            click generate, share a link. That's it.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-2">
            <a
              href={`${basePath}/sign-up`}
              className="bg-primary text-primary-foreground px-6 sm:px-8 py-3.5 rounded-md font-semibold hover:bg-primary/90 transition-colors text-base text-center"
              data-testid="cta-get-started"
            >
              Get started for free
            </a>
            <a
              href={`${basePath}/sign-in`}
              className="bg-muted text-foreground px-6 sm:px-8 py-3.5 rounded-md font-semibold hover:bg-muted/80 transition-colors text-base text-center"
              data-testid="cta-sign-in"
            >
              Sign in
            </a>
          </div>
          <p className="text-sm text-muted-foreground">No credit card required. Free plan available.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-14">
            From data to client report in 3 steps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: "1", title: "Add a client", desc: "Enter their name, email, and project type. Optionally set their brand color." },
              { step: "2", title: "Input metrics", desc: "Type in your numbers, upload a CSV, or fill each tab. Traffic, conversions, ads, social." },
              { step: "3", title: "Generate & share", desc: "One click generates a polished report. Copy a shareable link and send it." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-14">
            Everything you need to report confidently
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-card border rounded-xl p-5 sm:p-6 space-y-3 hover:border-primary/30 hover:shadow-sm transition-all">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">Pay for clients managed, not features locked.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-card rounded-xl border p-6 flex flex-col gap-5 ${plan.highlight ? "border-primary shadow-md ring-1 ring-primary/20 relative" : ""}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{plan.description}</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`${basePath}/sign-up`}
                  className={`block text-center py-2.5 rounded-md text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to save hours every week?</h2>
          <p className="text-muted-foreground">Join freelancers and agencies who've automated their reporting workflow.</p>
          <a
            href={`${basePath}/sign-up`}
            className="inline-block bg-primary text-primary-foreground px-8 py-3.5 rounded-md font-semibold hover:bg-primary/90 transition-colors text-base"
          >
            Start for free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xs">RF</div>
            <span className="font-semibold text-foreground">ReportFlow</span>
          </div>
          <p>© 2026 ReportFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function DashboardGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">
        <AppLayout>{children}</AppLayout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome to ReportFlow",
            subtitle: "Sign in to manage your clients",
          },
        },
        signUp: {
          start: {
            title: "Join ReportFlow",
            subtitle: "Automate your client reporting",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/reports/shared/:shareToken" component={SharedReport} />

            <Route path="/dashboard">
              <DashboardGuard><Dashboard /></DashboardGuard>
            </Route>
            <Route path="/clients">
              <DashboardGuard><Clients /></DashboardGuard>
            </Route>
            <Route path="/clients/:clientId">
              <DashboardGuard><ClientDetail /></DashboardGuard>
            </Route>
            <Route path="/reports">
              <DashboardGuard><Reports /></DashboardGuard>
            </Route>
            <Route path="/reports/new">
              <DashboardGuard><NewReport /></DashboardGuard>
            </Route>
            <Route path="/reports/:reportId">
              <DashboardGuard><ReportDetail /></DashboardGuard>
            </Route>
            <Route path="/settings">
              <DashboardGuard><Settings /></DashboardGuard>
            </Route>

            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
