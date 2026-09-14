"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

interface FooterColumn {
  id: string;
  columnTitle: string;
  links: FooterLink[];
}

const FOOTER_COLUMNS_SEED: FooterColumn[] = [
  {
    id: "COL-1",
    columnTitle: "About",
    links: [
      { id: "LNK-1", label: "About Us", url: "/about" },
      { id: "LNK-2", label: "Careers", url: "/careers" },
      { id: "LNK-3", label: "Press", url: "/press" },
    ],
  },
  {
    id: "COL-2",
    columnTitle: "Customer Service",
    links: [
      { id: "LNK-4", label: "Contact Us", url: "/contact" },
      { id: "LNK-5", label: "Help Center", url: "/help" },
      { id: "LNK-6", label: "Returns & Refunds", url: "/returns" },
      { id: "LNK-7", label: "Shipping Policy", url: "/shipping-policy" },
    ],
  },
  {
    id: "COL-3",
    columnTitle: "Policies",
    links: [
      { id: "LNK-8", label: "Terms & Conditions", url: "/terms" },
      { id: "LNK-9", label: "Privacy Policy", url: "/privacy" },
    ],
  },
  {
    id: "COL-4",
    columnTitle: "Sell With Us",
    links: [
      { id: "LNK-10", label: "Become a Seller", url: "/sell-with-us" },
      { id: "LNK-11", label: "Seller Login", url: "/seller/login" },
    ],
  },
];

export default function FooterCmsPage() {
  const [columns, setColumns] = useState<FooterColumn[]>(FOOTER_COLUMNS_SEED);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newLinkDrafts, setNewLinkDrafts] = useState<Record<string, { label: string; url: string }>>({});
  const [deleteColTarget, setDeleteColTarget] = useState<FooterColumn | null>(null);
  const [deleteLinkTarget, setDeleteLinkTarget] = useState<{ col: FooterColumn; link: FooterLink } | null>(null);

  function addColumn() {
    if (!newColumnTitle.trim()) { toast.error("Column title is required"); return; }
    const col: FooterColumn = { id: `COL-${Date.now()}`, columnTitle: newColumnTitle, links: [] };
    setColumns((prev) => [...prev, col]);
    toast.success(`Column "${newColumnTitle}" added`);
    setNewColumnTitle("");
  }

  function removeColumn() {
    if (!deleteColTarget) return;
    setColumns((prev) => prev.filter((c) => c.id !== deleteColTarget.id));
    toast.success(`Column "${deleteColTarget.columnTitle}" removed`);
    setDeleteColTarget(null);
  }

  function updateColumnTitle(colId: string, title: string) {
    setColumns((prev) => prev.map((c) => (c.id === colId ? { ...c, columnTitle: title } : c)));
  }

  function addLink(colId: string) {
    const draft = newLinkDrafts[colId];
    if (!draft?.label?.trim() || !draft?.url?.trim()) { toast.error("Link label and URL are required"); return; }
    const link: FooterLink = { id: `LNK-${Date.now()}`, label: draft.label, url: draft.url };
    setColumns((prev) => prev.map((c) => (c.id === colId ? { ...c, links: [...c.links, link] } : c)));
    toast.success(`Link "${draft.label}" added`);
    setNewLinkDrafts((prev) => ({ ...prev, [colId]: { label: "", url: "" } }));
  }

  function removeLink() {
    if (!deleteLinkTarget) return;
    const { col, link } = deleteLinkTarget;
    setColumns((prev) => prev.map((c) => (c.id === col.id ? { ...c, links: c.links.filter((l) => l.id !== link.id) } : c)));
    toast.success(`Link "${link.label}" removed`);
    setDeleteLinkTarget(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Footer Configuration" description="Manage footer columns and links shown on the storefront" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {columns.map((col) => (
          <Card key={col.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <div className="flex-1">
                <Label className="sr-only">Column Title</Label>
                <Input
                  value={col.columnTitle}
                  onChange={(e) => updateColumnTitle(col.id, e.target.value)}
                  className="font-semibold"
                />
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setDeleteColTarget(col)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {col.links.length === 0 && <p className="text-sm text-muted-foreground">No links yet.</p>}
              {col.links.map((link) => (
                <div key={link.id} className="flex items-center justify-between rounded-md border p-2">
                  <div>
                    <p className="text-sm font-medium">{link.label}</p>
                    <p className="text-xs text-muted-foreground">{link.url}</p>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleteLinkTarget({ col, link })}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
              <Separator />
              <div className="flex items-end gap-2">
                <div className="grid flex-1 gap-1.5">
                  <Label className="text-xs">Label</Label>
                  <Input
                    placeholder="Link label"
                    value={newLinkDrafts[col.id]?.label ?? ""}
                    onChange={(e) => setNewLinkDrafts((prev) => ({ ...prev, [col.id]: { label: e.target.value, url: prev[col.id]?.url ?? "" } }))}
                  />
                </div>
                <div className="grid flex-1 gap-1.5">
                  <Label className="text-xs">URL</Label>
                  <Input
                    placeholder="/page-url"
                    value={newLinkDrafts[col.id]?.url ?? ""}
                    onChange={(e) => setNewLinkDrafts((prev) => ({ ...prev, [col.id]: { label: prev[col.id]?.label ?? "", url: e.target.value } }))}
                  />
                </div>
                <Button size="icon-sm" onClick={() => addLink(col.id)}>
                  <Plus className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Column</CardTitle>
          <CardDescription>Create a new footer column.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-2">
          <div className="grid flex-1 gap-1.5 max-w-xs">
            <Label>Column Title</Label>
            <Input value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)} placeholder="e.g. Follow Us" />
          </div>
          <Button onClick={addColumn}><Plus className="size-4" /> Add Column</Button>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteColTarget} onOpenChange={(o) => !o && setDeleteColTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this column?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteColTarget?.columnTitle}&rdquo; and all its links will be permanently removed from the footer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={removeColumn}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteLinkTarget} onOpenChange={(o) => !o && setDeleteLinkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this link?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteLinkTarget?.link.label}&rdquo; will be removed from the {deleteLinkTarget?.col.columnTitle} column.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={removeLink}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
