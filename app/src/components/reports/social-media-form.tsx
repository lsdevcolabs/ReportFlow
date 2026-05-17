"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTemplate } from "@/lib/templates";
import { MetricFieldGrid, DynamicTable, PlatformToggleSection, NotesSection } from "./template-fields";
import type { TemplateFormProps, MetricsData } from "./template-fields";

const template = getTemplate("socialMedia");

export function SocialMediaForm({ metricsData, onChange, clientId, onGenerateAiSummary, isGeneratingSummary }: TemplateFormProps) {
  const set = (key: string, value: unknown) => {
    onChange({ ...metricsData, [key]: value });
  };

  const overviewTab = template.tabs[0];
  const platformTab = template.tabs[1];
  const contentTab = template.tabs[2];
  const audienceTab = template.tabs[3];
  const notesTab = template.tabs[4];

  // Platform toggle state
  const platformsConfig = platformTab.platformToggle!;
  const enabledPlatforms = (metricsData.enabledPlatforms as Record<string, boolean>) ||
    Object.fromEntries(platformsConfig.defaultEnabled.map((id) => [id, true]));

  const handleTogglePlatform = (platformId: string, enabled: boolean) => {
    onChange({
      ...metricsData,
      enabledPlatforms: { ...enabledPlatforms, [platformId]: enabled },
    });
  };

  const contentRows = (metricsData.contentRows as Record<string, unknown>[]) || [];

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
              <CardDescription>Blended performance across all social platforms.</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricFieldGrid fields={overviewTab.fields!} values={metricsData} onChange={set} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platformMetrics">
          <Card>
            <CardHeader>
              <CardTitle>{platformTab.label}</CardTitle>
              <CardDescription>Toggle on the platforms you manage for this client. Only enabled platforms show their fields.</CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformToggleSection
                platforms={platformsConfig.platforms}
                enabledPlatforms={enabledPlatforms}
                values={metricsData}
                onTogglePlatform={handleTogglePlatform}
                onChange={set}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contentPerformance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Summary</CardTitle>
                <CardDescription>Summary of content performance this period.</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricFieldGrid fields={contentTab.fields!} values={metricsData} onChange={set} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Top Performing Posts</CardTitle>
                    <CardDescription>Add up to {contentTab.dynamicTable!.maxRows} posts.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DynamicTable
                  columns={contentTab.dynamicTable!.columns}
                  rows={contentRows}
                  maxRows={contentTab.dynamicTable!.maxRows}
                  onChange={(rows) => onChange({ ...metricsData, contentRows: rows })}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audienceGrowth">
          <Card>
            <CardHeader>
              <CardTitle>{audienceTab.label}</CardTitle>
              <CardDescription>Audience demographics and growth metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricFieldGrid fields={audienceTab.fields!} values={metricsData} onChange={set} />
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
