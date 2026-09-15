"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { FileDown } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";

const ENTITIES = ["Orders", "Products", "Sellers", "Customers", "Payments"];
const FIELDS_BY_ENTITY: Record<string, string[]> = {
  Orders: ["Order Number", "Customer", "Amount", "Status", "Placed At"],
  Products: ["Name", "SKU", "Category", "Price", "Stock"],
  Sellers: ["Store Name", "Owner", "Status", "Revenue", "Rating"],
  Customers: ["Name", "Email", "Total Orders", "Total Spend"],
  Payments: ["Transaction ID", "Amount", "Method", "Status"],
};

interface RecentReport {
  id: string;
  name: string;
  generatedAt: string;
  format: string;
}

const INITIAL_REPORTS: RecentReport[] = [];

export default function CustomReportsPage() {
  const [preset, setPreset] = useState("30d");
  const [, setDays] = useState(30);
  const [entity, setEntity] = useState("Orders");
  const [fields, setFields] = useState<string[]>(FIELDS_BY_ENTITY.Orders);
  const [format, setFormat] = useState("CSV");
  const [reports, setReports] = useState<RecentReport[]>(INITIAL_REPORTS);

  function toggleField(f: string) {
    setFields((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  function generate() {
    const report: RecentReport = {
      id: `RPT-${reports.length + 1}`,
      name: `${entity} Report — ${new Date().toLocaleDateString("en-IN")}`,
      generatedAt: new Date().toISOString(),
      format,
    };
    setReports((prev) => [report, ...prev]);
    toast.success(`Report "${report.name}" generated`);
  }

  const columns: ColumnDef<RecentReport, unknown>[] = [
    { accessorKey: "name", header: "Report Name" },
    { accessorKey: "format", header: "Format" },
    { accessorKey: "generatedAt", header: "Generated At", cell: ({ row }) => formatDateTime(row.original.generatedAt) },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => toast.success(`Downloading ${row.original.name}`)}>
          <FileDown className="size-4" /> Download
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Custom Reports" description="Build and export custom marketplace reports" />

      <Card>
        <CardHeader>
          <CardTitle>Report Builder</CardTitle>
          <CardDescription>Select an entity, fields and format to generate a report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Entity</Label>
              <Select
                value={entity}
                onValueChange={(v) => {
                  setEntity(v);
                  setFields(FIELDS_BY_ENTITY[v]);
                }}
              >
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENTITIES.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date Range</Label>
              <DateRangeFilter value={preset} onChange={(v, d) => { setPreset(v); setDays(d); }} />
            </div>
            <div className="space-y-1.5">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSV">CSV</SelectItem>
                  <SelectItem value="Excel">Excel</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Fields to Include</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FIELDS_BY_ENTITY[entity].map((f) => (
                <label key={f} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={fields.includes(f)} onCheckedChange={() => toggleField(f)} />
                  {f}
                </label>
              ))}
            </div>
          </div>

          <Button onClick={generate}>Generate Report</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Reports</CardTitle></CardHeader>
        <CardContent>
          <DataTable columns={columns} data={reports} searchKey="name" searchPlaceholder="Search reports..." exportName="reports" />
        </CardContent>
      </Card>
    </div>
  );
}
