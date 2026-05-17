"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Sparkles, Loader2 } from "lucide-react";
import type { TemplateField, DynamicTableColumn } from "@/lib/templates";

// ─── Types ───

export interface MetricsData {
  [key: string]: unknown;
}

export interface TemplateFormProps {
  metricsData: MetricsData;
  onChange: (data: MetricsData) => void;
  clientId?: string;
  templateType: string;
  onGenerateAiSummary?: () => void;
  isGeneratingSummary?: boolean;
}

// ─── MetricField ───

interface MetricFieldProps {
  field: TemplateField;
  value: unknown;
  prevValue?: unknown;
  onChange: (key: string, value: unknown) => void;
  onPrevChange?: (key: string, value: unknown) => void;
}

function calculatePercentChange(current: number, previous: number): number | null {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function MetricField({ field, value, prevValue, onChange, onPrevChange }: MetricFieldProps) {
  const numValue = typeof value === "number" ? value : value ? Number(value) : null;
  const numPrevValue = typeof prevValue === "number" ? prevValue : prevValue ? Number(prevValue) : null;

  const percentChange =
    field.hasPreviousPeriod && numValue != null && numPrevValue != null
      ? calculatePercentChange(numValue, numPrevValue)
      : null;

  const getInputType = () => {
    if (field.type === "number" || field.type === "percentage" || field.type === "currency") return "number";
    return "text";
  };

  const getStep = () => {
    if (field.type === "percentage" || field.type === "currency") return "0.01";
    return undefined;
  };

  const getPlaceholder = () => {
    if (field.placeholder) return field.placeholder;
    if (field.type === "currency") return "0.00";
    if (field.type === "percentage") return "0.0";
    return "0";
  };

  const getPrefix = () => {
    if (field.type === "currency") return "$";
    return "";
  };

  const getSuffix = () => {
    if (field.unit) return field.unit;
    if (field.type === "percentage") return "%";
    return "";
  };

  return (
    <div className={`grid gap-4 ${field.hasPreviousPeriod ? "md:grid-cols-2" : ""}`}>
      <div className="space-y-2">
        <Label htmlFor={field.key}>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
          {field.unit && <span className="text-muted-foreground ml-1 text-xs">({field.unit})</span>}
        </Label>
        <div className="relative">
          {getPrefix() && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {getPrefix()}
            </span>
          )}
          <Input
            id={field.key}
            type={getInputType()}
            step={getStep()}
            placeholder={getPlaceholder()}
            className={`${getPrefix() ? "pl-7" : ""} ${getSuffix() && field.type !== "text" ? "pr-12" : ""}`}
            value={value != null ? String(value) : ""}
            onChange={(e) => {
              const raw = e.target.value.replace(/[$,%]/g, "");
              if (field.type === "number" || field.type === "percentage" || field.type === "currency") {
                onChange(field.key, raw === "" ? null : Number(raw));
              } else {
                onChange(field.key, e.target.value);
              }
            }}
          />
          {getSuffix() && field.type !== "text" && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {getSuffix()}
            </span>
          )}
        </div>
        {field.helperText && (
          <p className="text-xs text-muted-foreground">{field.helperText}</p>
        )}
      </div>

      {field.hasPreviousPeriod && (
        <div className="space-y-2">
          <Label htmlFor={`${field.key}_prev`}>Previous Period</Label>
          <Input
            id={`${field.key}_prev`}
            type="number"
            step={getStep()}
            placeholder="0"
            value={numPrevValue != null ? String(numPrevValue) : ""}
            onChange={(e) => {
              const raw = e.target.value.replace(/[$,%]/g, "");
              onPrevChange?.(`prev_${field.key}`, raw === "" ? null : Number(raw));
            }}
          />
          {percentChange !== null && (
            <Badge
              variant="outline"
              className={`text-xs ${
                percentChange > 0
                  ? "text-green-600 border-green-200 bg-green-50"
                  : percentChange < 0
                  ? "text-red-600 border-red-200 bg-red-50"
                  : "text-gray-500"
              }`}
            >
              {percentChange > 0 ? "+" : ""}
              {percentChange.toFixed(1)}%
              {percentChange > 0 ? " ▲" : percentChange < 0 ? " ▼" : ""}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MetricFieldGrid ───

interface MetricFieldGridProps {
  fields: TemplateField[];
  values: MetricsData;
  onChange: (key: string, value: unknown) => void;
}

export function MetricFieldGrid({ fields, values, onChange }: MetricFieldGridProps) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        if (field.type === "textarea") {
          return (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Textarea
                id={field.key}
                placeholder={field.helperText || ""}
                className="min-h-[100px]"
                value={(values[field.key] as string) || ""}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
              {field.helperText && (
                <p className="text-xs text-muted-foreground">{field.helperText}</p>
              )}
            </div>
          );
        }

        if (field.type === "select" && field.options) {
          return (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Select
                value={(values[field.key] as string) || ""}
                onValueChange={(v) => onChange(field.key, v)}
              >
                <SelectTrigger id={field.key}>
                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.helperText && (
                <p className="text-xs text-muted-foreground">{field.helperText}</p>
              )}
            </div>
          );
        }

        return (
          <MetricField
            key={field.key}
            field={field}
            value={values[field.key]}
            prevValue={values[`prev_${field.key}`]}
            onChange={onChange}
            onPrevChange={onChange}
          />
        );
      })}
    </div>
  );
}

// ─── DynamicTable ───

interface DynamicTableProps {
  columns: DynamicTableColumn[];
  rows: Record<string, unknown>[];
  maxRows: number;
  onChange: (rows: Record<string, unknown>[]) => void;
}

export function DynamicTable({ columns, rows, maxRows, onChange }: DynamicTableProps) {
  const addRow = () => {
    if (rows.length >= maxRows) return;
    const newRow: Record<string, unknown> = {};
    columns.forEach((col) => {
      newRow[col.key] = "";
    });
    onChange([...rows, newRow]);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const updateCell = (index: number, key: string, value: unknown) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [key]: value };

    // Auto-calculate CPA, ROAS, Engagement Rate
    const row = updated[index];
    columns.forEach((col) => {
      if (col.autoCalculate === "cpa") {
        const spend = Number(row.spend) || 0;
        const conversions = Number(row.conversions) || 0;
        if (spend > 0 && conversions > 0 && !row[col.key]) {
          updated[index] = { ...updated[index], [col.key]: +(spend / conversions).toFixed(2) };
        }
      }
      if (col.autoCalculate === "roas") {
        const spend = Number(row.spend) || 0;
        const revenue = Number(row.revenue) || 0;
        if (spend > 0 && revenue > 0 && !row[col.key]) {
          updated[index] = { ...updated[index], [col.key]: +(revenue / spend).toFixed(2) };
        }
      }
      if (col.autoCalculate === "engagementRate") {
        const engagements = Number(row.engagements) || 0;
        const reach = Number(row.reach) || 0;
        if (reach > 0 && engagements > 0 && !row[col.key]) {
          updated[index] = { ...updated[index], [col.key]: +((engagements / reach) * 100).toFixed(1) };
        }
      }
    });

    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {columns.map((col) => (
                <th key={col.key} className="text-left p-2 text-muted-foreground font-medium text-xs">
                  {col.label}
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b">
                {columns.map((col) => (
                  <td key={col.key} className="p-1">
                    {col.type === "select" && col.options ? (
                      <Select
                        value={(row[col.key] as string) || ""}
                        onValueChange={(v) => updateCell(rowIdx, col.key, v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {col.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={col.type === "number" ? "number" : "text"}
                        className="h-8 text-xs"
                        placeholder={col.type === "number" ? "0" : ""}
                        value={row[col.key] != null ? String(row[col.key]) : ""}
                        onChange={(e) => {
                          const val = col.type === "number"
                            ? e.target.value === "" ? "" : Number(e.target.value)
                            : e.target.value;
                          updateCell(rowIdx, col.key, val);
                        }}
                      />
                    )}
                  </td>
                ))}
                <td className="p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => removeRow(rowIdx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length < maxRows && (
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-3 w-3 mr-1" />
          Add Row ({rows.length}/{maxRows})
        </Button>
      )}
    </div>
  );
}

// ─── ChannelBreakdownEditor ───

interface ChannelBreakdownEditorProps {
  channels: { name: string; sessions: number }[];
  defaultChannels: { name: string }[];
  onChange: (channels: { name: string; sessions: number }[]) => void;
  maxRows?: number;
}

const CHANNEL_PRESETS = [
  "Organic Search", "Paid Search", "Direct", "Social Media",
  "Email", "Referral", "Display Ads", "Other",
];

export function ChannelBreakdownEditor({
  channels,
  defaultChannels,
  onChange,
  maxRows = 6,
}: ChannelBreakdownEditorProps) {
  const addChannel = () => {
    if (channels.length >= maxRows) return;
    onChange([...channels, { name: "", sessions: 0 }]);
  };

  const removeChannel = (index: number) => {
    onChange(channels.filter((_, i) => i !== index));
  };

  const updateChannel = (index: number, field: "name" | "sessions", value: unknown) => {
    const updated = [...channels];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {channels.map((ch, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Channel Name</Label>
            <Select
              value={ch.name}
              onValueChange={(v) => updateChannel(idx, "name", v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_PRESETS.map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {preset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sessions</Label>
            <Input
              type="number"
              className="h-9"
              placeholder="0"
              value={ch.sessions || ""}
              onChange={(e) => updateChannel(idx, "sessions", e.target.value ? Number(e.target.value) : 0)}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => removeChannel(idx)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
      {channels.length < maxRows && (
        <Button type="button" variant="outline" size="sm" onClick={addChannel}>
          <Plus className="h-3 w-3 mr-1" />
          Add Channel ({channels.length}/{maxRows})
        </Button>
      )}
    </div>
  );
}

// ─── PlatformToggleSection ───

interface PlatformToggleSectionProps {
  platforms: { id: string; label: string; fields: TemplateField[] }[];
  enabledPlatforms: Record<string, boolean>;
  values: MetricsData;
  onTogglePlatform: (platformId: string, enabled: boolean) => void;
  onChange: (key: string, value: unknown) => void;
}

export function PlatformToggleSection({
  platforms,
  enabledPlatforms,
  values,
  onTogglePlatform,
  onChange,
}: PlatformToggleSectionProps) {
  return (
    <div className="space-y-6">
      {/* Toggle chips */}
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => {
          const enabled = enabledPlatforms[platform.id] ?? false;
          return (
            <Button
              key={platform.id}
              type="button"
              variant={enabled ? "default" : "outline"}
              size="sm"
              onClick={() => onTogglePlatform(platform.id, !enabled)}
              className="rounded-full"
            >
              {platform.label}
              {enabled && " \u2713"}
            </Button>
          );
        })}
      </div>

      {/* Platform field sections */}
      {platforms.map((platform) => {
        if (!enabledPlatforms[platform.id]) return null;
        return (
          <div key={platform.id} className="rounded-lg border p-4 space-y-4">
            <h4 className="font-medium text-sm">{platform.label}</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {platform.fields.map((field) => (
                <MetricField
                  key={field.key}
                  field={field}
                  value={values[field.key]}
                  prevValue={values[`prev_${field.key}`]}
                  onChange={onChange}
                  onPrevChange={onChange}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── NotesSection ───

interface NotesSectionProps {
  fields: TemplateField[];
  values: MetricsData;
  onChange: (key: string, value: unknown) => void;
  onGenerateAiSummary?: () => void;
  isGeneratingSummary?: boolean;
  clientId?: string;
}

export function NotesSection({
  fields,
  values,
  onChange,
  onGenerateAiSummary,
  isGeneratingSummary,
  clientId,
}: NotesSectionProps) {
  return (
    <div className="space-y-4">
      {fields.map((field, idx) => {
        const isFirst = idx === 0;
        return (
          <div key={field.key} className="space-y-2">
            {isFirst && onGenerateAiSummary && (
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label htmlFor={field.key} className="text-base font-semibold">
                    {field.label}
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onGenerateAiSummary}
                  disabled={isGeneratingSummary || !clientId}
                >
                  {isGeneratingSummary ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
            )}
            {!isFirst && <Label htmlFor={field.key}>{field.label}</Label>}
            {isFirst ? (
              <Textarea
                id={field.key}
                placeholder={field.helperText || ""}
                className="min-h-[120px]"
                value={(values[field.key] as string) || ""}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
            ) : (
              <Textarea
                id={field.key}
                placeholder={field.helperText || ""}
                className="min-h-[80px]"
                value={(values[field.key] as string) || ""}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
