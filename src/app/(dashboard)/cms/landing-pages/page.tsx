"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";

type LandingStatus = "draft" | "published" | "archived";

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  status: LandingStatus;
  lastEditedAt: string;
  heroHeadline: string;
  bodyCopy: string;
}

function daysAgoIso(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const LANDING_PAGES_SEED: LandingPage[] = [];

const emptyForm = { title: "", slug: "", status: "draft" as LandingStatus, heroHeadline: "", bodyCopy: "" };

export default function LandingPagesPage() {
  const [pages, setPages] = useState<LandingPage[]>(LANDING_PAGES_SEED);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LandingPage | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [previewTarget, setPreviewTarget] = useState<LandingPage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LandingPage | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(p: LandingPage) {
    setEditing(p);
    setForm({ title: p.title, slug: p.slug, status: p.status, heroHeadline: p.heroHeadline, bodyCopy: p.bodyCopy });
    setFormOpen(true);
  }

  function save() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const slug = form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (editing) {
      setPages((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...form, slug, lastEditedAt: new Date().toISOString() } : p)));
      toast.success(`"${form.title}" updated`);
    } else {
      const page: LandingPage = { id: `LP-${Date.now()}`, ...form, slug, lastEditedAt: new Date().toISOString() };
      setPages((prev) => [page, ...prev]);
      toast.success(`"${form.title}" created`);
    }
    setFormOpen(false);
  }

  function remove() {
    if (!deleteTarget) return;
    setPages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.title}" deleted`);
    setDeleteTarget(null);
  }

  const columns: ColumnDef<LandingPage, unknown>[] = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "slug", header: "Slug", cell: ({ row }) => <span className="text-muted-foreground">/{row.original.slug}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "lastEditedAt", header: "Last Edited", cell: ({ row }) => formatDateTime(row.original.lastEditedAt) },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setPreviewTarget(row.original)}><Eye className="size-4" /> Preview</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="size-4" /> Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}><Trash2 className="size-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Landing Pages"
        description="Create and manage campaign landing pages"
        actions={<Button size="sm" onClick={openCreate}><Plus className="size-4" /> Create Landing Page</Button>}
      />

      <DataTable
        columns={columns}
        data={pages}
        searchKey="title"
        searchPlaceholder="Search landing pages..."
        exportName="landing-pages"
        emptyTitle="No landing pages found"
        emptyDescription="Create your first landing page to get started."
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Landing Page" : "Create Landing Page"}</DialogTitle>
            <DialogDescription>Configure the page metadata and hero content.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label>Slug</Label>
              <Input placeholder="auto-generated from title" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as LandingStatus }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Hero Headline</Label>
              <Input value={form.heroHeadline} onChange={(e) => setForm((f) => ({ ...f, heroHeadline: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label>Body Copy</Label>
              <Input value={form.bodyCopy} onChange={(e) => setForm((f) => ({ ...f, bodyCopy: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewTarget} onOpenChange={(o) => !o && setPreviewTarget(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview — /{previewTarget?.slug}</DialogTitle>
            <DialogDescription>Mock rendering of the landing page.</DialogDescription>
          </DialogHeader>
          {previewTarget && (
            <div className="space-y-4 rounded-lg border p-6">
              <div className="rounded-lg bg-gradient-to-r from-primary/20 to-primary/5 p-8 text-center">
                <h2 className="text-2xl font-bold">{previewTarget.heroHeadline}</h2>
                <p className="mt-2 text-muted-foreground">{previewTarget.bodyCopy}</p>
                <Button className="mt-4">Shop Now</Button>
              </div>
              <StatusBadge status={previewTarget.status} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this landing page?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be permanently deleted and any links to it will break.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
