import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/20 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <FileQuestion className="h-10 w-10" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <p className="text-xl font-semibold">Page not found</p>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href={`${basePath}/`}>
            <Button className="w-full sm:w-auto">Go to homepage</Button>
          </Link>
          <Link href={`${basePath}/dashboard`}>
            <Button variant="outline" className="w-full sm:w-auto">Go to dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
