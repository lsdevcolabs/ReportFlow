import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateClient, useListClients, useCreateReport, getListReportsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, UploadCloud, FileText, ArrowLeft, BarChart3, TrendingUp, Users, Plus } from "lucide-react";
import { Link } from "wouter";
import { ClientFormDialog } from "../clients/client-form-dialog";

const reportFormSchema = z.object({
  clientId: z.string().min(1, "Please select a client."),
  title: z.string().min(2, "Title is required."),
  dateRangeStart: z.string().min(1, "Start date is required."),
  dateRangeEnd: z.string().min(1, "End date is required."),
  isPublic: z.boolean().default(false),
  data: z.object({
    organicTraffic: z.coerce.number().optional().nullable(),
    paidTraffic: z.coerce.number().optional().nullable(),
    conversions: z.coerce.number().optional().nullable(),
    conversionRate: z.coerce.number().optional().nullable(),
    impressions: z.coerce.number().optional().nullable(),
    clicks: z.coerce.number().optional().nullable(),
    ctr: z.coerce.number().optional().nullable(),
    spend: z.coerce.number().optional().nullable(),
    roas: z.coerce.number().optional().nullable(),
    socialFollowers: z.coerce.number().optional().nullable(),
    socialEngagement: z.coerce.number().optional().nullable(),
    emailSubscribers: z.coerce.number().optional().nullable(),
    emailOpenRate: z.coerce.number().optional().nullable(),
    previousOrganicTraffic: z.coerce.number().optional().nullable(),
    previousConversions: z.coerce.number().optional().nullable(),
    previousSpend: z.coerce.number().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

export default function NewReport() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const queryParams = new URLSearchParams(searchString);
  const initialClientId = queryParams.get("clientId") || "";
  
  const { data: clients, isLoading: isLoadingClients } = useListClients();
  const createReport = useCreateReport();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("traffic");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      clientId: initialClientId,
      title: "",
      dateRangeStart: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      dateRangeEnd: new Date().toISOString().split('T')[0],
      isPublic: false,
      data: {
        organicTraffic: null,
        paidTraffic: null,
        conversions: null,
        conversionRate: null,
        impressions: null,
        clicks: null,
        ctr: null,
        spend: null,
        roas: null,
        socialFollowers: null,
        socialEngagement: null,
        emailSubscribers: null,
        emailOpenRate: null,
        previousOrganicTraffic: null,
        previousConversions: null,
        previousSpend: null,
        notes: "",
      }
    },
  });

  const onSubmit = (values: ReportFormValues) => {
    const reportData = {
      ...values,
      clientId: parseInt(values.clientId),
    };

    createReport.mutate({ data: reportData }, {
      onSuccess: (report) => {
        toast({ title: "Report created successfully" });
        queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
        setLocation(`/reports/${report.id}`);
      },
      onError: () => {
        toast({ title: "Failed to create report", variant: "destructive" });
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Super basic CSV parser for demo purposes
        const rows = text.split('\n');
        if (rows.length > 1) {
          const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
          const values = rows[1].split(',').map(v => v.trim());
          
          const currentData = form.getValues("data");
          const newData = { ...currentData };
          
          headers.forEach((header, i) => {
            const val = parseFloat(values[i]);
            if (!isNaN(val)) {
              if (header.includes('organic') || header.includes('traffic')) newData.organicTraffic = val;
              else if (header.includes('conversion') || header.includes('goal')) newData.conversions = val;
              else if (header.includes('spend') || header.includes('cost')) newData.spend = val;
              else if (header.includes('impression')) newData.impressions = val;
              else if (header.includes('click')) newData.clicks = val;
            }
          });
          
          form.setValue("data", newData);
          toast({ title: "Data imported successfully", description: "Metrics have been populated from your CSV." });
        }
      } catch (err) {
        toast({ title: "Failed to parse CSV", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="ghost" size="icon" className="shrink-0" data-testid="button-back-reports">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Report Builder</h1>
            <p className="text-muted-foreground mt-1">Configure and generate a new client report.</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
              <CardDescription>Basic information about this report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <div className="flex gap-2">
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingClients}>
                          <FormControl>
                            <SelectTrigger className="flex-1" data-testid="select-report-client">
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients?.map((client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setIsClientDialogOpen(true)}
                          title="Add new client"
                          data-testid="button-add-client-inline"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Q3 Performance Report" {...field} data-testid="input-report-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dateRangeStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-report-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateRangeEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-report-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Metrics Data</CardTitle>
                <CardDescription>Enter the performance data for this reporting period.</CardDescription>
              </div>
              <div>
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  data-testid="input-csv-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-csv"
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Import CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="traffic" data-testid="tab-traffic">
                    <BarChart3 className="h-4 w-4 mr-2 hidden sm:block" /> Traffic
                  </TabsTrigger>
                  <TabsTrigger value="conversion" data-testid="tab-conversion">
                    <TrendingUp className="h-4 w-4 mr-2 hidden sm:block" /> Conversions
                  </TabsTrigger>
                  <TabsTrigger value="paid" data-testid="tab-paid">
                    <FileText className="h-4 w-4 mr-2 hidden sm:block" /> Paid Ads
                  </TabsTrigger>
                  <TabsTrigger value="audience" data-testid="tab-audience">
                    <Users className="h-4 w-4 mr-2 hidden sm:block" /> Audience
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="traffic" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="data.organicTraffic" render={({ field }) => (
                      <FormItem><FormLabel>Organic Traffic (Visitors)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="data.previousOrganicTraffic" render={({ field }) => (
                      <FormItem><FormLabel>Previous Period Organic Traffic</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="data.paidTraffic" render={({ field }) => (
                      <FormItem><FormLabel>Paid Traffic (Visitors)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                  </div>
                </TabsContent>
                
                <TabsContent value="conversion" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="data.conversions" render={({ field }) => (
                      <FormItem><FormLabel>Total Conversions / Leads</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="data.previousConversions" render={({ field }) => (
                      <FormItem><FormLabel>Previous Period Conversions</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="data.conversionRate" render={({ field }) => (
                      <FormItem><FormLabel>Conversion Rate (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.0" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                  </div>
                </TabsContent>
                
                <TabsContent value="paid" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="data.spend" render={({ field }) => (
                      <FormItem><FormLabel>Total Ad Spend ($)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="data.previousSpend" render={({ field }) => (
                      <FormItem><FormLabel>Previous Period Ad Spend ($)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="data.roas" render={({ field }) => (
                      <FormItem><FormLabel>ROAS (Return on Ad Spend)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.0" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="data.impressions" render={({ field }) => (
                      <FormItem><FormLabel>Ad Impressions</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="data.clicks" render={({ field }) => (
                      <FormItem><FormLabel>Ad Clicks</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="data.ctr" render={({ field }) => (
                      <FormItem><FormLabel>Click-Through Rate (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.0" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                  </div>
                </TabsContent>
                
                <TabsContent value="audience" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="data.socialFollowers" render={({ field }) => (
                      <FormItem><FormLabel>Social Media Followers</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="data.socialEngagement" render={({ field }) => (
                      <FormItem><FormLabel>Social Engagement Rate (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.0" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="data.emailSubscribers" render={({ field }) => (
                      <FormItem><FormLabel>Email Subscribers</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="data.emailOpenRate" render={({ field }) => (
                      <FormItem><FormLabel>Email Open Rate (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.0" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-8 pt-6 border-t">
                <FormField
                  control={form.control}
                  name="data.notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Executive Summary & Notes</FormLabel>
                      <CardDescription className="mb-2">Add your expert analysis, insights, and recommendations.</CardDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="This month we saw a 15% increase in organic traffic due to..." 
                          className="min-h-[150px] resize-y" 
                          {...field} 
                          value={field.value ?? ""}
                          data-testid="textarea-report-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-card p-4 w-full max-w-sm shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publish Report</FormLabel>
                    <FormDescription>
                      Make this report viewable via public link
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-publish-report"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex gap-4">
              <Link href="/reports">
                <Button variant="outline" type="button" data-testid="button-cancel-report">Cancel</Button>
              </Link>
              <Button type="submit" disabled={createReport.isPending} size="lg" data-testid="button-generate-report">
                {createReport.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Report
              </Button>
            </div>
          </div>
        </form>
      </Form>
      
      <ClientFormDialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen} />
    </div>
  );
}