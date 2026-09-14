"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ShoppingBag, IndianRupee, Wallet, Ban, CheckCircle2, Mail, Phone, MapPin, Star,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { CUSTOMERS_DATA, ORDERS_DATA } from "@/lib/mock/generate";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { toast } from "sonner";
import {
  addressesForCustomer, wishlistForCustomer, reviewsForCustomer, ticketsForCustomer,
} from "../../_lib/mock";

interface Note {
  id: string;
  text: string;
  createdAt: string;
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const baseCustomer = useMemo(() => CUSTOMERS_DATA.find((c) => c.id === params.id), [params.id]);

  const [customer, setCustomer] = useState(baseCustomer);
  const [blockOpen, setBlockOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletAmount, setWalletAmount] = useState("");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  const orders = useMemo(
    () => (baseCustomer ? ORDERS_DATA.filter((o) => o.customerId === baseCustomer.id) : []),
    [baseCustomer]
  );
  const addresses = useMemo(() => (baseCustomer ? addressesForCustomer(baseCustomer.id) : []), [baseCustomer]);
  const wishlist = useMemo(() => (baseCustomer ? wishlistForCustomer(baseCustomer.id) : []), [baseCustomer]);
  const reviews = useMemo(() => (baseCustomer ? reviewsForCustomer(baseCustomer.id) : []), [baseCustomer]);
  const tickets = useMemo(() => (baseCustomer ? ticketsForCustomer(baseCustomer.id) : []), [baseCustomer]);

  if (!baseCustomer || !customer) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/customers/all-customers")}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <EmptyState title="Customer not found" description="This customer record does not exist." />
      </div>
    );
  }

  function toggleBlock() {
    if (!customer) return;
    setCustomer({ ...customer, status: customer.status === "blocked" ? "active" : "blocked" });
    toast.success(customer.status === "blocked" ? "Customer unblocked" : "Customer blocked");
    setBlockOpen(false);
  }

  function adjustWallet() {
    const amt = Number(walletAmount);
    if (!customer || !amt) return;
    setCustomer({ ...customer, walletBalance: Math.max(0, customer.walletBalance + amt) });
    toast.success(`Wallet ${amt >= 0 ? "credited" : "debited"} ${formatINR(Math.abs(amt))}`);
    setWalletOpen(false);
    setWalletAmount("");
  }

  function addNote() {
    if (!noteText.trim()) return;
    setNotes((prev) => [{ id: `NOTE-${prev.length + 1}`, text: noteText.trim(), createdAt: new Date().toISOString() }, ...prev]);
    setNoteText("");
    toast.success("Internal note added");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.push("/customers/all-customers")}>
          <ArrowLeft className="size-4" /> Back to Customers
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setWalletOpen(true)}>
            <Wallet className="size-4" /> Adjust Wallet
          </Button>
          <Button
            variant={customer.status === "blocked" ? "default" : "destructive"}
            size="sm"
            onClick={() => setBlockOpen(true)}
          >
            {customer.status === "blocked" ? <CheckCircle2 className="size-4" /> : <Ban className="size-4" />}
            {customer.status === "blocked" ? "Unblock" : "Block"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback>{initials(customer.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{customer.name}</h1>
              <StatusBadge status={customer.status} />
              <StatusBadge status={customer.segment} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="size-3.5" /> {customer.email}</span>
              <span className="flex items-center gap-1"><Phone className="size-3.5" /> {customer.phone}</span>
              <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {customer.city}, {customer.state}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Orders" value={String(customer.totalOrders)} icon={ShoppingBag} />
        <KpiCard label="Total Spend" value={formatINR(customer.totalSpend)} icon={IndianRupee} tone="green" />
        <KpiCard label="Avg Order Value" value={formatINR(customer.avgOrderValue)} icon={IndianRupee} tone="blue" />
        <KpiCard label="Wallet Balance" value={formatINR(customer.walletBalance)} icon={Wallet} tone="orange" />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="addresses">Addresses ({addresses.length})</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist ({wishlist.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="support">Support ({tickets.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Customer ID</span><span>{customer.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Registered</span><span>{formatDate(customer.registeredAt)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Last Order</span><span>{formatDate(customer.lastOrderAt)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Segment</span><StatusBadge status={customer.segment} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={customer.status} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-sm">
                    <Link href={`/orders/all-orders/${o.id}`} className="hover:underline">{o.orderNumber}</Link>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatINR(o.amount)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                ))}
                {!orders.length && <p className="text-sm text-muted-foreground">No orders yet.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Placed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell><Link href={`/orders/all-orders/${o.id}`} className="font-medium hover:underline">{o.orderNumber}</Link></TableCell>
                    <TableCell>{o.sellerName}</TableCell>
                    <TableCell>{formatINR(o.amount)}</TableCell>
                    <TableCell><StatusBadge status={o.paymentStatus} /></TableCell>
                    <TableCell><StatusBadge status={o.status} /></TableCell>
                    <TableCell>{formatDate(o.placedAt)}</TableCell>
                  </TableRow>
                ))}
                {!orders.length && (
                  <TableRow><TableCell colSpan={6}><EmptyState title="No orders" /></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.map((a) => (
              <Card key={a.id}>
                <CardContent className="space-y-1 pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{a.type}</span>
                    {a.isDefault && <StatusBadge status="active" label="Default" />}
                  </div>
                  <p className="text-muted-foreground">{a.line1}</p>
                  <p className="text-muted-foreground">{a.city}, {a.state} - {a.pincode}</p>
                </CardContent>
              </Card>
            ))}
            {!addresses.length && <EmptyState title="No saved addresses" />}
          </div>
        </TabsContent>

        <TabsContent value="wishlist" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wishlist.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.productName}</TableCell>
                    <TableCell>{formatINR(w.price)}</TableCell>
                    <TableCell>{formatDate(w.addedAt)}</TableCell>
                  </TableRow>
                ))}
                {!wishlist.length && (
                  <TableRow><TableCell colSpan={3}><EmptyState title="No wishlist items" /></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <div className="space-y-3">
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="space-y-1 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{r.productName}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`size-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{r.text}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                </CardContent>
              </Card>
            ))}
            {!reviews.length && <EmptyState title="No reviews" />}
          </div>
        </TabsContent>

        <TabsContent value="wallet" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Wallet Balance</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-semibold">{formatINR(customer.walletBalance)}</p>
              <Button size="sm" onClick={() => setWalletOpen(true)}><Wallet className="size-4" /> Credit / Debit Wallet</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.ticketNumber}</TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell><StatusBadge status={t.priority} /></TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell>{formatDate(t.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {!tickets.length && (
                  <TableRow><TableCell colSpan={6}><EmptyState title="No support tickets" /></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Internal Notes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add an internal note about this customer..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-16"
                />
              </div>
              <Button size="sm" onClick={addNote} disabled={!noteText.trim()}>Add Note</Button>
              <div className="space-y-3 pt-2">
                {notes.map((n) => (
                  <div key={n.id} className="rounded-lg border p-3 text-sm">
                    <p>{n.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
                  </div>
                ))}
                {!notes.length && <p className="text-sm text-muted-foreground">No notes yet.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={blockOpen} onOpenChange={setBlockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{customer.status === "blocked" ? "Unblock this customer?" : "Block this customer?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {customer.status === "blocked"
                ? `${customer.name} will regain access to place orders and use the platform.`
                : `${customer.name} will be blocked from placing new orders and logging in.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant={customer.status === "blocked" ? "default" : "destructive"} onClick={toggleBlock}>
              {customer.status === "blocked" ? "Unblock" : "Block"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={walletOpen} onOpenChange={setWalletOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Wallet Balance</DialogTitle>
            <DialogDescription>Current balance: {formatINR(customer.walletBalance)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="wallet-amt">Amount (use negative to debit)</Label>
            <Input id="wallet-amt" type="number" placeholder="e.g. 500 or -200" value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWalletOpen(false)}>Cancel</Button>
            <Button onClick={adjustWallet} disabled={!walletAmount || Number(walletAmount) === 0}>Apply Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
