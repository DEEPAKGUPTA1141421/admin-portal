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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORIES_DATA } from "@/lib/mock/generate";
import type { Category } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { toast } from "sonner";

// Simplification note: subcategories reuse the Category entity, seeded here with a
// synthetic parent so this page can manage the "sub" level of the same hierarchy
// used by /catalog/categories.
const PARENTS = CATEGORIES_DATA.slice(0, 6);
const SUBCATEGORIES_SEED: Category[] = CATEGORIES_DATA.slice(6).map((c, i) => ({
  ...c,
  id: `SUB-${i + 1}`,
  parentId: PARENTS[i % PARENTS.length].id,
}));

export default function SubcategoriesPage() {
  const [subs, setSubs] = useState<Category[]>(SUBCATEGORIES_SEED);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(PARENTS[0]?.id ?? "");

  function toggle(c: Category) {
    setSubs((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x)));
    toast.success(`${c.name} ${c.status === "active" ? "deactivated" : "activated"}`);
  }

  function addSub() {
    if (!name) { toast.error("Name is required"); return; }
    const sub: Category = {
      id: `SUB-NEW-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      parentId,
      productCount: 0,
      status: "active",
      image: `https://picsum.photos/seed/sub-${Date.now()}/200/200`,
    };
    setSubs((prev) => [sub, ...prev]);
    toast.success(`Subcategory "${name}" added`);
    setAddOpen(false);
    setName("");
  }

  const columns: ColumnDef<Category, unknown>[] = [
    { accessorKey: "name", header: "Subcategory" },
    {
      accessorKey: "parentId",
      header: "Parent Category",
      cell: ({ row }) => PARENTS.find((p) => p.id === row.original.parentId)?.name ?? "—",
    },
    { accessorKey: "productCount", header: "Products", cell: ({ row }) => formatNumber(row.original.productCount) },
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
            <DropdownMenuItem onClick={() => toggle(row.original)}>
              {row.original.status === "active" ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subcategories"
        description="Second-level category management, nested under a parent category"
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus /> Add Subcategory</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Subcategory</DialogTitle>
                <DialogDescription>Nested under a parent category.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Parent Category</Label>
                  <Select value={parentId} onValueChange={setParentId}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PARENTS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={addSub}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={columns} data={subs} searchKey="name" searchPlaceholder="Search subcategories..." exportName="subcategories" />
    </div>
  );
}
