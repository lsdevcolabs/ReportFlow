"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Upload, Eye, Loader2, Sparkles } from "lucide-react";
import { getTemplate, type TemplateType } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GeneralMarketingForm } from "@/components/reports/general-marketing-form";
import { SeoForm } from "@/components/reports/seo-form";
import { PaidAdsForm } from "@/components/reports/paid-ads-form";
import { SocialMediaForm } from "@/components/reports/social-media-form";

interface Client {
  id: string;
  name: string;
  brandColor: string | null;
}

export default function NewReportPage() {
  return (
    <Suspense fallback={<NewReportPageLoading />}>
      <NewReportPageContent />
    </Suspense>
  );
}

function NewReportPageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

function NewReportPageContent() {
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get("clientId") || "";
  const templateId = (searchParams.get("template") || "general") as TemplateType;

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientId, setClientId] = useState(initialClientId);
  const [title, setTitle] = useState("");
  const [dateRangeStart, setDateRangeStart] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0]
  );
  const [dateRangeEnd, setDateRangeEnd] = useState(new Date().toISOString().split("T")[0]);
  const [isPublic, setIsPublic] = useState(false);
  const [metricsData, setMetricsData] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const template = getTemplate(templateId);

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch("/api/clients");
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients || []);
        }
      } catch (e) {
        console.error("Failed to fetch clients", e);
      } finally {
        setLoadingClients(false);
      }
    }
    fetchClients();
  }, []);

  // Initialize default channels for general template
  useEffect(() => {
    if (templateId === "general" && !metricsData.channels) {
      setMetricsData((prev) => ({
        ...prev,
        channels: (template.defaultChannels || []).map((ch) => ({ name: ch.name, sessions: 0 })),
      }));
    }
    // Initialize default enabled platforms for social media
    if (templateId === "socialMedia" && !metricsData.enabledPlatforms) {
      const platformToggle = template.tabs.find((t) => t.platformToggle)?.platformToggle;
      if (platformToggle) {
        setMetricsData((prev) => ({
          ...prev,
          enabledPlatforms: Object.fromEntries(
            platformToggle.defaultEnabled.map((id) => [id, true])
          ),
        }));
      }
    }
  }, [templateId]);

  const handleGenerateAiSummary = async () => {
    if (!clientId) {
      alert("Please select a client first.");
      return;
    }

    setIsGeneratingSummary(true);
    setMetricsData((prev) => ({ ...prev, executiveSummary: "" }));

    try {
      const res = await fetch(`/api/reports/generate-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          title: title || "Untitled Report",
          dateRangeStart,
          dateRangeEnd,
          metricsData,
          templateType: templateId,
        }),
      });

      const data = await res.json();

      if (res.status === 403) {
        alert("AI-generated summaries require a Starter or Pro plan. Please upgrade to continue.");
        return;
      }

      if (res.status === 503 || !res.ok) {
        alert(data.message ?? "AI generation failed. Please try again.");
        return;
      }

      if (data.summary) {
        setMetricsData((prev) => ({ ...prev, executiveSummary: data.summary }));
      }
    } catch (e) {
      console.error("Failed to generate AI summary:", e);
      alert("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        clientId,
        title,
        templateType: templateId,
        dateRangeStart,
        dateRangeEnd,
        isPublic,
        metricsData,
      };

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        window.location.href = `/reports/${data.report.id}`;
      } else {
        const errorData = await res.json();
        console.error("Failed to create report:", errorData);
        alert(`Failed to create report: ${errorData.error || errorData.message || "Unknown error"}`);
      }
    } catch (e) {
      console.error("Error creating report:", e);
      alert("An unexpected error occurred while creating the report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").map((line) => line.trim()).filter((line) => line);
      if (lines.length < 2) {
        alert("Invalid CSV format. Need headers and at least one row of data.");
        return;
      }

      const parseCsvLine = (text: string) => {
        const result = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '"' && text[i + 1] === '"') {
            current += '"';
            i++;
          } else if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            result.push(current);
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current);
        return result.map((s) => s.trim());
      };

      let rows: Record<string, string>[] = [];
      const firstLineParts = parseCsvLine(lines[0].toLowerCase());
      if (firstLineParts.includes("metric") && firstLineParts.includes("value")) {
        const rowData: Record<string, string> = {};
        for (let i = 1; i < lines.length; i++) {
          const parts = parseCsvLine(lines[i]);
          if (parts.length >= 2) {
            rowData[parts[0].toLowerCase()] = parts[1];
          }
        }
        rows = [rowData];
      } else {
        const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
        for (let i = 1; i < lines.length; i++) {
          const values = parseCsvLine(lines[i]);
          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index] || "";
          });
          rows.push(rowData);
        }
      }

      // Apply CSV data to metricsData
      if (rows.length > 0) {
        // Build field lookup from template: normalized label -> field key
        const fieldByLabel = new Map<string, string>();
        const fieldByKey = new Map<string, string>();
        for (const tab of template.tabs) {
          if (tab.fields) {
            for (const field of tab.fields) {
              const normLabel = field.label.replace(/[^a-z0-9]/g, "").toLowerCase();
              fieldByLabel.set(normLabel, field.key);
              fieldByKey.set(field.key.toLowerCase(), field.key);
            }
          }
        }

        // Find the row matching the selected client
        let matchedRow = rows[0];
        if (rows.length > 1 && clientId) {
          const client = clients.find((c) => c.id === clientId);
          if (client) {
            const clientLower = client.name.toLowerCase().trim();
            // Strategy 1: exact match on company/client name column
            const nameKey = Object.keys(rows[0]).find(
              (k) => k === "company name" || k === "client name" || k === "client" || k === "company"
            );
            if (nameKey) {
              const found = rows.find(
                (r) => (r[nameKey] || "").toLowerCase().trim() === clientLower
              );
              if (found) {
                matchedRow = found;
              } else {
                // Strategy 2: contains match on company/client name column
                const found2 = rows.find((r) => {
                  const val = (r[nameKey] || "").toLowerCase().trim();
                  return val.includes(clientLower) || clientLower.includes(val);
                });
                if (found2) matchedRow = found2;
              }
            } else {
              // Strategy 3: search all values in each row for client name
              const found = rows.find((r) =>
                Object.values(r).some(
                  (v) => v.toLowerCase().trim() === clientLower
                )
              );
              if (found) matchedRow = found;
            }
          }
        }

        const newMetrics = { ...metricsData };
        let updated = false;

        Object.keys(matchedRow).forEach((header) => {
          const valStr = matchedRow[header];
          if (!valStr) return;

          const normalizedHeader = header.replace(/[^a-z0-9]/g, "").toLowerCase();

          // Handle special non-metric fields
          if (header === "report title" || header === "title") {
            setTitle(valStr);
            updated = true;
            return;
          }
          if (header === "start date" || header === "startdate") {
            const d = new Date(valStr);
            if (!isNaN(d.getTime())) {
              setDateRangeStart(d.toISOString().split("T")[0]);
              updated = true;
            }
            return;
          }
          if (header === "end date" || header === "enddate") {
            const d = new Date(valStr);
            if (!isNaN(d.getTime())) {
              setDateRangeEnd(d.toISOString().split("T")[0]);
              updated = true;
            }
            return;
          }
          if (normalizedHeader === "companyname" || normalizedHeader === "clientname" || normalizedHeader === "client" || normalizedHeader === "company") {
            return;
          }

          // Parse numeric value
          const cleanVal = parseFloat(valStr.replace(/[$,%]/g, ""));
          if (isNaN(cleanVal)) return;

          // Match header to template field: exact label match first, then by key
          let fieldKey: string | undefined;
          if (fieldByLabel.has(normalizedHeader)) {
            fieldKey = fieldByLabel.get(normalizedHeader);
          } else if (fieldByKey.has(normalizedHeader)) {
            fieldKey = fieldByKey.get(normalizedHeader);
          } else {
            // Substring: check if header contains a field key
            for (const [keyLower, key] of fieldByKey) {
              if (normalizedHeader.includes(keyLower)) {
                fieldKey = key;
                break;
              }
            }
          }

          if (fieldKey) {
            newMetrics[fieldKey] = cleanVal;
            updated = true;
          }
        });

        if (updated) {
          setMetricsData(newMetrics);
          alert("CSV data applied successfully.");
        } else {
          alert("CSV uploaded but no matching metrics were recognized.");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const selectedClient = clients.find((c) => c.id === clientId);

  const renderTemplateForm = () => {
    const formProps = {
      metricsData,
      onChange: setMetricsData,
      clientId,
      templateType: templateId,
      onGenerateAiSummary: handleGenerateAiSummary,
      isGeneratingSummary,
    };

    switch (templateId) {
      case "seo":
        return <SeoForm {...formProps} />;
      case "paidAds":
        return <PaidAdsForm {...formProps} />;
      case "socialMedia":
        return <SocialMediaForm {...formProps} />;
      default:
        return <GeneralMarketingForm {...formProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/reports">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">
              {template.icon} {template.name}
            </h1>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/reports">Cancel</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !clientId || !title}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Report Details */}
            <Card>
              <CardHeader>
                <CardTitle>Report Details</CardTitle>
                <CardDescription>Basic information about this report.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Client *</Label>
                    <Select value={clientId} onValueChange={setClientId} disabled={loadingClients}>
                      <SelectTrigger id="client">
                        <SelectValue placeholder={loadingClients ? "Loading..." : "Select a client"} />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.length === 0 && !loadingClients ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No clients yet. Add a client first.
                          </div>
                        ) : (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-4 w-4 rounded-full"
                                  style={{ backgroundColor: client.brandColor || "#2563EB" }}
                                />
                                {client.name}
                              </div>
                            </SelectItem>
                          ))
                        )}
                        <div className="border-t mt-1 pt-1">
                          <Link
                            href="/clients?new=1"
                            className="flex items-center gap-2 px-2 py-1.5 text-sm text-primary hover:bg-accent rounded-sm"
                          >
                            <span className="text-lg leading-none">+</span>
                            Add new client
                          </Link>
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Q1 2025 Performance Report"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRangeStart}
                      onChange={(e) => setDateRangeStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRangeEnd}
                      onChange={(e) => setDateRangeEnd(e.target.value)}
                    />
                  </div>
                </div>

                {/* Date presets */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { label: "Last 7 days", days: 7 },
                    { label: "Last 30 days", days: 30 },
                    { label: "Last month", days: -1 },
                    { label: "Last quarter", days: -2 },
                  ].map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const end = new Date();
                        let start: Date;
                        if (preset.days === -1) {
                          start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
                          end.setDate(0);
                        } else if (preset.days === -2) {
                          const currentQuarter = Math.floor(end.getMonth() / 3);
                          start = new Date(end.getFullYear(), currentQuarter * 3 - 3, 1);
                          end.setTime(start.getTime());
                          end.setMonth(end.getMonth() + 3);
                          end.setDate(0);
                        } else {
                          start = new Date();
                          start.setDate(start.getDate() - preset.days);
                        }
                        setDateRangeStart(start.toISOString().split("T")[0]);
                        setDateRangeEnd(end.toISOString().split("T")[0]);
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CSV Import */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Import from CSV</p>
                    <p className="text-xs text-muted-foreground">
                      Upload a CSV file to auto-populate metrics.{" "}
                      <a
                        href={
                          templateId === "seo"
                            ? "/presets/seo-report-preset.csv"
                            : templateId === "paidAds"
                            ? "/presets/paid-ads-preset.csv"
                            : templateId === "socialMedia"
                            ? "/presets/social-media-preset.csv"
                            : "/presets/general-report-preset.csv"
                        }
                        download
                        className="text-primary hover:underline font-semibold"
                      >
                        Download Template
                      </a>
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                  </Button>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Template-Specific Metrics Form */}
            {renderTemplateForm()}

            {/* Publish Toggle */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isPublic" className="text-base">Publish Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this report viewable via public link
                    </p>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div className="sticky top-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">Live Preview</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {!selectedClient || !title ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground">Select a client and enter a title to see preview</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Preview Header */}
                      <div className="flex items-center gap-2 text-sm">
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: selectedClient.brandColor || "#3b82f6" }}
                        >
                          {selectedClient.name.charAt(0)}
                        </div>
                        <span className="font-medium" style={{ color: selectedClient.brandColor || "#3b82f6" }}>
                          {selectedClient.name}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold">{title}</h3>

                      <p className="text-sm text-muted-foreground">
                        {dateRangeStart && dateRangeEnd
                          ? `${new Date(dateRangeStart).toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${new Date(dateRangeEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                          : "Select date range"}
                      </p>

                      {/* Template Badge */}
                      <Badge variant="secondary">{template.name}</Badge>

                      {/* KPI Cards Preview - show first 4 numeric fields */}
                      <div className="grid grid-cols-2 gap-3 pt-4">
                        {(template.tabs[0]?.fields || [])
                          .filter((f) => f.type === "number" || f.type === "currency" || f.type === "percentage")
                          .slice(0, 4)
                          .map((field) => {
                            const val = metricsData[field.key];
                            if (val == null || val === "") return null;
                            const displayVal = field.type === "currency"
                              ? `$${Number(val).toLocaleString()}`
                              : field.type === "percentage"
                              ? `${val}%`
                              : Number(val).toLocaleString();
                            return (
                              <div key={field.key} className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">{field.label}</p>
                                <p className="text-xl font-bold">{displayVal}</p>
                                {field.hasPreviousPeriod && metricsData[`prev_${field.key}`] != null && (() => {
                                  const prev = Number(metricsData[`prev_${field.key}`]);
                                  const curr = Number(val);
                                  if (!prev) return null;
                                  const change = ((curr - prev) / prev) * 100;
                                  return (
                                    <p className={`text-xs mt-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                                      {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs previous
                                    </p>
                                  );
                                })()}
                              </div>
                            );
                          })}
                      </div>

                      {/* Notes Preview */}
                      {Boolean(metricsData.executiveSummary) && (
                        <div className="pt-4 border-t">
                          <p className="text-sm font-medium mb-2">Summary</p>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {metricsData.executiveSummary as string}
                          </p>
                        </div>
                      )}

                      {/* Status */}
                      <div className="pt-4 border-t">
                        <Badge variant={isPublic ? "default" : "secondary"}>
                          {isPublic ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
