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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type MenuGroup = "mobile" | "account";

interface MenuItem {
  id: string;
  group: MenuGroup;
  label: string;
  link: string;
  order: number;
}

const MENU_ITEMS_SEED: MenuItem[] = [
  { id: "MNU-1", group: "mobile", label: "Home", link: "/", order: 1 },
  { id: "MNU-2", group: "mobile", label: "Categories", link: "/categories", order: 2 },
  { id: "MNU-3", group: "mobile", label: "My Orders", link: "/account/orders", order: 3 },
  { id: "MNU-4", group: "mobile", label: "Wishlist", link: "/account/wishlist", order: 4 },
  { id: "MNU-5", group: "mobile", label: "Help & Support", link: "/support", order: 5 },
  { id: "MNU-6", group: "account", label: "Profile", link: "/account/profile", order: 1 },
  { id: "MNU-7", group: "account", label: "Orders", link: "/account/orders", order: 2 },
  { id: "MNU-8", group: "account", label: "Addresses", link: "/account/addresses", order: 3 },
  { id: "MNU-9", group: "account", label: "Wallet", link: "/account/wallet", order: 4 },
  { id: "MNU-10", group: "account", label: "Saved Cards", link: "/account/cards", order: 5 },
  { id: "MNU-11", group: "account", label: "Logout", link: "/logout", order: 6 },
];

const GROUP_LABEL: Record<MenuGroup, string> = { mobile: "Mobile App Menu", account: "User Account Menu" };
const emptyForm = { group: "mobile" as MenuGroup, label: "", link: "" };

export default function MenusPage() {
  const [items, setItems] = useState<MenuItem[]>(MENU_ITEMS_SEED);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState<MenuGroup>("mobile");

  const grouped = useMemo(
    () => (group: MenuGroup) => items.filter((i) => i.group === group).sort((a, b) => a.order - b.order),
    [items]
  );

  function move(item: MenuItem, dir: -1 | 1) {
    setItems((prev) => {
      const siblings = prev.filter((i) => i.group === item.group).sort((a, b) => a.order - b.order);
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
    const count = items.filter((i) => i.group === form.group).length;
    const item: MenuItem = { id: `MNU-${Date.now()}`, group: form.group, label: form.label, link: form.link, order: count + 1 };
    setItems((prev) => [...prev, item]);
    toast.success(`"${form.label}" added to ${GROUP_LABEL[form.group]}`);
    setFormOpen(false);
    setForm(emptyForm);
  }

  function remove() {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.label}" removed`);
    setDeleteTarget(null);
  }

  function renderList(group: MenuGroup) {
    const list = grouped(group);
    if (list.length === 0) {
      return <EmptyState title="No items" description="Add your first menu item." actionLabel="Add Menu Item" onAction={() => { setForm((f) => ({ ...f, group })); setFormOpen(true); }} />;
    }
    return (
      <div className="space-y-2">
        {list.map((item, i) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <Button variant="ghost" size="icon" className="size-5" disabled={i === 0} onClick={() => move(item, -1)}>
                  <ArrowUp className="size-3" />
                </Button>
                <Button variant="ghost" size="icon" className="size-5" disabled={i === list.length - 1} onClick={() => move(item, 1)}>
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
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Secondary Menus"
        description="Manage the mobile app menu and user account menu configurations"
        actions={
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="size-4" /> Add Menu Item</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Menu Item</DialogTitle>
                <DialogDescription>Add an item to the mobile or account menu.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Menu</Label>
                  <Select value={form.group} onValueChange={(v) => setForm((f) => ({ ...f, group: v as MenuGroup }))}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">Mobile App Menu</SelectItem>
                      <SelectItem value="account">User Account Menu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Label</Label>
                  <Input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Link</Label>
                  <Input placeholder="/account/example" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} />
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
          <CardTitle>Menu Configuration</CardTitle>
          <CardDescription>Switch between menu groups, reorder items, or remove them.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MenuGroup)}>
            <TabsList>
              <TabsTrigger value="mobile">Mobile App Menu</TabsTrigger>
              <TabsTrigger value="account">User Account Menu</TabsTrigger>
            </TabsList>
            <TabsContent value="mobile" className="pt-4">{renderList("mobile")}</TabsContent>
            <TabsContent value="account" className="pt-4">{renderList("account")}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this menu item?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.label}&rdquo; will be removed from {deleteTarget ? GROUP_LABEL[deleteTarget.group] : "the menu"}.
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
