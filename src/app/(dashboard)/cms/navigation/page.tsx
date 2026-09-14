"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface NavItem {
  id: string;
  label: string;
  link: string;
  order: number;
  parentId: string | null;
}

const NAV_ITEMS_SEED: NavItem[] = [
  { id: "NAV-1", label: "Electronics", link: "/category/electronics", order: 1, parentId: null },
  { id: "NAV-2", label: "Fashion", link: "/category/fashion", order: 2, parentId: null },
  { id: "NAV-3", label: "Home & Kitchen", link: "/category/home-kitchen", order: 3, parentId: null },
  { id: "NAV-4", label: "Mobiles", link: "/category/electronics/mobiles", order: 1, parentId: "NAV-1" },
  { id: "NAV-5", label: "Laptops", link: "/category/electronics/laptops", order: 2, parentId: "NAV-1" },
  { id: "NAV-6", label: "Beauty & Personal Care", link: "/category/beauty", order: 4, parentId: null },
  { id: "NAV-7", label: "Deals", link: "/deals", order: 5, parentId: null },
  { id: "NAV-8", label: "Men's Wear", link: "/category/fashion/men", order: 1, parentId: "NAV-2" },
  { id: "NAV-9", label: "Women's Wear", link: "/category/fashion/women", order: 2, parentId: "NAV-2" },
];

const emptyForm = { label: "", link: "", parentId: "none" };

export default function NavigationPage() {
  const [items, setItems] = useState<NavItem[]>(NAV_ITEMS_SEED);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<NavItem | null>(null);

  const topLevel = useMemo(() => items.filter((i) => i.parentId === null).sort((a, b) => a.order - b.order), [items]);
  const childrenOf = (parentId: string) => items.filter((i) => i.parentId === parentId).sort((a, b) => a.order - b.order);

  function move(item: NavItem, dir: -1 | 1) {
    setItems((prev) => {
      const siblings = prev.filter((i) => i.parentId === item.parentId).sort((a, b) => a.order - b.order);
      const idx = siblings.findIndex((i) => i.id === item.id);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= siblings.length) return prev;
      const a = siblings[idx];
      const b = siblings[swapIdx];
      return prev.map((i) => {
        if (i.id === a.id) return { ...i, order: b.order };
        if (i.id === b.id) return { ...i, order: a.order };
        return i;
      });
    });
  }

  function addItem() {
    if (!form.label.trim() || !form.link.trim()) { toast.error("Label and link are required"); return; }
    const parentId = form.parentId === "none" ? null : form.parentId;
    const siblingCount = items.filter((i) => i.parentId === parentId).length;
    const item: NavItem = { id: `NAV-${Date.now()}`, label: form.label, link: form.link, order: siblingCount + 1, parentId };
    setItems((prev) => [...prev, item]);
    toast.success(`"${form.label}" added to navigation`);
    setFormOpen(false);
    setForm(emptyForm);
  }

  function remove() {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id && i.parentId !== deleteTarget.id));
    toast.success(`"${deleteTarget.label}" removed from navigation`);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Header Navigation"
        description="Manage the primary navigation menu shown in the storefront header"
        actions={
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="size-4" /> Add Menu Item</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Menu Item</DialogTitle>
                <DialogDescription>Add a top-level or nested navigation item.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Label</Label>
                  <Input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Link</Label>
                  <Input placeholder="/category/example" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Parent Item</Label>
                  <Select value={form.parentId} onValueChange={(v) => setForm((f) => ({ ...f, parentId: v }))}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (top-level)</SelectItem>
                      {topLevel.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                <Button onClick={addItem}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Menu Structure</CardTitle>
          <CardDescription>Reorder items with the arrows. Deleting a parent also removes its children.</CardDescription>
        </CardHeader>
        <CardContent>
          {topLevel.length === 0 ? (
            <EmptyState title="No navigation items" description="Add your first navigation item." actionLabel="Add Menu Item" onAction={() => setFormOpen(true)} />
          ) : (
            <div className="space-y-2">
              {topLevel.map((item, i) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <Button variant="ghost" size="icon" className="size-5" disabled={i === 0} onClick={() => move(item, -1)}>
                          <ArrowUp className="size-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-5" disabled={i === topLevel.length - 1} onClick={() => move(item, 1)}>
                          <ArrowDown className="size-3" />
                        </Button>
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.link}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(item)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                  {childrenOf(item.id).length > 0 && (
                    <div className="ml-10 mt-1 space-y-1 border-l pl-4">
                      {childrenOf(item.id).map((child, ci) => (
                        <div key={child.id} className="flex items-center justify-between rounded-md border p-2">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <Button variant="ghost" size="icon" className="size-4" disabled={ci === 0} onClick={() => move(child, -1)}>
                                <ArrowUp className="size-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="size-4" disabled={ci === childrenOf(item.id).length - 1} onClick={() => move(child, 1)}>
                                <ArrowDown className="size-3" />
                              </Button>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{child.label}</p>
                              <p className="text-xs text-muted-foreground">{child.link}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(child)}>
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this menu item?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.label}&rdquo; will be removed from the header navigation, including any sub-items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={remove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
