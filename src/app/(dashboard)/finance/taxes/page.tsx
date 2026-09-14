"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Receipt } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { Button } from "@/components/ui/button";
import { formatINR, formatNumber } from "@/lib/format";
import { toast } from "sonner";

interface TaxRow {
  id: string;
  period: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
}

function buildTaxRows(): TaxRow[] {
  const months = [
    "Jul 2024", "Aug 2024", "Sep 2024", "Oct 2024", "Nov 2024", "Dec 2024",
    "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025", "Jun 2025", "Jul 2025",
  ];
  return months.map((period, i) => {
    const taxableAmount = 800000 + i * 65000 + (i % 3) * 40000;
    const cgst = Math.round(taxableAmount * 0.09);
    const sgst = Math.round(taxableAmount * 0.09);
    const igst = Math.round(taxableAmount * 0.05);
    return { id: `TAX-${i + 1}`, period, taxableAmount, cgst, sgst, igst };
  });
}

export default function TaxesPage() {
  const [rows] = useState<TaxRow[]>(() => buildTaxRows());

  const kpis = useMemo(() => {
    const totalTaxable = rows.reduce((s, r) => s + r.taxableAmount, 0);
    const totalTax = rows.reduce((s, r) => s + r.cgst + r.sgst + r.igst, 0);
    return { totalTaxable, totalTax, periods: rows.length };
  }, [rows]);

  const columns = useMemo<ColumnDef<TaxRow, unknown>[]>(
    () => [
      { accessorKey: "period", header: "Period" },
      { accessorKey: "taxableAmount", header: "Taxable Amount", cell: ({ row }) => formatINR(row.original.taxableAmount) },
      { accessorKey: "cgst", header: "CGST", cell: ({ row }) => formatINR(row.original.cgst) },
      { accessorKey: "sgst", header: "SGST", cell: ({ row }) => formatINR(row.original.sgst) },
      { accessorKey: "igst", header: "IGST", cell: ({ row }) => formatINR(row.original.igst) },
      {
        id: "totalTax",
        header: "Total Tax",
        accessorFn: (row) => row.cgst + row.sgst + row.igst,
        cell: ({ row }) => formatINR(row.original.cgst + row.original.sgst + row.original.igst),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success(`Tax report for ${row.original.period} is downloading...`)}
          >
            <Download className="size-4" /> Download
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Taxes" description="GST summary across settlement periods (CGST, SGST, IGST)" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Periods Tracked" value={formatNumber(kpis.periods)} icon={Receipt} />
        <KpiCard label="Total Taxable Amount" value={formatINR(kpis.totalTaxable, true)} icon={Receipt} tone="blue" />
        <KpiCard label="Total Tax Collected" value={formatINR(kpis.totalTax, true)} icon={Receipt} tone="green" />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        searchKey="period"
        searchPlaceholder="Search by period..."
        exportName="taxes"
        emptyTitle="No tax records found"
        emptyDescription="Try adjusting your search."
      />
    </div>
  );
}
