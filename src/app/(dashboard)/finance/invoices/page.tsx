"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Plus, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import { toast } from "sonner";

type InvoiceStatus = "draft" | "issued" | "paid" | "overdue";

interface Invoice {
  id: string;
  invoiceNumber: string;
  sellerName: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
}

const SELLER_OPTIONS = [
  "Marketplace", "Metro Traders", "Prime Retail", "Urban Mart", "Royal Bazaar",
  "Elite Enterprises", "Star Emporium", "Global Store",
];

function daysAgoIso(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function daysAheadIso(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function buildInvoices(): Invoice[] {
  const statuses: InvoiceStatus[] = ["draft", "issued", "issued", "paid", "paid", "paid", "overdue"];
  return Array.from({ length: 18 }, (_, i) => {
    const status = statuses[i % statuses.length];
    return {
      id: `INV-ROW-${i + 1}`,
      invoiceNumber: `INV-2025-${String(100 + i).padStart(4, "0")}`,
      sellerName: SELLER_OPTIONS[i % SELLER_OPTIONS.length],
      amount: 5000 + i * 3250,
      status,
      issuedAt: daysAgoIso(60 - i * 2),
      dueAt: status === "overdue" ? daysAgoIso(5) : daysAheadIso(15),
    };
  });
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(() => buildInvoices());
  const [createOpen, setCreateOpen] = useState(false);
  const [seller, setSeller] = useState("Marketplace");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const kpis = useMemo(() => {
    const totalOutstanding = invoices
      .filter((i) => i.status === "issued" || i.status === "overdue")
      .reduce((s, i) => s + i.amount, 0);
    const overdueCount = invoices.filter((i) => i.status === "overdue").length;
    const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
    return { total: invoices.length, totalOutstanding, overdueCount, totalPaid };
  }, [invoices]);

  function createInvoice() {
    const amt = Number(amount);
    if (!amt || !dueDate) return;
    const invoice: Invoice = {
      id: `INV-ROW-NEW-${Date.now()}`,
      invoiceNumber: `INV-2025-${String(1000 + invoices.length).padStart(4, "0")}`,
      sellerName: seller,
      amount: amt,
      status: "draft",
      issuedAt: new Date().toISOString(),
      dueAt: new Date(dueDate).toISOString(),
    };
    setInvoices((prev) => [invoice, ...prev]);
    toast.success(`Invoice ${invoice.invoiceNumber} created`);
    setCreateOpen(false);
    setAmount("");
    setDueDate("");
    setSeller("Marketplace");
  }

  const columns = useMemo<ColumnDef<Invoice, unknown>[]>(
    () => [
      { accessorKey: "invoiceNumber", header: "Invoice #" },
      { accessorKey: "sellerName", header: "Seller" },
      { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatINR(row.original.amount) },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: "issuedAt", header: "Issued", cell: ({ row }) => formatDate(row.original.issuedAt) },
      { accessorKey: "dueAt", header: "Due", cell: ({ row }) => formatDate(row.original.dueAt) },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success(`Downloading PDF for ${row.original.invoiceNumber}...`)}
          >
            <Download className="size-4" /> PDF
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Marketplace and seller invoices"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Create Invoice
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Invoices" value={formatNumber(kpis.total)} icon={FileText} />
        <KpiCard label="Outstanding" value={formatINR(kpis.totalOutstanding, true)} icon={FileText} tone="orange" />
        <KpiCard label="Overdue" value={formatNumber(kpis.overdueCount)} icon={FileText} tone="red" />
        <KpiCard label="Total Paid" value={formatINR(kpis.totalPaid, true)} icon={FileText} tone="green" />
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchKey="invoiceNumber"
        searchPlaceholder="Search by invoice number..."
        exportName="invoices"
        emptyTitle="No invoices found"
        emptyDescription="Try adjusting your search."
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>Issue a new invoice to a seller or the marketplace.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Seller</Label>
              <Select value={seller} onValueChange={setSeller}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SELLER_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-amount">Amount (INR)</Label>
              <Input
                id="invoice-amount"
                type="number"
                placeholder="e.g. 15000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-due">Due Date</Label>
              <Input id="invoice-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createInvoice} disabled={!amount || !dueDate}>
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
