"use client";

import { useMemo, useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  from: "customer" | "agent";
  text: string;
  at: string;
}

interface ChatSession {
  id: string;
  customerName: string;
  lastMessage: string;
  unread: number;
  waitingSince: string;
  messages: ChatMessage[];
}

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: "CHAT-1",
    customerName: "Aditi Verma",
    lastMessage: "Is my order still on the way?",
    unread: 2,
    waitingSince: "2 min ago",
    messages: [
      { id: "m1", from: "customer", text: "Hi, I placed an order yesterday and it still shows processing.", at: "10:02 AM" },
      { id: "m2", from: "agent", text: "Hi Aditi, let me check that for you right away.", at: "10:03 AM" },
      { id: "m3", from: "customer", text: "Is my order still on the way?", at: "10:05 AM" },
    ],
  },
  {
    id: "CHAT-2",
    customerName: "Rohan Malhotra",
    lastMessage: "Thanks, that resolves it!",
    unread: 0,
    waitingSince: "8 min ago",
    messages: [
      { id: "m1", from: "customer", text: "My coupon code isn't applying at checkout.", at: "9:40 AM" },
      { id: "m2", from: "agent", text: "Could you share the coupon code you're using?", at: "9:41 AM" },
      { id: "m3", from: "customer", text: "SAVE20", at: "9:42 AM" },
      { id: "m4", from: "agent", text: "That coupon expired yesterday, here's a fresh one: SAVE25.", at: "9:44 AM" },
      { id: "m5", from: "customer", text: "Thanks, that resolves it!", at: "9:45 AM" },
    ],
  },
  {
    id: "CHAT-3",
    customerName: "Meera Nair (Seller)",
    lastMessage: "When will my payout be processed?",
    unread: 1,
    waitingSince: "15 min ago",
    messages: [
      { id: "m1", from: "customer", text: "When will my payout be processed?", at: "9:30 AM" },
    ],
  },
  {
    id: "CHAT-4",
    customerName: "Kabir Singh",
    lastMessage: "The product I received is damaged.",
    unread: 3,
    waitingSince: "20 min ago",
    messages: [
      { id: "m1", from: "customer", text: "The product I received is damaged.", at: "9:20 AM" },
      { id: "m2", from: "customer", text: "Can I get a replacement?", at: "9:21 AM" },
      { id: "m3", from: "customer", text: "Please respond soon.", at: "9:25 AM" },
    ],
  },
];

export default function LiveChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_SESSIONS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_SESSIONS[0].id);
  const [draft, setDraft] = useState("");

  const selectedSession = useMemo(() => sessions.find((s) => s.id === selectedId) ?? null, [sessions, selectedId]);

  function selectSession(id: string) {
    setSelectedId(id);
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, unread: 0 } : s)));
  }

  function sendMessage() {
    if (!draft.trim() || !selectedSession) return;
    const text = draft.trim();
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSession.id
          ? {
              ...s,
              lastMessage: text,
              messages: [
                ...s.messages,
                { id: `m${s.messages.length + 1}`, from: "agent", text, at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) },
              ],
            }
          : s
      )
    );
    setDraft("");
    toast.success("Message sent");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Live Chat" description="Respond to active customer and seller chat sessions in real time" />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-[600px] overflow-hidden p-0">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium">Active Sessions</p>
            <p className="text-xs text-muted-foreground">{sessions.length} conversations</p>
          </div>
          <ScrollArea className="h-[540px]">
            <div className="divide-y">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectSession(s.id)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                    selectedId === s.id && "bg-muted"
                  )}
                >
                  <Avatar size="sm">
                    <AvatarFallback>{s.customerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{s.customerName}</span>
                      {s.unread > 0 && <Badge className="shrink-0">{s.unread}</Badge>}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{s.lastMessage}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Waiting {s.waitingSince}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="flex h-[600px] flex-col overflow-hidden p-0">
          {selectedSession ? (
            <>
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <Avatar size="sm">
                  <AvatarFallback>{selectedSession.customerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{selectedSession.customerName}</p>
                  <p className="text-xs text-muted-foreground">Waiting {selectedSession.waitingSince}</p>
                </div>
              </div>
              <ScrollArea className="flex-1 px-4 py-3">
                <div className="space-y-3">
                  {selectedSession.messages.map((m) => (
                    <div key={m.id} className={cn("flex", m.from === "agent" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                          m.from === "agent" ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}
                      >
                        <p>{m.text}</p>
                        <p className={cn("mt-1 text-[10px]", m.from === "agent" ? "text-primary-foreground/70" : "text-muted-foreground")}>{m.at}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center gap-2 border-t p-3">
                <Input
                  placeholder="Type a message..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <Button onClick={sendMessage} disabled={!draft.trim()}>
                  <Send className="size-4" /> Send
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
              <MessageCircle className="size-8" />
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
