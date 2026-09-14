"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DISCOUNT_RULES, type DiscountRule } from "../_lib/mock";
import { toast } from "sonner";

function emptyForm(): Omit<DiscountRule, "id"> {
  return { name: "", appliesTo: "category", discountPct: 10, conditions: "", status: "active" };
}

export default function DiscountRulesPage() {
  const [rules, setRules] = useState<DiscountRule[]>(DISCOUNT_RULES);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountRule | null>(null);
  const [form, setForm] = useState<Omit<DiscountRule, "id">>(emptyForm());

  function startAdd() {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  }

  function startEdit(r: DiscountRule) {
    setEditing(r);
    setForm({ name: r.name, appliesTo: r.appliesTo, discountPct: r.discountPct, conditions: r.conditions, status: r.status });
    setOpen(true);
  }

  function save() {
    if (!form.name.trim()) {
      toast.error("Rule name is required");
      return;
    }
    if (editing) {
      setRules((prev) => prev.map((r) => (r.id === editing.id ? { ...editing, ...form } : r)));
      toast.success(`Rule "${form.name}" updated`);
    } else {
      setRules((prev) => [{ id: `DR-NEW-${Date.now()}`, ...form }, ...prev]);
      toast.success(`Rule "${form.name}" created`);
    }
    setOpen(false);
  }

  const columns: ColumnDef<DiscountRule, unknown>[] = [
    { accessorKey: "name", header: "Rule Name" },
    { accessorKey: "appliesTo", header: "Applies To", cell: ({ row }) => <span className="capitalize">{row.original.appliesTo}</span> },
    { accessorKey: "discountPct", header: "Discount", cell: ({ row }) => `${row.original.discountPct}%` },
    { accessorKey: "conditions", header: "Conditions" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => startEdit(row.original)}>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discount Rules"
        description={`${rules.length} automated discount rules configured`}
        actions={<Button size="sm" onClick={startAdd}><Plus /> Add Rule</Button>}
      />

      <DataTable
        columns={columns}
        data={rules}
        searchKey="name"
        searchPlaceholder="Search rules..."
        exportName="discount-rules"
        emptyTitle="No discount rules"
        emptyDescription="Create a rule to automatically discount products, categories or sellers."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Discount Rule" : "Add Discount Rule"}</DialogTitle>
            <DialogDescription>Define conditions under which this discount is automatically applied.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Rule Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Applies To</Label>
                <Select value={form.appliesTo} onValueChange={(v) => setForm({ ...form, appliesTo: v as DiscountRule["appliesTo"] })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Discount %</Label>
                <Input type="number" value={form.discountPct} onChange={(e) => setForm({ ...form, discountPct: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Conditions</Label>
              <Input value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} placeholder="e.g. Category = Electronics" />
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as DiscountRule["status"] })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Create Rule"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
