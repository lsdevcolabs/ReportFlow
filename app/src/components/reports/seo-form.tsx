"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTemplate } from "@/lib/templates";
import { MetricFieldGrid, DynamicTable, NotesSection } from "./template-fields";
import type { TemplateFormProps, MetricsData } from "./template-fields";

const template = getTemplate("seo");

export function SeoForm({ metricsData, onChange, clientId, onGenerateAiSummary, isGeneratingSummary }: TemplateFormProps) {
  const set = (key: string, value: unknown) => {
    onChange({ ...metricsData, [key]: value });
  };

  const trafficTab = template.tabs[0];
  const keywordsTab = template.tabs[1];
  const technicalTab = template.tabs[2];
  const backlinksTab = template.tabs[3];
  const notesTab = template.tabs[4];

  const keywordRows = (metricsData.keywordRows as Record<string, unknown>[]) || [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="trafficVisibility">
        <div className="overflow-x-auto pb-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-full justify-start sm:w-auto h-auto min-w-max">
            {template.tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="trafficVisibility">
          <Card>
            <CardHeader>
              <CardTitle>{trafficTab.label}</CardTitle>
              <CardDescription>These feed the KPI hero cards at the top of the public report.</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricFieldGrid fields={trafficTab.fields!} values={metricsData} onChange={set} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywordRankings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyword Summary</CardTitle>
                <CardDescription>Summary of keyword ranking distribution.</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricFieldGrid fields={keywordsTab.fields!} values={metricsData} onChange={set} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Keyword Rankings</CardTitle>
                    <CardDescription>Add up to {keywordsTab.dynamicTable!.maxRows} keyword rows.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DynamicTable
                  columns={keywordsTab.dynamicTable!.columns}
                  rows={keywordRows}
                  maxRows={keywordsTab.dynamicTable!.maxRows}
                  onChange={(rows) => onChange({ ...metricsData, keywordRows: rows })}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technicalHealth">
          <Card>
            <CardHeader>
              <CardTitle>{technicalTab.label}</CardTitle>
              <CardDescription>Core Web Vitals, indexing, and site speed metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricFieldGrid fields={technicalTab.fields!} values={metricsData} onChange={set} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backlinks">
          <Card>
            <CardHeader>
              <CardTitle>{backlinksTab.label}</CardTitle>
              <CardDescription>Backlink profile and domain authority metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricFieldGrid fields={backlinksTab.fields!} values={metricsData} onChange={set} />
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
