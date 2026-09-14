"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Copy, MessageSquareText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface CannedResponse {
  id: string;
  title: string;
  category: string;
  body: string;
}

const INITIAL_RESPONSES: CannedResponse[] = [
  {
    id: "CR-1",
    title: "Order Delay Apology",
    category: "Order Issue",
    body: "We're sorry for the delay in your order. Our team is actively working with the courier partner to expedite delivery, and we'll keep you updated on the status.",
  },
  {
    id: "CR-2",
    title: "Refund Processed",
    category: "Refund Delay",
    body: "Your refund has been processed successfully and should reflect in your original payment method within 5-7 business days.",
  },
  {
    id: "CR-3",
    title: "Requesting More Details",
    category: "General",
    body: "Could you please share a few more details (order number, screenshots, or a brief description) so we can investigate this further?",
  },
  {
    id: "CR-4",
    title: "Seller Payout Timeline",
    category: "Seller Complaint",
    body: "Payouts are processed on a rolling 14-day cycle after order delivery confirmation. You can track your settlement status under Finance > Payouts.",
  },
  {
    id: "CR-5",
    title: "Damaged Product Replacement",
    category: "Product Quality",
    body: "We're sorry to hear the product arrived damaged. We've initiated a free replacement, which should be dispatched within 2 business days.",
  },
];

const CATEGORIES = ["General", "Order Issue", "Refund Delay", "Product Quality", "Delivery Delay", "Account Issue", "Seller Complaint"];

export default function CannedResponsesPage() {
  const [responses, setResponses] = useState<CannedResponse[]>(INITIAL_RESPONSES);
  const [editTarget, setEditTarget] = useState<CannedResponse | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CannedResponse | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [body, setBody] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, CannedResponse[]>();
    for (const r of responses) {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category)!.push(r);
    }
    return Array.from(map.entries());
  }, [responses]);

  function openAdd() {
    setEditTarget(null);
    setTitle("");
    setCategory(CATEGORIES[0]);
    setBody("");
    setFormOpen(true);
  }

  function openEdit(r: CannedResponse) {
    setEditTarget(r);
    setTitle(r.title);
    setCategory(r.category);
    setBody(r.body);
    setFormOpen(true);
  }

  function saveResponse() {
    if (!title.trim() || !body.trim()) return;
    if (editTarget) {
      setResponses((prev) =>
        prev.map((r) => (r.id === editTarget.id ? { ...r, title: title.trim(), category, body: body.trim() } : r))
      );
      toast.success(`"${title.trim()}" updated`);
    } else {
      setResponses((prev) => [
        ...prev,
        { id: `CR-${prev.length + 1}-${Date.now()}`, title: title.trim(), category, body: body.trim() },
      ]);
      toast.success(`"${title.trim()}" added`);
    }
    setFormOpen(false);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setResponses((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.title}" deleted`);
    setDeleteTarget(null);
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Canned Responses"
        description="Reusable response templates for faster ticket resolution"
        actions={
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" /> Add Response
          </Button>
        }
      />

      {responses.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="No canned responses yet"
          description="Create your first response template to speed up ticket handling."
          actionLabel="Add Response"
          onAction={openAdd}
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([cat, items]) => (
            <div key={cat} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">{cat}</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {items.map((r) => (
                  <Card key={r.id}>
                    <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                      <CardTitle className="text-base">{r.title}</CardTitle>
                      <Badge variant="outline">{r.category}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-4">{r.body}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(r.body)}>
                          <Copy className="size-4" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                          <Pencil className="size-4" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteTarget(r)}>
                          <Trash2 className="size-4" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Response" : "Add Response"}</DialogTitle>
            <DialogDescription>
              {editTarget ? "Update this canned response template." : "Create a new reusable response template."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cr-title">Title</Label>
              <Input id="cr-title" placeholder="e.g. Order Delay Apology" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cr-category">Category</Label>
              <select
                id="cr-category"
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cr-body">Body</Label>
              <Textarea id="cr-body" placeholder="Write the response template..." value={body} onChange={(e) => setBody(e.target.value)} className="min-h-24" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={saveResponse} disabled={!title.trim() || !body.trim()}>
              {editTarget ? "Save Changes" : "Add Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this response?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && `"${deleteTarget.title}" will be permanently removed from your canned responses.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
