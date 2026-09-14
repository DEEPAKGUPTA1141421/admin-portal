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
import { Textarea } from "@/components/ui/textarea";
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
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

type BlogStatus = "draft" | "published";

interface BlogPost {
  id: string;
  title: string;
  author: string;
  status: BlogStatus;
  publishedAt: string | null;
  category: string;
  content: string;
}

function daysAgoIso(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const BLOG_POSTS_SEED: BlogPost[] = [
  { id: "BLG-1", title: "10 Festive Fashion Trends This Diwali", author: "Ritu Sharma", status: "published", publishedAt: daysAgoIso(3), category: "Fashion", content: "Discover the top festive fashion trends to elevate your Diwali celebrations this year..." },
  { id: "BLG-2", title: "How to Choose the Right Laptop for Work", author: "Karan Mehta", status: "published", publishedAt: daysAgoIso(10), category: "Electronics", content: "A comprehensive guide to picking the perfect laptop based on your workflow and budget..." },
  { id: "BLG-3", title: "Monsoon Home Essentials Checklist", author: "Sneha Iyer", status: "draft", publishedAt: null, category: "Home & Living", content: "Get your home ready for the monsoon season with these must-have essentials..." },
  { id: "BLG-4", title: "Skincare Routine for Every Season", author: "Ayesha Khan", status: "published", publishedAt: daysAgoIso(20), category: "Beauty", content: "Adapt your skincare routine throughout the year with these expert tips..." },
  { id: "BLG-5", title: "Seller Success Story: Metro Traders", author: "Vikas Rao", status: "published", publishedAt: daysAgoIso(15), category: "Seller Stories", content: "How Metro Traders grew their revenue 3x in one year on our marketplace..." },
  { id: "BLG-6", title: "Top 5 Smartphones Under ₹20,000", author: "Karan Mehta", status: "draft", publishedAt: null, category: "Electronics", content: "Our pick of the best value-for-money smartphones available right now..." },
  { id: "BLG-7", title: "Sustainable Shopping: A Buyer's Guide", author: "Ritu Sharma", status: "published", publishedAt: daysAgoIso(30), category: "Lifestyle", content: "Tips for making more sustainable choices while shopping online..." },
  { id: "BLG-8", title: "Kitchen Organization Hacks", author: "Sneha Iyer", status: "draft", publishedAt: null, category: "Home & Living", content: "Simple hacks to keep your kitchen organized and clutter-free..." },
];

const emptyForm = { title: "", author: "", status: "draft" as BlogStatus, category: "", content: "" };

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS_SEED);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [previewTarget, setPreviewTarget] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(p: BlogPost) {
    setEditing(p);
    setForm({ title: p.title, author: p.author, status: p.status, category: p.category, content: p.content });
    setFormOpen(true);
  }

  function save() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (editing) {
      setPosts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...form, publishedAt: form.status === "published" ? (p.publishedAt ?? new Date().toISOString()) : p.publishedAt } : p)));
      toast.success(`"${form.title}" updated`);
    } else {
      const post: BlogPost = { id: `BLG-${Date.now()}`, ...form, publishedAt: form.status === "published" ? new Date().toISOString() : null };
      setPosts((prev) => [post, ...prev]);
      toast.success(`"${form.title}" created`);
    }
    setFormOpen(false);
  }

  function remove() {
    if (!deleteTarget) return;
    setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.title}" deleted`);
    setDeleteTarget(null);
  }

  const columns: ColumnDef<BlogPost, unknown>[] = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "author", header: "Author" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "publishedAt", header: "Published", cell: ({ row }) => formatDate(row.original.publishedAt) },
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
        title="Blog"
        description="Manage blog posts published on the marketplace content hub"
        actions={<Button size="sm" onClick={openCreate}><Plus className="size-4" /> Create Post</Button>}
      />

      <DataTable
        columns={columns}
        data={posts}
        searchKey="title"
        searchPlaceholder="Search blog posts..."
        exportName="blog-posts"
        emptyTitle="No blog posts found"
        emptyDescription="Create your first blog post to get started."
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "Create Post"}</DialogTitle>
            <DialogDescription>Write and configure the blog post.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Author</Label>
                <Input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as BlogStatus }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Content</Label>
              <Textarea rows={8} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Create Post"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewTarget} onOpenChange={(o) => !o && setPreviewTarget(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTarget?.title}</DialogTitle>
            <DialogDescription>
              By {previewTarget?.author} · {previewTarget?.category} · {formatDate(previewTarget?.publishedAt)}
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
            {previewTarget?.content}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be permanently deleted.
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
