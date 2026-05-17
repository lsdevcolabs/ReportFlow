"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTemplate } from "@/lib/templates";
import { MetricFieldGrid, DynamicTable, NotesSection } from "./template-fields";
import type { TemplateFormProps, MetricsData } from "./template-fields";

const template = getTemplate("paidAds");

export function PaidAdsForm({ metricsData, onChange, clientId, onGenerateAiSummary, isGeneratingSummary }: TemplateFormProps) {
  const set = (key: string, value: unknown) => {
    onChange({ ...metricsData, [key]: value });
  };

  const overviewTab = template.tabs[0];
  const googleTab = template.tabs[1];
  const metaTab = template.tabs[2];
  const campaignsTab = template.tabs[3];
  const notesTab = template.tabs[4];

  const campaignRows = (metricsData.campaignRows as Record<string, unknown>[]) || [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap sm:grid sm:grid-cols-5 mb-6 h-auto">
          {template.tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>{overviewTab.label}</CardTitle>
              <CardDescription>Blended KPI hero cards across ALL ad platforms combined.</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricFieldGrid fields={overviewTab.fields!} values={metricsData} onChange={set} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="googleAds">
          <Card>
            <CardHeader>
              <CardTitle>{googleTab.label}</CardTitle>
              <CardDescription>Google Ads performance metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricFieldGrid fields={googleTab.fields!} values={metricsData} onChange={set} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metaAds">
          <Card>
            <CardHeader>
              <CardTitle>{metaTab.label}</CardTitle>
              <CardDescription>Facebook & Instagram ads performance metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricFieldGrid fields={metaTab.fields!} values={metricsData} onChange={set} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{campaignsTab.label}</CardTitle>
                  <CardDescription>
                    Add up to {campaignsTab.dynamicTable!.maxRows} campaign rows.
                    CPA and ROAS auto-calculate from Spend and Conversions if left blank.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DynamicTable
                columns={campaignsTab.dynamicTable!.columns}
                rows={campaignRows}
                maxRows={campaignsTab.dynamicTable!.maxRows}
                onChange={(rows) => onChange({ ...metricsData, campaignRows: rows })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <NotesSection
                fields={notesTab.fields!}
                values={metricsData}
                onChange={set}
                onGenerateAiSummary={onGenerateAiSummary}
                isGeneratingSummary={isGeneratingSummary}
                clientId={clientId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
