"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTemplate } from "@/lib/templates";
import { MetricFieldGrid, ChannelBreakdownEditor, NotesSection, DynamicTable } from "./template-fields";
import type { TemplateFormProps, MetricsData } from "./template-fields";

const template = getTemplate("general");

export function GeneralMarketingForm({ metricsData, onChange, clientId, onGenerateAiSummary, isGeneratingSummary }: TemplateFormProps) {
  const set = (key: string, value: unknown) => {
    onChange({ ...metricsData, [key]: value });
  };

  const overviewTab = template.tabs[0];
  const trafficTab = template.tabs[1];
  const conversionsTab = template.tabs[2];
  const channelsTab = template.tabs[3];
  const notesTab = template.tabs[4];

  const channels = (metricsData.channels as { name: string; sessions: number }[]) || [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <div className="overflow-x-auto pb-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-full justify-start sm:w-auto h-auto min-w-max">
            {template.tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>{overviewTab.label}</CardTitle>
              <CardDescription>These 4 fields appear as the hero KPI cards at the top of the public report.</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricFieldGrid fields={overviewTab.fields!} values={metricsData} onChange={set} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>{trafficTab.label}</CardTitle>
              <CardDescription>Traffic sources and visitor behavior metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricFieldGrid fields={trafficTab.fields!} values={metricsData} onChange={set} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions">
          <Card>
            <CardHeader>
              <CardTitle>{conversionsTab.label}</CardTitle>
              <CardDescription>Goal completions and conversion metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricFieldGrid fields={conversionsTab.fields!} values={metricsData} onChange={set} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <CardTitle>{channelsTab.label}</CardTitle>
              <CardDescription>Channel breakdown for the bar chart shown in the public report.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChannelBreakdownEditor
                channels={channels}
                defaultChannels={template.defaultChannels || []}
                onChange={(updated) => onChange({ ...metricsData, channels: updated })}
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
