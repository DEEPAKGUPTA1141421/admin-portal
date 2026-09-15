"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TICKETS_DATA } from "@/lib/mock/generate";
import type { SupportTicket, TicketStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";

const STATUS_OPTIONS: TicketStatus[] = [
  "open", "in_progress", "waiting_customer", "waiting_seller", "escalated", "resolved", "closed",
];
const PRIORITY_OPTIONS: SupportTicket["priority"][] = ["low", "medium", "high", "urgent"];
const AGENT_OPTIONS = ["Ritu Sharma", "Karan Mehta", "Sneha Iyer", "Vikas Rao", "Ayesha Khan", "Unassigned"];

interface ThreadMessage {
  id: string;
  author: string;
  role: "requester" | "agent";
  text: string;
  at: string;
}

interface Note {
  id: string;
  author: string;
  text: string;
  at: string;
}

interface Attachment {
  id: string;
  filename: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

const SEED_ATTACHMENTS: Attachment[] = [];

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const initialTicket = useMemo(() => TICKETS_DATA.find((t) => t.id === id) ?? null, [id]);

  const [ticket, setTicket] = useState<SupportTicket | null>(initialTicket);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [reply, setReply] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");

  if (!ticket) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ticket not found" />
        <EmptyState
          title="Ticket not found"
          description="This ticket doesn't exist or may have been removed."
          actionLabel="Back to Tickets"
          onAction={() => {
            window.location.href = "/support/tickets";
          }}
        />
      </div>
    );
  }

  function sendReply() {
    if (!reply.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `MSG-${prev.length + 1}`, author: "You (Agent)", role: "agent", text: reply.trim(), at: new Date().toISOString() },
    ]);
    setReply("");
    toast.success("Reply sent");
  }

  function addNote() {
    if (!noteText.trim()) return;
    setNotes((prev) => [...prev, { id: `NOTE-${prev.length + 1}`, author: "You (Agent)", text: noteText.trim(), at: new Date().toISOString() }]);
    setNoteText("");
    toast.success("Internal note added");
  }

  function updateStatus(status: TicketStatus) {
    setTicket((prev) => (prev ? { ...prev, status, updatedAt: new Date().toISOString() } : prev));
    toast.success(`Status changed to "${status.replace(/_/g, " ")}"`);
  }

  function updatePriority(priority: SupportTicket["priority"]) {
    setTicket((prev) => (prev ? { ...prev, priority, updatedAt: new Date().toISOString() } : prev));
    toast.success(`Priority changed to "${priority}"`);
  }

  function updateAgent(agent: string) {
    const value = agent === "Unassigned" ? null : agent;
    setTicket((prev) => (prev ? { ...prev, assignedAgent: value, updatedAt: new Date().toISOString() } : prev));
    toast.success(value ? `Assigned to ${value}` : "Ticket unassigned");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.ticketNumber}
        description={ticket.subject}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/support/tickets">
              <ArrowLeft className="size-4" /> Back to Tickets
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={ticket.status} />
        <StatusBadge status={ticket.priority} />
        <span className="text-sm text-muted-foreground">
          {ticket.assignedAgent ? `Assigned to ${ticket.assignedAgent}` : "Unassigned"}
        </span>
      </div>

      <Tabs defaultValue="conversation">
        <TabsList>
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="notes">Internal Notes</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="conversation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Thread</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[360px] rounded-lg border p-4">
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div key={m.id} className="flex gap-3">
                      <Avatar size="sm">
                        <AvatarFallback>{m.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{m.author}</span>
                          <span className="text-xs text-muted-foreground">{formatDateTime(m.at)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{m.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="space-y-2">
                <Label htmlFor="reply">Reply</Label>
                <Textarea
                  id="reply"
                  placeholder="Type your reply to the requester..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button onClick={sendReply} disabled={!reply.trim()}>
                    <Send className="size-4" /> Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Subject</p>
                  <p className="text-sm font-medium">{ticket.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Requester</p>
                  <p className="text-sm font-medium">
                    {ticket.requesterName} <span className="text-muted-foreground capitalize">({ticket.requesterType})</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{ticket.category}</p>
                </div>
                {ticket.orderId && (
                  <div>
                    <p className="text-xs text-muted-foreground">Order ID</p>
                    <p className="text-sm font-medium">{ticket.orderId}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{formatDateTime(ticket.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">{formatDateTime(ticket.updatedAt)}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={ticket.status} onValueChange={(v) => updateStatus(v as TicketStatus)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select value={ticket.priority} onValueChange={(v) => updatePriority(v as SupportTicket["priority"])}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Assigned Agent</Label>
                  <Select value={ticket.assignedAgent ?? "Unassigned"} onValueChange={updateAgent}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AGENT_OPTIONS.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {notes.map((n) => (
                  <div key={n.id} className="rounded-lg border bg-muted/40 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{n.author}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(n.at)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.text}</p>
                  </div>
                ))}
                {notes.length === 0 && <p className="text-sm text-muted-foreground">No internal notes yet.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Add Note</Label>
                <Textarea
                  id="note"
                  placeholder="Add an internal note visible only to support staff..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button onClick={addNote} disabled={!noteText.trim()}>Add Note</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SEED_ATTACHMENTS.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{a.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.size} · Uploaded by {a.uploadedBy} · {a.uploadedAt}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success(`Downloading ${a.filename}...`)}
                  >
                    <Download className="size-4" /> Download
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
