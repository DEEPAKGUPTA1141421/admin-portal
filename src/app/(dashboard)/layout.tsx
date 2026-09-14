"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuthStore } from "@/lib/auth/store";
import { fetchAdminProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const [hydrated, setHydrated] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    // Mock tokens (see lib/api/auth.ts fallback) never validate against the
    // real backend — skip the /me round-trip so demo mode keeps working when
    // the backend is unreachable.
    if (token.startsWith("mock-jwt-")) {
      setVerifying(false);
      return;
    }
    let cancelled = false;
    fetchAdminProfile()
      .then((user) => {
        if (cancelled) return;
        setAuth(token, user); // refresh cached profile (role/name may have changed)
        setVerifying(false);
      })
      .catch((err) => {
        if (cancelled) return;
        // Only a real auth rejection should log the admin out — a network
        // error (backend down) shouldn't strand them on the login screen.
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          logout();
          router.replace("/login");
        } else {
          setVerifying(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, token, router, setAuth, logout]);

  if (!hydrated || !token || verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <div className="flex-1 space-y-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
