import Link from "next/link";
import { Zap } from "lucide-react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">ReportFlow</span>
        </Link>
      </div>
      
      <SignUp 
        routing="hash"
        signInUrl="/sign-in"
        redirectUrl="/choose-plan"
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "bg-card rounded-xl border shadow-sm"
          }
        }}
      />
    </div>
  );
}