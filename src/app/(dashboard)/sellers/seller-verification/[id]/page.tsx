"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, ExternalLink, X } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { getKycDetail, approveKyc, rejectKyc, authorizeBankDetails, type SellerKycDetail } from "@/lib/api/sellers";
import { formatDateTime } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import { toast } from "sonner";

function DocLink({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-medium hover:underline">
          View document <ExternalLink className="size-3.5" />
        </a>
      ) : (
        <span className="text-muted-foreground">Not uploaded</span>
      )}
    </div>
  );
}

export default function SellerVerificationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [kyc, setKyc] = useState<SellerKycDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authorizeBankOpen, setAuthorizeBankOpen] = useState(false);
  const [authorizingBank, setAuthorizingBank] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await getKycDetail(params.id);
      setKyc(detail);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not reach the seller service.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove() {
    setSubmitting(true);
    try {
      const result = await approveKyc(params.id);
      setKyc((prev) => (prev ? { ...prev, ...result } : prev));
      toast.success(`${result.legalName} approved and shop authorized`);
      setApproveOpen(false);
    } catch (e) {
      toast.error("Approval failed", { description: e instanceof ApiError ? e.message : String(e) });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAuthorizeBank() {
    setAuthorizingBank(true);
    try {
      const result = await authorizeBankDetails(params.id);
      setKyc((prev) => (prev ? { ...prev, bankDetails: result } : prev));
      toast.success("Bank details authorized");
      setAuthorizeBankOpen(false);
    } catch (e) {
      toast.error("Bank authorization failed", { description: e instanceof ApiError ? e.message : String(e) });
    } finally {
      setAuthorizingBank(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setSubmitting(true);
    try {
      const result = await rejectKyc(params.id, rejectReason.trim());
      setKyc((prev) => (prev ? { ...prev, ...result } : prev));
      toast.success(`${result.legalName} rejected`);
      setRejectOpen(false);
      setRejectReason("");
    } catch (e) {
      toast.error("Rejection failed", { description: e instanceof ApiError ? e.message : String(e) });
    } finally {
      setSubmitting(false);
    }
  }

  const backButton = (
    <Button variant="outline" size="sm" onClick={() => router.push("/sellers/seller-applications")}>
      <ArrowLeft className="size-4" /> Back to Applications
    </Button>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {backButton}
        <p className="text-sm text-muted-foreground">Loading KYC submission…</p>
      </div>
    );
  }

  if (error || !kyc) {
    return (
      <div className="space-y-6">
        {backButton}
        <EmptyState
          title="Could not load this submission"
          description={error ?? "No KYC submission found for this seller."}
          actionLabel="Retry"
          onAction={load}
        />
      </div>
    );
  }

  const pending = kyc.status === "PENDING";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {backButton}
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" disabled={!pending} onClick={() => setRejectOpen(true)}>
            <X className="size-4" /> Reject
          </Button>
          <Button size="sm" disabled={!pending} onClick={() => setApproveOpen(true)}>
            <Check className="size-4" /> Approve &amp; Activate
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{kyc.legalName}</h1>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
            {kyc.phone} <StatusBadge status={kyc.status} />
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Identity Documents</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Aadhaar Number</span>
              <span className="font-mono">{kyc.aadhaarNumber ?? "—"}</span>
            </div>
            <DocLink label="Aadhaar Front" url={kyc.aadhaarFrontUrl} />
            <DocLink label="Aadhaar Back" url={kyc.aadhaarBackUrl} />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">PAN Number</span>
              <span className="font-mono">{kyc.panNumber ?? "—"}</span>
            </div>
            <DocLink label="PAN Document" url={kyc.panDocumentUrl} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Business Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST Number</span>
              <span className="font-mono">{kyc.gstNumber ?? "—"}</span>
            </div>
            <DocLink label="GST Document" url={kyc.gstDocumentUrl} />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Submitted</span>
              <span>{formatDateTime(kyc.submittedAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reviewed</span>
              <span>{formatDateTime(kyc.reviewedAt)}</span>
            </div>
            {kyc.rejectionReason && (
              <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                Rejection reason: {kyc.rejectionReason}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Bank / Payout Details</CardTitle>
            {kyc.bankDetails && (
              <StatusBadge status={kyc.bankDetails.verified ? "APPROVED" : "PENDING"} />
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {!kyc.bankDetails ? (
              <p className="text-sm text-muted-foreground">No payout details submitted yet.</p>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payout Type</span>
                  <span className="font-medium">{kyc.bankDetails.payoutType === "UPI" ? "UPI" : "Bank Account"}</span>
                </div>
                {kyc.bankDetails.payoutType === "UPI" ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">UPI ID</span>
                    <span className="font-mono">{kyc.bankDetails.upiIdMasked ?? "—"}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Account Holder</span>
                      <span className="font-medium">{kyc.bankDetails.accountHolderName ?? "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Account Number</span>
                      <span className="font-mono">{kyc.bankDetails.accountNumberLast4 ?? "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">IFSC Code</span>
                      <span className="font-mono">{kyc.bankDetails.ifscCode ?? "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bank Name</span>
                      <span className="font-medium">{kyc.bankDetails.bankName ?? "—"}</span>
                    </div>
                  </>
                )}
                <Button
                  size="sm"
                  className="w-full"
                  disabled={kyc.bankDetails.verified}
                  onClick={() => setAuthorizeBankOpen(true)}
                >
                  <Check className="size-4" />
                  {kyc.bankDetails.verified ? "Bank Details Authorized" : "Authorize Bank Details"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={authorizeBankOpen} onOpenChange={setAuthorizeBankOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authorize {kyc.legalName}&apos;s bank details?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the seller&apos;s {kyc.bankDetails?.payoutType === "UPI" ? "UPI" : "bank account"} payout
              details as verified. This is separate from document KYC approval — both need to be authorized
              for the seller to be fully onboarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={authorizingBank}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAuthorizeBank} disabled={authorizingBank}>
              {authorizingBank ? "Authorizing…" : "Authorize"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve {kyc.legalName}&apos;s KYC?</AlertDialogTitle>
            <AlertDialogDescription>
              This authorizes the shop immediately: the seller status is set to ACTIVE, a storefront QR
              code is generated, and the shop is indexed for search. The backend also requires the
              seller&apos;s onboarding to have reached the bank-account step — approval will fail with an
              error if that hasn&apos;t happened yet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={submitting}>
              {submitting ? "Approving…" : "Approve & Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={rejectOpen} onOpenChange={(o) => { if (!submitting) { setRejectOpen(o); if (!o) setRejectReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {kyc.legalName}&apos;s KYC</DialogTitle>
            <DialogDescription>A reason is required and will be shown to the seller.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={submitting}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={submitting || !rejectReason.trim()}>
              {submitting ? "Rejecting…" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
