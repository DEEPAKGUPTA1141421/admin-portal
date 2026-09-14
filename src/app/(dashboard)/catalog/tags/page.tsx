"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface Tag {
  id: string;
  name: string;
  color: string;
  productCount: number;
}

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

const SEED: Tag[] = [
  { id: "TAG-1", name: "Trending", color: "#ef4444", productCount: 74 },
  { id: "TAG-2", name: "New Arrival", color: "#3b82f6", productCount: 92 },
  { id: "TAG-3", name: "Best Seller", color: "#10b981", productCount: 61 },
  { id: "TAG-4", name: "Limited Stock", color: "#f59e0b", productCount: 28 },
  { id: "TAG-5", name: "Eco-Friendly", color: "#22c55e", productCount: 33 },
  { id: "TAG-6", name: "Premium", color: "#8b5cf6", productCount: 19 },
  { id: "TAG-7", name: "Clearance", color: "#ec4899", productCount: 45 },
  { id: "TAG-8", name: "Editor's Pick", color: "#06b6d4", productCount: 12 },
  { id: "TAG-9", name: "Award Winning", color: "#eab308", productCount: 8 },
  { id: "TAG-10", name: "Made in India", color: "#f97316", productCount: 56 },
];

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>(SEED);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

  function addTag() {
    if (!name) { toast.error("Name is required"); return; }
    const tag: Tag = { id: `TAG-NEW-${Date.now()}`, name, color, productCount: 0 };
    setTags((prev) => [tag, ...prev]);
    toast.success(`Tag "${name}" created`);
    setAddOpen(false);
    setName("");
  }

  function remove() {
    if (!deleteTarget) return;
    setTags((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    toast.success(`Tag "${deleteTarget.name}" deleted`);
    setDeleteTarget(null);
  }

  const columns: ColumnDef<Tag, unknown>[] = [
    {
      accessorKey: "name",
      header: "Tag",
      cell: ({ row }) => (
        <Badge style={{ backgroundColor: `${row.original.color}1a`, color: row.original.color, borderColor: `${row.original.color}40` }} variant="outline">
          {row.original.name}
        </Badge>
      ),
    },
    { accessorKey: "productCount", header: "Products" },
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
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tags"
        description={`${tags.length} product tags used for merchandising and search`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus /> Add Tag</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Tag</DialogTitle>
                <DialogDescription>Create a new product tag.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="size-7 rounded-full border-2"
                        style={{ backgroundColor: c, borderColor: color === c ? "var(--foreground)" : "transparent" }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={addTag}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={columns} data={tags} searchKey="name" searchPlaceholder="Search tags..." exportName="tags" />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag?</AlertDialogTitle>
            <AlertDialogDescription>&quot;{deleteTarget?.name}&quot; will be removed from all tagged products.</AlertDialogDescription>
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
