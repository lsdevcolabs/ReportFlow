import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import {
  Dashboard, Clients, ClientDetail,
  Reports, NewReport, ReportDetail,
  SharedReport, Settings,
  About, Contact, Privacy,
  Onboarding,
} from "@/pages";
import LandingPage from "@/pages/landing";
import { AppLayout } from "@/components/layout";
import { useGetUserProfile, getGetUserProfileQueryKey } from "@workspace/api-client-react";

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
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        forceRedirectUrl={`${basePath}/onboarding`}
      />
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

/** Shown while we fetch the user profile to decide where to route. */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

/**
 * Checks whether the signed-in user has completed onboarding.
 * If not, redirects to /onboarding. Otherwise renders the dashboard layout.
 */
function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { data: profile, isLoading } = useGetUserProfile({
    query: { retry: 1, queryKey: getGetUserProfileQueryKey() },
  });

  if (isLoading) return <LoadingScreen />;

  // profile is null (no row yet) or onboarding not finished → go to onboarding
  if (!profile || !profile.onboardingComplete) {
    return <Redirect to="/onboarding" />;
  }

  return <AppLayout>{children}</AppLayout>;
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

/** Requires sign-in; also gates on onboarding completion. */
function DashboardGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">
        <OnboardingCheck>{children}</OnboardingCheck>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

/** Requires sign-in only (no onboarding check — this IS the onboarding). */
function OnboardingGuard() {
  return (
    <>
      <Show when="signed-in">
        <Onboarding />
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
        signIn: { start: { title: "Welcome to ReportFlow", subtitle: "Sign in to manage your clients" } },
        signUp: { start: { title: "Join ReportFlow", subtitle: "Automate your client reporting" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            {/* Public marketing pages */}
            <Route path="/" component={HomeRedirect} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route path="/privacy" component={Privacy} />

            {/* Auth */}
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />

            {/* Onboarding — sign-in required, no onboarding-check */}
            <Route path="/onboarding" component={OnboardingGuard} />

            {/* Public shared report */}
            <Route path="/reports/shared/:shareToken" component={SharedReport} />

            {/* Protected app routes */}
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
