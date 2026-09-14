"use client";

import { useState } from "react";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { RETURNS_DATA } from "@/lib/mock/generate";
import type { ReturnRequest } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function QualityInspectionPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>(() => RETURNS_DATA.filter((r) => r.status === "inspection"));
  const [inspecting, setInspecting] = useState<ReturnRequest | null>(null);
  const [result, setResult] = useState<"pass" | "fail">("pass");
  const [notes, setNotes] = useState("");

  function submitInspection() {
    if (!inspecting) return;
    setReturns((prev) => prev.filter((r) => r.id !== inspecting.id));
    if (result === "pass") {
      toast.success(`${inspecting.id} passed inspection — moved to refund initiation`);
    } else {
      toast.error(`${inspecting.id} failed inspection — return rejected`);
    }
    setInspecting(null);
    setNotes("");
    setResult("pass");
  }

  const columns: ColumnDef<ReturnRequest, unknown>[] = [
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image src={row.original.image} alt={row.original.productName} width={36} height={36} className="rounded-md object-cover" unoptimized />
          <div className="max-w-[200px] truncate font-medium">{row.original.productName}</div>
        </div>
      ),
    },
    { accessorKey: "orderNumber", header: "Order" },
    { accessorKey: "sellerName", header: "Seller" },
    { accessorKey: "reason", header: "Return Reason" },
    { accessorKey: "refundAmount", header: "Value", cell: ({ row }) => formatINR(row.original.refundAmount) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "requestedAt", header: "Received", cell: ({ row }) => formatDate(row.original.requestedAt) },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => setInspecting(row.original)}>
          <ClipboardCheck className="size-3.5" /> Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Quality Inspection" description={`${returns.length} returned items awaiting quality inspection`} />

      <DataTable
        columns={columns}
        data={returns}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="quality-inspection"
        emptyTitle="Nothing to inspect"
        emptyDescription="Items received at the warehouse for inspection will appear here."
      />

      <Dialog open={!!inspecting} onOpenChange={(v) => { if (!v) { setInspecting(null); setNotes(""); setResult("pass"); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inspect Return</DialogTitle>
            <DialogDescription>{inspecting?.productName} — Order {inspecting?.orderNumber}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Inspection Result</Label>
              <Select value={result} onValueChange={(v) => setResult(v as "pass" | "fail")}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">Pass — proceed to refund</SelectItem>
                  <SelectItem value="fail">Fail — reject return</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Inspection notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Condition of the item, packaging, accessories, etc." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInspecting(null)}>Cancel</Button>
            <Button onClick={submitInspection}>Submit Inspection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
