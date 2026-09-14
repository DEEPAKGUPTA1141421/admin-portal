"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, FileMinus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import { toast } from "sonner";

type CreditNoteStatus = "issued" | "applied" | "void";

interface CreditNote {
  id: string;
  creditNoteNumber: string;
  relatedInvoice: string;
  sellerName: string;
  amount: number;
  reason: string;
  issuedAt: string;
  status: CreditNoteStatus;
}

const REASONS = ["Order cancelled post-invoice", "Pricing correction", "Damaged goods", "Duplicate billing", "Service not rendered"];
const SELLERS = ["Metro Traders", "Prime Retail", "Urban Mart", "Royal Bazaar", "Elite Enterprises", "Star Emporium"];

function daysAgoIso(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function buildCreditNotes(): CreditNote[] {
  const statuses: CreditNoteStatus[] = ["issued", "applied", "applied", "void", "issued"];
  return Array.from({ length: 13 }, (_, i) => ({
    id: `CN-ROW-${i + 1}`,
    creditNoteNumber: `CN-2025-${String(30 + i).padStart(4, "0")}`,
    relatedInvoice: `INV-2025-${String(100 + i * 2).padStart(4, "0")}`,
    sellerName: SELLERS[i % SELLERS.length],
    amount: 1200 + i * 850,
    reason: REASONS[i % REASONS.length],
    issuedAt: daysAgoIso(45 - i * 3),
    status: statuses[i % statuses.length],
  }));
}

export default function CreditNotesPage() {
  const [notes, setNotes] = useState<CreditNote[]>(() => buildCreditNotes());
  const [createOpen, setCreateOpen] = useState(false);
  const [sellerName, setSellerName] = useState("");
  const [relatedInvoice, setRelatedInvoice] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const kpis = useMemo(() => {
    const totalIssued = notes.reduce((s, n) => s + n.amount, 0);
    const applied = notes.filter((n) => n.status === "applied").length;
    const voided = notes.filter((n) => n.status === "void").length;
    return { total: notes.length, totalIssued, applied, voided };
  }, [notes]);

  function createNote() {
    const amt = Number(amount);
    if (!amt || !sellerName || !relatedInvoice || !reason) return;
    const note: CreditNote = {
      id: `CN-ROW-NEW-${Date.now()}`,
      creditNoteNumber: `CN-2025-${String(100 + notes.length).padStart(4, "0")}`,
      relatedInvoice,
      sellerName,
      amount: amt,
      reason,
      issuedAt: new Date().toISOString(),
      status: "issued",
    };
    setNotes((prev) => [note, ...prev]);
    toast.success(`Credit note ${note.creditNoteNumber} created`);
    setCreateOpen(false);
    setSellerName("");
    setRelatedInvoice("");
    setAmount("");
    setReason("");
  }

  const columns = useMemo<ColumnDef<CreditNote, unknown>[]>(
    () => [
      { accessorKey: "creditNoteNumber", header: "Credit Note #" },
      { accessorKey: "relatedInvoice", header: "Related Invoice" },
      { accessorKey: "sellerName", header: "Seller" },
      { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatINR(row.original.amount) },
      { accessorKey: "reason", header: "Reason" },
      { accessorKey: "issuedAt", header: "Issued", cell: ({ row }) => formatDate(row.original.issuedAt) },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Notes"
        description="Credit notes issued against seller and marketplace invoices"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Create Credit Note
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Credit Notes" value={formatNumber(kpis.total)} icon={FileMinus} />
        <KpiCard label="Total Issued Value" value={formatINR(kpis.totalIssued, true)} icon={FileMinus} tone="blue" />
        <KpiCard label="Applied" value={formatNumber(kpis.applied)} icon={FileMinus} tone="green" />
        <KpiCard label="Void" value={formatNumber(kpis.voided)} icon={FileMinus} />
      </div>

      <DataTable
        columns={columns}
        data={notes}
        searchKey="creditNoteNumber"
        searchPlaceholder="Search by credit note number..."
        exportName="credit-notes"
        emptyTitle="No credit notes found"
        emptyDescription="Try adjusting your search."
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Credit Note</DialogTitle>
            <DialogDescription>Issue a credit note against an existing invoice.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cn-seller">Seller Name</Label>
              <Input id="cn-seller" placeholder="e.g. Metro Traders" value={sellerName} onChange={(e) => setSellerName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cn-invoice">Related Invoice</Label>
              <Input id="cn-invoice" placeholder="e.g. INV-2025-0142" value={relatedInvoice} onChange={(e) => setRelatedInvoice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cn-amount">Amount (INR)</Label>
              <Input id="cn-amount" type="number" placeholder="e.g. 2500" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cn-reason">Reason</Label>
              <Textarea id="cn-reason" placeholder="e.g. Order cancelled post-invoice" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createNote} disabled={!amount || !sellerName || !relatedInvoice || !reason}>
              Create Credit Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
