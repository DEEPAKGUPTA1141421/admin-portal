"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface AttributeSet {
  id: string;
  name: string;
  category: string;
  attributes: string[];
  status: "active" | "inactive";
  productCount: number;
}

const ALL_ATTRS = ["Color", "Size", "Material", "Storage", "RAM", "Weight", "Warranty", "Pattern", "Fit", "Flavor", "Battery Life", "Screen Size"];

const SEED: AttributeSet[] = [
  { id: "AS-1", name: "Apparel — Standard", category: "Fashion", attributes: ["Color", "Size", "Material", "Fit", "Pattern"], status: "active", productCount: 210 },
  { id: "AS-2", name: "Smartphones", category: "Electronics", attributes: ["Color", "Storage", "RAM", "Warranty", "Screen Size"], status: "active", productCount: 58 },
  { id: "AS-3", name: "Footwear", category: "Fashion", attributes: ["Color", "Size", "Material"], status: "active", productCount: 87 },
  { id: "AS-4", name: "Home Appliances", category: "Home", attributes: ["Color", "Warranty", "Weight"], status: "active", productCount: 64 },
  { id: "AS-5", name: "Groceries — Packaged", category: "Grocery", attributes: ["Flavor", "Weight"], status: "active", productCount: 46 },
  { id: "AS-6", name: "Wearables", category: "Electronics", attributes: ["Color", "Battery Life", "Warranty"], status: "inactive", productCount: 19 },
];

export default function AttributeSetsPage() {
  const [sets, setSets] = useState<AttributeSet[]>(SEED);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [selectedAttrs, setSelectedAttrs] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<AttributeSet | null>(null);

  function addSet() {
    if (!name || selectedAttrs.length === 0) { toast.error("Name and at least one attribute are required"); return; }
    const set: AttributeSet = {
      id: `AS-NEW-${Date.now()}`, name, category: category || "General",
      attributes: selectedAttrs, status: "active", productCount: 0,
    };
    setSets((prev) => [set, ...prev]);
    toast.success(`Attribute set "${name}" created`);
    setAddOpen(false);
    setName(""); setCategory(""); setSelectedAttrs([]);
  }

  function remove() {
    if (!deleteTarget) return;
    setSets((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.name}" deleted`);
    setDeleteTarget(null);
  }

  const columns: ColumnDef<AttributeSet, unknown>[] = [
    { accessorKey: "name", header: "Attribute Set" },
    { accessorKey: "category", header: "Category" },
    {
      accessorKey: "attributes",
      header: "Attributes",
      cell: ({ row }) => (
        <div className="flex max-w-sm flex-wrap gap-1">
          {row.original.attributes.map((a) => <Badge key={a} variant="secondary">{a}</Badge>)}
        </div>
      ),
    },
    { accessorKey: "productCount", header: "Products" },
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
            <DropdownMenuItem onClick={() => toast.success(`Edit form opened for ${row.original.name}`)}>Edit</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSets((prev) => prev.map((s) => (s.id === row.original.id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s)))}
            >
              {row.original.status === "active" ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attribute Sets"
        description={`${sets.length} attribute sets grouping attributes for specific product types`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus /> Add Attribute Set</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Attribute Set</DialogTitle>
                <DialogDescription>Group multiple attributes to apply together to a product type.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Category</Label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Electronics" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Attributes</Label>
                  <div className="grid grid-cols-2 gap-2 rounded-md border p-2">
                    {ALL_ATTRS.map((a) => (
                      <label key={a} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selectedAttrs.includes(a)}
                          onCheckedChange={(v) =>
                            setSelectedAttrs((prev) => (v ? [...prev, a] : prev.filter((x) => x !== a)))
                          }
                        />
                        {a}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={addSet}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={columns} data={sets} searchKey="name" searchPlaceholder="Search attribute sets..." exportName="attribute-sets" />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete attribute set?</AlertDialogTitle>
            <AlertDialogDescription>&quot;{deleteTarget?.name}&quot; will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
