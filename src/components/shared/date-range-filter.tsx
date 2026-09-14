"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const DATE_PRESETS = [
  { value: "today", label: "Today", days: 1 },
  { value: "yesterday", label: "Yesterday", days: 1 },
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "year", label: "This year", days: 365 },
] as const;

export function DateRangeFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string, days: number) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        const preset = DATE_PRESETS.find((p) => p.value === v);
        onChange(v, preset?.days ?? 30);
      }}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DATE_PRESETS.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
