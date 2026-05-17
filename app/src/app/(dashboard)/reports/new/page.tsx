"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAllTemplates, type ReportTemplate } from "@/lib/templates";

export default function TemplateSelectionPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("general");
  const templates = getAllTemplates();

  const handleContinue = () => {
    router.push(`/reports/new/builder?template=${selectedTemplate}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/reports">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1" />
          <Button variant="outline" asChild>
            <Link href="/reports">Cancel</Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            Step 1 of 2
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Choose a Report Template
          </h1>
          <p className="text-muted-foreground text-lg">
            Pick a template that matches your service. You can customize
            everything after.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {templates.map((template: ReportTemplate) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedTemplate === template.id
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "hover:border-primary/40"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{template.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {template.description}
                    </p>
                    {template.tabs[0]?.fields && template.tabs[0].fields.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {template.tabs[0].fields
                          .slice(0, 3)
                          .map((f) => (
                            <span
                              key={f.key}
                              className="inline-flex items-center text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                            >
                              {f.label}
                            </span>
                          ))}
                        {template.tabs[0].fields.length > 3 && (
                          <span className="inline-flex items-center text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                            +{template.tabs[0].fields.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <svg
                        className="h-3 w-3 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Link
            href="/reports/new/builder"
            className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            Start from scratch →
          </Link>
          <Button size="lg" onClick={handleContinue} className="px-8">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}