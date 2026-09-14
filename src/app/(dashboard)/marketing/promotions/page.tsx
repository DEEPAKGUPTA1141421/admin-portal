"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { PROMOTIONS, type Promotion } from "../_lib/mock";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

function emptyForm(): Omit<Promotion, "id"> {
  return {
    name: "", type: "site_wide", targetAudience: "", status: "scheduled",
    startDate: new Date().toISOString(), endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
  };
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>(PROMOTIONS);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Promotion, "id">>(emptyForm());

  function addPromotion() {
    if (!form.name.trim()) {
      toast.error("Promotion name is required");
      return;
    }
    setPromotions((prev) => [{ id: `PRM-NEW-${Date.now()}`, ...form }, ...prev]);
    toast.success(`Promotion "${form.name}" created`);
    setForm(emptyForm());
    setOpen(false);
  }

  const columns: ColumnDef<Promotion, unknown>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <span className="capitalize">{row.original.type.replace(/_/g, " ")}</span> },
    { accessorKey: "targetAudience", header: "Target Audience" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "startDate", header: "Start", cell: ({ row }) => formatDate(row.original.startDate) },
    { accessorKey: "endDate", header: "End", cell: ({ row }) => formatDate(row.original.endDate) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions"
        description={`${promotions.length} general marketplace promotions`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus /> Add Promotion</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Promotion</DialogTitle>
                <DialogDescription>Set up a general marketplace promotion targeting a specific audience.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Promotion["type"] })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="site_wide">Site-wide</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                        <SelectItem value="customer_segment">Customer Segment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Target Audience</Label>
                    <Input value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} placeholder="e.g. VIP customers" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={addPromotion}>Create Promotion</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={promotions}
        searchKey="name"
        searchPlaceholder="Search promotions..."
        exportName="promotions"
        emptyTitle="No promotions"
        emptyDescription="Create a promotion to run marketplace-wide campaigns."
      />
    </div>
  );
}
