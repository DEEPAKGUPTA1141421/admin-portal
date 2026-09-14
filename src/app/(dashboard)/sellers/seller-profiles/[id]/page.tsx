"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSellerProfile, type SellerProfileDetail } from "@/lib/api/sellers";
import { formatDateTime } from "@/lib/format";
import { ApiError } from "@/lib/api/client";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value ?? <span className="text-muted-foreground">—</span>}</span>
    </div>
  );
}

export default function SellerProfileDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [seller, setSeller] = useState<SellerProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSeller(await getSellerProfile(params.id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not reach the seller service.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const backButton = (
    <Button variant="outline" size="sm" onClick={() => router.push("/sellers/seller-profiles")}>
      <ArrowLeft className="size-4" /> Back to Seller Profiles
    </Button>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {backButton}
        <p className="text-sm text-muted-foreground">Loading seller profile…</p>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="space-y-6">
        {backButton}
        <EmptyState
          title="Could not load this seller"
          description={error ?? "No seller found for this id."}
          actionLabel="Retry"
          onAction={load}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {backButton}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {seller.legalName || seller.displayName || "Unnamed seller"}
          </h1>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
            {seller.phone}
            {seller.status && <StatusBadge status={seller.status} />}
          </p>
        </div>
        {seller.qrCodeUrl && (
          <a
            href={seller.qrCodeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm font-medium hover:underline"
          >
            View QR code <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Business Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Display Name" value={seller.displayName} />
            <Row label="Business Type" value={seller.businessType} />
            <Row label="Category" value={seller.category} />
            <Row label="GST Number" value={<span className="font-mono">{seller.gstNumber}</span>} />
            <Row label="Onboarding Stage" value={seller.onboardingStage && <StatusBadge status={seller.onboardingStage} />} />
            <Row label="Risk Tier" value={seller.riskTier} />
            <Row label="Website" value={seller.websiteUrl} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact & Address</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Email" value={seller.email} />
            <Row label="Email Verified" value={seller.emailVerified ? "Yes" : "No"} />
            <Row label="Phone" value={seller.phone} />
            {seller.address ? (
              <>
                <Row label="Address" value={[seller.address.line1, seller.address.line2].filter(Boolean).join(", ") || "—"} />
                <Row label="Landmark" value={seller.address.landmark} />
                <Row label="City" value={seller.address.city} />
                <Row label="State" value={seller.address.state} />
                <Row label="Pincode" value={seller.address.pincode} />
                <Row label="Country" value={seller.address.country} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No address on file.</p>
            )}
          </CardContent>
        </Card>

        {seller.bio && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Bio</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{seller.bio}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Joined" value={formatDateTime(seller.createdAt)} />
            <Row label="Last Updated" value={formatDateTime(seller.updatedAt)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
