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
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COUPONS_DATA } from "@/lib/mock/generate";
import type { Coupon } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/format";
import { toast } from "sonner";

function emptyForm() {
  return {
    code: "", discountType: "percentage" as Coupon["discountType"], discountValue: "", minOrder: "",
    maxDiscount: "", usageLimit: "", perCustomerLimit: "1", startDate: "", endDate: "",
  };
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(COUPONS_DATA);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [disabling, setDisabling] = useState<Coupon | null>(null);

  function createCoupon() {
    if (!form.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    const c: Coupon = {
      id: `CPN-NEW-${Date.now()}`,
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue) || 10,
      minOrder: Number(form.minOrder) || 0,
      maxDiscount: Number(form.maxDiscount) || 0,
      usageLimit: Number(form.usageLimit) || 1000,
      usedCount: 0,
      perCustomerLimit: Number(form.perCustomerLimit) || 1,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
      status: "scheduled",
    };
    setCoupons((prev) => [c, ...prev]);
    toast.success(`Coupon "${c.code}" created`);
    setAddOpen(false);
    setForm(emptyForm());
  }

  function disableCoupon() {
    if (!disabling) return;
    setCoupons((prev) => prev.map((c) => (c.id === disabling.id ? { ...c, status: "disabled" } : c)));
    toast.success(`Coupon "${disabling.code}" disabled`);
    setDisabling(null);
  }

  function duplicateCoupon(c: Coupon) {
    const copy: Coupon = { ...c, id: `CPN-COPY-${Date.now()}`, code: `${c.code}-COPY`, usedCount: 0, status: "disabled" };
    setCoupons((prev) => [copy, ...prev]);
    toast.success(`Duplicated as "${copy.code}"`);
  }

  const columns: ColumnDef<Coupon, unknown>[] = [
    { accessorKey: "code", header: "Code", cell: ({ row }) => <span className="font-mono font-medium">{row.original.code}</span> },
    { accessorKey: "discountType", header: "Type", cell: ({ row }) => <span className="capitalize">{row.original.discountType.replace(/_/g, " ")}</span> },
    {
      accessorKey: "discountValue",
      header: "Value",
      cell: ({ row }) => (row.original.discountType === "percentage" ? `${row.original.discountValue}%` : row.original.discountType === "fixed" ? formatINR(row.original.discountValue) : "Free shipping"),
    },
    { accessorKey: "minOrder", header: "Min Order", cell: ({ row }) => formatINR(row.original.minOrder) },
    { accessorKey: "maxDiscount", header: "Max Discount", cell: ({ row }) => formatINR(row.original.maxDiscount) },
    {
      accessorKey: "usedCount",
      header: "Usage",
      cell: ({ row }) => {
        const pct = Math.min(100, Math.round((row.original.usedCount / row.original.usageLimit) * 100));
        return (
          <div className="w-32">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>{row.original.usedCount}</span>
              <span>{row.original.usageLimit}</span>
            </div>
            <Progress value={pct} />
          </div>
        );
      },
    },
    { accessorKey: "startDate", header: "Start", cell: ({ row }) => formatDate(row.original.startDate) },
    { accessorKey: "endDate", header: "End", cell: ({ row }) => formatDate(row.original.endDate) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => {
        const c = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(c)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateCoupon(c)}>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" disabled={c.status === "disabled"} onClick={() => setDisabling(c)}>Disable</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons"
        description={`${coupons.length} coupons configured across the marketplace`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus /> Create Coupon</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Coupon</DialogTitle>
                <DialogDescription>Define a new discount coupon for customers to apply at checkout.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Code</Label>
                    <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SAVE20" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Discount Type</Label>
                    <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v as Coupon["discountType"] })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="free_shipping">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Discount Value</Label>
                    <Input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder="20" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Max Discount (₹)</Label>
                    <Input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Min Order (₹)</Label>
                    <Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} placeholder="999" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Usage Limit</Label>
                    <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="1000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Per Customer Limit</Label>
                    <Input type="number" value={form.perCustomerLimit} onChange={(e) => setForm({ ...form, perCustomerLimit: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Start Date</Label>
                    <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>End Date</Label>
                    <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={createCoupon}>Create Coupon</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={coupons}
        searchKey="code"
        searchPlaceholder="Search by coupon code..."
        exportName="coupons"
        emptyTitle="No coupons found"
        emptyDescription="Create a coupon to offer discounts at checkout."
      />

      <AlertDialog open={!!disabling} onOpenChange={(v) => !v && setDisabling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              Coupon &quot;{disabling?.code}&quot; will no longer be usable at checkout. This can be re-enabled later by editing it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={disableCoupon}>Disable</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>Update coupon &quot;{editing?.code}&quot;.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Code</Label>
                <Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Discount Value</Label>
                  <Input type="number" value={editing.discountValue} onChange={(e) => setEditing({ ...editing, discountValue: Number(e.target.value) })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Usage Limit</Label>
                  <Input type="number" value={editing.usageLimit} onChange={(e) => setEditing({ ...editing, usageLimit: Number(e.target.value) })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!editing) return;
                setCoupons((prev) => prev.map((c) => (c.id === editing.id ? editing : c)));
                toast.success(`Coupon "${editing.code}" updated`);
                setEditing(null);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
