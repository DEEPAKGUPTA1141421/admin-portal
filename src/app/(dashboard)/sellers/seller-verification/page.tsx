"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The nav sidebar links here, but KYC verification always acts on one
// specific seller — redirect to the applications queue to pick one.
export default function SellerVerificationIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/sellers/seller-applications");
  }, [router]);
  return <p className="text-sm text-muted-foreground">Redirecting to Seller Applications…</p>;
}
