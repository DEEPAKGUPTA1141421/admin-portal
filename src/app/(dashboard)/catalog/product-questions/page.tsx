"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRODUCTS_DATA } from "@/lib/mock/generate";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

interface QA {
  id: string;
  productName: string;
  customerName: string;
  question: string;
  status: "pending" | "answered";
  answer: string;
  askedAt: string;
}

const QUESTION_TEXTS = [
  "Does this come with a warranty card?",
  "Is cash on delivery available for this product?",
  "What is the exact dimension of this item?",
  "Can I get this in a different color?",
  "Is this an original/genuine product?",
  "How long does delivery usually take?",
  "Is this suitable for daily use?",
  "Does it come with a charger/adapter included?",
];

function seed(): QA[] {
  return Array.from({ length: 16 }, (_, i) => {
    const p = PRODUCTS_DATA[i * 3 % PRODUCTS_DATA.length];
    const answered = i % 3 === 0;
    return {
      id: `QA-${i + 1}`,
      productName: p.name,
      customerName: ["Rahul Verma", "Priya Singh", "Amit Kumar", "Sneha Rao", "Vikas Gupta"][i % 5],
      question: QUESTION_TEXTS[i % QUESTION_TEXTS.length],
      status: answered ? "answered" : "pending",
      answer: answered ? "Yes, this product comes with a standard 1-year manufacturer warranty." : "",
      askedAt: new Date(Date.now() - i * 86400000).toISOString(),
    };
  });
}

export default function ProductQuestionsPage() {
  const [qas, setQas] = useState<QA[]>(seed);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function submitAnswer(id: string) {
    const answer = drafts[id]?.trim();
    if (!answer) { toast.error("Enter an answer before submitting"); return; }
    setQas((prev) => prev.map((q) => (q.id === id ? { ...q, status: "answered", answer } : q)));
    toast.success("Answer submitted");
  }

  const pending = qas.filter((q) => q.status === "pending");
  const answered = qas.filter((q) => q.status === "answered");

  function renderCard(q: QA) {
    return (
      <Card key={q.id}>
        <CardContent className="space-y-2 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{q.productName}</p>
            <StatusBadge status={q.status} />
          </div>
          <p className="text-sm">{q.question}</p>
          <p className="text-xs text-muted-foreground">Asked by {q.customerName} on {formatDate(q.askedAt)}</p>
          {q.status === "answered" ? (
            <div className="rounded-md bg-muted p-2 text-sm">{q.answer}</div>
          ) : (
            <div className="space-y-2">
              <Textarea
                placeholder="Write an answer..."
                value={drafts[q.id] ?? ""}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
              />
              <Button size="sm" onClick={() => submitAnswer(q.id)}>Submit Answer</Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Product Questions" description={`${pending.length} pending · ${answered.length} answered`} />
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="answered">Answered ({answered.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4 grid gap-3 md:grid-cols-2">
          {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending questions.</p>}
          {pending.map(renderCard)}
        </TabsContent>
        <TabsContent value="answered" className="mt-4 grid gap-3 md:grid-cols-2">
          {answered.map(renderCard)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
