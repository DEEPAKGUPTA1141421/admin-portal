"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
import { toast } from "sonner";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

const FAQS_SEED: Faq[] = [
  { id: "FAQ-1", question: "How do I track my order?", answer: "Go to My Orders and click Track on the relevant order to see live status updates.", category: "Orders", order: 1 },
  { id: "FAQ-2", question: "Can I cancel an order after placing it?", answer: "Yes, orders can be cancelled before they are shipped from the My Orders page.", category: "Orders", order: 2 },
  { id: "FAQ-3", question: "What payment methods are accepted?", answer: "We accept credit/debit cards, UPI, net banking, and wallet payments.", category: "Payments", order: 1 },
  { id: "FAQ-4", question: "Is Cash on Delivery available?", answer: "COD is available on eligible orders in select pincodes.", category: "Payments", order: 2 },
  { id: "FAQ-5", question: "How do I return a product?", answer: "Initiate a return from My Orders within the return window for that product.", category: "Returns & Refunds", order: 1 },
  { id: "FAQ-6", question: "When will I get my refund?", answer: "Refunds are processed within 5-7 business days after the returned item is received.", category: "Returns & Refunds", order: 2 },
  { id: "FAQ-7", question: "How do I become a seller?", answer: "Visit the Sell With Us page and complete the seller onboarding form with your GST details.", category: "Sellers", order: 1 },
  { id: "FAQ-8", question: "What is the commission charged to sellers?", answer: "Commission varies by category and is disclosed during onboarding, typically 5-20%.", category: "Sellers", order: 2 },
];

const emptyForm = { question: "", answer: "", category: "" };

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>(FAQS_SEED);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, Faq[]>();
    for (const f of [...faqs].sort((a, b) => a.order - b.order)) {
      if (!map.has(f.category)) map.set(f.category, []);
      map.get(f.category)!.push(f);
    }
    return map;
  }, [faqs]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(f: Faq) {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer, category: f.category });
    setFormOpen(true);
  }

  function save() {
    if (!form.question.trim() || !form.answer.trim()) { toast.error("Question and answer are required"); return; }
    if (editing) {
      setFaqs((prev) => prev.map((f) => (f.id === editing.id ? { ...f, ...form } : f)));
      toast.success("FAQ updated");
    } else {
      const count = faqs.filter((f) => f.category === form.category).length;
      const faq: Faq = { id: `FAQ-${Date.now()}`, ...form, order: count + 1 };
      setFaqs((prev) => [...prev, faq]);
      toast.success("FAQ added");
    }
    setFormOpen(false);
  }

  function remove() {
    if (!deleteTarget) return;
    setFaqs((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    toast.success("FAQ deleted");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQs"
        description="Manage frequently asked questions shown to customers"
        actions={<Button size="sm" onClick={openCreate}><Plus className="size-4" /> Add FAQ</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Manage FAQs</CardTitle>
          <CardDescription>All questions, grouped by category.</CardDescription>
        </CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <EmptyState title="No FAQs yet" description="Add your first FAQ." actionLabel="Add FAQ" onAction={openCreate} />
          ) : (
            <div className="space-y-4">
              {[...grouped.entries()].map(([category, items]) => (
                <div key={category}>
                  <p className="mb-2 text-sm font-semibold text-muted-foreground">{category}</p>
                  <div className="space-y-2">
                    {items.map((f) => (
                      <div key={f.id} className="flex items-start justify-between gap-2 rounded-lg border p-3">
                        <div>
                          <p className="font-medium text-sm">{f.question}</p>
                          <p className="text-sm text-muted-foreground mt-1">{f.answer}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(f)}><Pencil className="size-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(f)}><Trash2 className="size-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>How FAQs will appear to customers, grouped by category.</CardDescription>
        </CardHeader>
        <CardContent>
          {[...grouped.entries()].map(([category, items]) => (
            <div key={category} className="mb-4">
              <p className="mb-1 text-sm font-semibold">{category}</p>
              <Accordion type="single" collapsible>
                {items.map((f) => (
                  <AccordionItem key={f.id} value={f.id}>
                    <AccordionTrigger>{f.question}</AccordionTrigger>
                    <AccordionContent>{f.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            <DialogDescription>Configure the question, answer, and category.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Question</Label>
              <Input value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label>Answer</Label>
              <Textarea rows={4} value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Orders" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Add FAQ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.question}&rdquo; will be permanently removed.
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
