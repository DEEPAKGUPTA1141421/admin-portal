"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const AUDIENCE_SIZES: Record<string, number> = {
  "All Customers": 218400,
  "Segment: VIP": 12600,
  "Segment: At Risk": 8200,
  "Segment: New": 24500,
  "All Sellers": 4300,
};

export default function BroadcastNotificationsPage() {
  const [audience, setAudience] = useState("All Customers");
  const [channels, setChannels] = useState<string[]>(["email"]);
  const [message, setMessage] = useState("");

  function toggleChannel(c: string) {
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  function send() {
    const count = AUDIENCE_SIZES[audience] ?? 0;
    toast.success(`Broadcast sent to ${count.toLocaleString("en-IN")} recipients`);
    setMessage("");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Broadcast Notifications" description="Compose and send a mass notification to customers or sellers" />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Compose Broadcast</CardTitle>
          <CardDescription>This will send a message to all recipients in the selected audience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(AUDIENCE_SIZES).map((a) => (
                  <SelectItem key={a} value={a}>{a} ({AUDIENCE_SIZES[a].toLocaleString("en-IN")})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Channels</Label>
            <div className="flex flex-wrap gap-4">
              {["email", "sms", "push", "in_app"].map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm capitalize">
                  <Checkbox checked={channels.includes(c)} onCheckedChange={() => toggleChannel(c)} />
                  {c.replace("_", " ")}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Write your broadcast message here..." />
            <p className="text-xs text-muted-foreground">
              Variables available: {"{{customer_name}}"}, {"{{order_id}}"}, {"{{product_name}}"}
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={!message.trim() || channels.length === 0}>Send Broadcast</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Send broadcast to {AUDIENCE_SIZES[audience]?.toLocaleString("en-IN")} recipients?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will send the message via {channels.join(", ") || "no channels selected"} to the &quot;{audience}&quot; audience. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={send}>Send Broadcast</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
