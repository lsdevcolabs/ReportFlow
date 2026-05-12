import Link from "next/link";
import { Zap } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md p-8 bg-card rounded-xl border shadow-sm">
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">ReportFlow</span>
          </Link>
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground">Start creating professional client reports</p>
        </div>
        
        <div className="mt-8 space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Authentication will be configured with Clerk.<br />
            Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in .env.local
          </p>
          
          <a 
            href="/api/auth/signup" 
            className="block w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-center hover:bg-primary/90 transition-colors"
          >
            Sign up with Clerk
          </a>
          
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}