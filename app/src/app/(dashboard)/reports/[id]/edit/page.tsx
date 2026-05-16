"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, Eye, Loader2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Client {
  id: string;
  name: string;
  brandColor: string | null;
}

interface ReportFormData {
  clientId: string;
  title: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  isPublic: boolean;
  // Traffic metrics
  organicTraffic: number | null;
  paidTraffic: number | null;
  previousOrganicTraffic: number | null;
  // Conversion metrics
  conversions: number | null;
  conversionRate: number | null;
  previousConversions: number | null;
  // Paid ads metrics
  spend: number | null;
  roas: number | null;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  // Audience metrics
  socialFollowers: number | null;
  socialEngagement: number | null;
  emailSubscribers: number | null;
  emailOpenRate: number | null;
  // Notes
  notes: string;
}

const initialFormData: ReportFormData = {
  clientId: "",
  title: "",
  dateRangeStart: "",
  dateRangeEnd: "",
  isPublic: false,
  organicTraffic: null,
  paidTraffic: null,
  previousOrganicTraffic: null,
  conversions: null,
  conversionRate: null,
  previousConversions: null,
  spend: null,
  roas: null,
  impressions: null,
  clicks: null,
  ctr: null,
  socialFollowers: null,
  socialEngagement: null,
  emailSubscribers: null,
  emailOpenRate: null,
  notes: "",
};

export default function EditReportPage() {
  return (
    <Suspense fallback={<EditReportPageLoading />}>
      <EditReportPageContent />
    </Suspense>
  );
}

function EditReportPageLoading() {
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

function EditReportPageContent() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingReport, setLoadingReport] = useState(true);
  
  const [formData, setFormData] = useState<ReportFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("traffic");
  const [importedCsvData, setImportedCsvData] = useState<Record<string, string>[] | null>(null);

  const applyCsvDataForClient = (clientId: string, csvRows: Record<string, string>[]) => {
    const selectedClient = clients.find((c) => c.id === clientId);
    if (!selectedClient) return;

    const clientName = selectedClient.name.toLowerCase();
    const matchedRow = csvRows.find(
      (row) =>
        (row["client"] && row["client"].toLowerCase() === clientName) ||
        (row["client name"] && row["client name"].toLowerCase() === clientName)
    ) || (csvRows.length === 1 && !csvRows[0]["client"] && !csvRows[0]["client name"] ? csvRows[0] : null);

    if (!matchedRow) {
      alert(`No data found for client "${selectedClient.name}" in the uploaded CSV.`);
      return;
    }

    const metricKeyMapping: Record<string, keyof ReportFormData> = {
      "organic traffic": "organicTraffic",
      "previous period organic": "previousOrganicTraffic",
      "paid traffic": "paidTraffic",
      "total conversions": "conversions",
      "conversion rate (%)": "conversionRate",
      "previous period conversions": "previousConversions",
      "ad spend ($)": "spend",
      "roas": "roas",
      "impressions": "impressions",
      "clicks": "clicks",
      "ctr (%)": "ctr",
      "social followers": "socialFollowers",
      "social engagement (%)": "socialEngagement",
      "email subscribers": "emailSubscribers",
      "email open rate (%)": "emailOpenRate",
    };

    const cleanValue = (val: string) => {
      const cleaned = val.replace(/[$,%]/g, "");
      return parseFloat(cleaned);
    };

    setFormData((prev) => {
      const newData = { ...prev, clientId };
      let updated = false;

      Object.keys(matchedRow).forEach((header) => {
        const valStr = matchedRow[header];
        if (!valStr) return;

        let key = metricKeyMapping[header] as keyof ReportFormData | undefined;
        if (!key && Object.keys(newData).includes(header)) {
          key = header as keyof ReportFormData;
        }

        if (key) {
          const val = cleanValue(valStr);
          if (!isNaN(val)) {
            (newData as any)[key] = val;
            updated = true;
          }
        } else if (header === "report title" || header === "reporttitle" || header === "title") {
          newData.title = valStr;
          updated = true;
        } else if (header === "start date" || header === "startdate") {
          const d = new Date(valStr);
          if (!isNaN(d.getTime())) {
            newData.dateRangeStart = d.toISOString().split("T")[0];
            updated = true;
          }
        } else if (header === "end date" || header === "enddate") {
          const d = new Date(valStr);
          if (!isNaN(d.getTime())) {
            newData.dateRangeEnd = d.toISOString().split("T")[0];
            updated = true;
          }
        }
      });

      if (updated) {
        setTimeout(() => alert(`CSV data applied for client "${selectedClient.name}".`), 0);
        return newData;
      } else {
        setTimeout(() => alert(`Data found for "${selectedClient.name}", but no valid metrics were recognized.`), 0);
        return prev;
      }
    });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [clientsRes, reportRes] = await Promise.all([
          fetch("/api/clients"),
          fetch(`/api/reports/${reportId}`)
        ]);
        
        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.clients || []);
        }
        
        if (reportRes.ok) {
          const data = await reportRes.json();
          if (data.report) {
            const r = data.report;
            const md = r.metricsData || {};
            const summary = md.summary || {};
            const organicChan = (md.channelBreakdown || []).find((c: any) => c.channel === "Organic");
            const paidChan = (md.channelBreakdown || []).find((c: any) => c.channel === "Paid");
            const getMetric = (label: string) => {
              const m = (md.customMetrics || []).find((x: any) => x.label === label);
              return m ? parseFloat(m.value.replace(/[^0-9.]/g, '')) : null;
            };

            setFormData({
              clientId: r.clientId,
              title: r.title,
              dateRangeStart: r.dateRangeStart ? new Date(r.dateRangeStart).toISOString().split("T")[0] : "",
              dateRangeEnd: r.dateRangeEnd ? new Date(r.dateRangeEnd).toISOString().split("T")[0] : "",
              isPublic: r.isPublic,
              organicTraffic: organicChan ? organicChan.sessions : null,
              paidTraffic: paidChan ? paidChan.sessions : null,
              previousOrganicTraffic: summary.previousSessions || null,
              conversions: summary.conversions || null,
              conversionRate: null,
              previousConversions: summary.previousConversions || null,
              spend: getMetric("Ad Spend"),
              roas: getMetric("ROAS"),
              impressions: null,
              clicks: null,
              ctr: null,
              socialFollowers: getMetric("Social Followers"),
              socialEngagement: null,
              emailSubscribers: getMetric("Email Subscribers"),
              emailOpenRate: null,
              notes: md.notes || "",
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch data", e);
      } finally {
        setLoadingClients(false);
        setLoadingReport(false);
      }
    }
    fetchData();
  }, [reportId]);

  const updateField = <K extends keyof ReportFormData>(field: K, value: ReportFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        clientId: formData.clientId,
        title: formData.title,
        dateRangeStart: formData.dateRangeStart,
        dateRangeEnd: formData.dateRangeEnd,
        isPublic: formData.isPublic,
        metricsData: {
          summary: {
            sessions: (formData.organicTraffic || 0) + (formData.paidTraffic || 0),
            conversions: formData.conversions || 0,
            previousSessions: formData.previousOrganicTraffic || 0,
            previousConversions: formData.previousConversions || 0,
            revenue: formData.spend ? (formData.roas ? formData.spend * formData.roas : 0) : undefined,
          },
          channelBreakdown: [
            { channel: "Organic", sessions: formData.organicTraffic || 0 },
            { channel: "Paid", sessions: formData.paidTraffic || 0 }
          ].filter(c => c.sessions > 0),
          customMetrics: [
            { label: "Ad Spend", value: `$${formData.spend || 0}` },
            { label: "ROAS", value: `${formData.roas || 0}x` },
            { label: "Social Followers", value: `${formData.socialFollowers || 0}` },
            { label: "Email Subscribers", value: `${formData.emailSubscribers || 0}` }
          ].filter(m => m.value !== "$0" && m.value !== "0x" && m.value !== "0"),
          notes: formData.notes
        }
      };

      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push(`/reports/${reportId}`);
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
      
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length < 2) {
        alert("Invalid CSV format. Need headers and at least one row of data.");
        return;
      }
      
      const parseCsvLine = (text: string) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '"' && text[i+1] === '"') {
            current += '"';
            i++; 
          } else if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current);
        return result.map(s => s.trim());
      };

      let rows: Record<string, string>[] = [];
      const firstLineParts = parseCsvLine(lines[0].toLowerCase());
      if (firstLineParts.includes("metric") && firstLineParts.includes("value")) {
        // Vertical format
        const rowData: Record<string, string> = {};
        for (let i = 1; i < lines.length; i++) {
          const parts = parseCsvLine(lines[i]);
          if (parts.length >= 2) {
            rowData[parts[0].toLowerCase()] = parts[1];
          }
        }
        rows = [rowData];
      } else {
        // Horizontal format
        const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
        for (let i = 1; i < lines.length; i++) {
          const values = parseCsvLine(lines[i]);
          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index] || "";
          });
          rows.push(rowData);
        }
      }
      
      setImportedCsvData(rows);
      if (formData.clientId) {
        applyCsvDataForClient(formData.clientId, rows);
      } else {
        alert("CSV uploaded successfully. Please select a client to populate the data.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const selectedClient = clients.find((c) => c.id === formData.clientId);

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
            <h1 className="text-xl font-semibold">Edit Report</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/reports/${reportId}`}>Cancel</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.clientId || !formData.title || loadingReport}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
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
                    <Select value={formData.clientId} onValueChange={(v) => {
                      updateField("clientId", v);
                      if (importedCsvData) {
                        applyCsvDataForClient(v, importedCsvData);
                      }
                    }} disabled={loadingClients}>
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
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
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
                      value={formData.dateRangeStart}
                      onChange={(e) => updateField("dateRangeStart", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.dateRangeEnd}
                      onChange={(e) => updateField("dateRangeEnd", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics Input */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Metrics Data</CardTitle>
                    <CardDescription>Enter the performance data for this reporting period.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                  </Button>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="flex flex-wrap sm:grid sm:grid-cols-4 mb-6 h-auto">
                    <TabsTrigger value="traffic">Traffic</TabsTrigger>
                    <TabsTrigger value="conversion">Conversions</TabsTrigger>
                    <TabsTrigger value="paid">Paid Ads</TabsTrigger>
                    <TabsTrigger value="audience">Audience</TabsTrigger>
                  </TabsList>

                  <TabsContent value="traffic" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="organicTraffic">Organic Traffic</Label>
                        <Input
                          id="organicTraffic"
                          type="number"
                          placeholder="0"
                          value={formData.organicTraffic ?? ""}
                          onChange={(e) => updateField("organicTraffic", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="previousOrganic">Previous Period Organic</Label>
                        <Input
                          id="previousOrganic"
                          type="number"
                          placeholder="0"
                          value={formData.previousOrganicTraffic ?? ""}
                          onChange={(e) => updateField("previousOrganicTraffic", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paidTraffic">Paid Traffic</Label>
                        <Input
                          id="paidTraffic"
                          type="number"
                          placeholder="0"
                          value={formData.paidTraffic ?? ""}
                          onChange={(e) => updateField("paidTraffic", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="conversion" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="conversions">Total Conversions</Label>
                        <Input
                          id="conversions"
                          type="number"
                          placeholder="0"
                          value={formData.conversions ?? ""}
                          onChange={(e) => updateField("conversions", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="conversionRate">Conversion Rate (%)</Label>
                        <Input
                          id="conversionRate"
                          type="number"
                          step="0.01"
                          placeholder="0.0"
                          value={formData.conversionRate ?? ""}
                          onChange={(e) => updateField("conversionRate", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="previousConversions">Previous Period Conversions</Label>
                        <Input
                          id="previousConversions"
                          type="number"
                          placeholder="0"
                          value={formData.previousConversions ?? ""}
                          onChange={(e) => updateField("previousConversions", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="paid" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="spend">Ad Spend ($)</Label>
                        <Input
                          id="spend"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.spend ?? ""}
                          onChange={(e) => updateField("spend", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roas">ROAS</Label>
                        <Input
                          id="roas"
                          type="number"
                          step="0.01"
                          placeholder="0.0"
                          value={formData.roas ?? ""}
                          onChange={(e) => updateField("roas", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="impressions">Impressions</Label>
                        <Input
                          id="impressions"
                          type="number"
                          placeholder="0"
                          value={formData.impressions ?? ""}
                          onChange={(e) => updateField("impressions", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clicks">Clicks</Label>
                        <Input
                          id="clicks"
                          type="number"
                          placeholder="0"
                          value={formData.clicks ?? ""}
                          onChange={(e) => updateField("clicks", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ctr">CTR (%)</Label>
                        <Input
                          id="ctr"
                          type="number"
                          step="0.01"
                          placeholder="0.0"
                          value={formData.ctr ?? ""}
                          onChange={(e) => updateField("ctr", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="audience" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="socialFollowers">Social Followers</Label>
                        <Input
                          id="socialFollowers"
                          type="number"
                          placeholder="0"
                          value={formData.socialFollowers ?? ""}
                          onChange={(e) => updateField("socialFollowers", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="socialEngagement">Social Engagement (%)</Label>
                        <Input
                          id="socialEngagement"
                          type="number"
                          step="0.01"
                          placeholder="0.0"
                          value={formData.socialEngagement ?? ""}
                          onChange={(e) => updateField("socialEngagement", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emailSubscribers">Email Subscribers</Label>
                        <Input
                          id="emailSubscribers"
                          type="number"
                          placeholder="0"
                          value={formData.emailSubscribers ?? ""}
                          onChange={(e) => updateField("emailSubscribers", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emailOpenRate">Email Open Rate (%)</Label>
                        <Input
                          id="emailOpenRate"
                          type="number"
                          step="0.01"
                          placeholder="0.0"
                          value={formData.emailOpenRate ?? ""}
                          onChange={(e) => updateField("emailOpenRate", e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 pt-6 border-t">
                  <Label htmlFor="notes" className="mb-2 block">Executive Summary & Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="This month we saw a 15% increase in organic traffic due to..."
                    className="min-h-[120px]"
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

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
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => updateField("isPublic", checked)}
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
                  {!selectedClient || !formData.title ? (
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
                      
                      <h3 className="text-2xl font-bold">{formData.title}</h3>
                      
                      <p className="text-sm text-muted-foreground">
                        {formData.dateRangeStart && formData.dateRangeEnd
                          ? `${new Date(formData.dateRangeStart).toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${new Date(formData.dateRangeEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                          : "Select date range"}
                      </p>

                      {/* KPI Cards Preview */}
                      <div className="grid grid-cols-2 gap-3 pt-4">
                        {formData.organicTraffic != null && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Total Traffic</p>
                            <p className="text-xl font-bold">
                              {((formData.organicTraffic || 0) + (formData.paidTraffic || 0)).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {formData.conversions != null && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Conversions</p>
                            <p className="text-xl font-bold">{formData.conversions.toLocaleString()}</p>
                          </div>
                        )}
                        {formData.spend != null && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Ad Spend</p>
                            <p className="text-xl font-bold">${formData.spend.toLocaleString()}</p>
                          </div>
                        )}
                        {formData.roas != null && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">ROAS</p>
                            <p className="text-xl font-bold">{formData.roas}x</p>
                          </div>
                        )}
                      </div>

                      {/* Notes Preview */}
                      {formData.notes && (
                        <div className="pt-4 border-t">
                          <p className="text-sm font-medium mb-2">Summary</p>
                          <p className="text-sm text-muted-foreground line-clamp-3">{formData.notes}</p>
                        </div>
                      )}

                      {/* Status */}
                      <div className="pt-4 border-t">
                        <Badge variant={formData.isPublic ? "default" : "secondary"}>
                          {formData.isPublic ? "Published" : "Draft"}
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