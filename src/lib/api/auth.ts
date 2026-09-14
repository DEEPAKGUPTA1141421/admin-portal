import { apiFetchData, USE_MOCKS, ApiError } from "./client";
import type { AuthUser } from "@/lib/auth/store";

interface LoginResponse {
  token: string;
  user: AuthUser;
}

// Real endpoint: POST /api/v1/admin/auth/login on ProductClientService, returns
// ApiResponse<{ token, user: { name, email, role } }>. Falls back to a mock login
// so the portal is usable before the backend is reachable. Any email + password
// (min 6 chars) works in mock mode.
export async function login(email: string, password: string): Promise<LoginResponse> {
  if (!USE_MOCKS) {
    return apiFetchData<LoginResponse>("product", "/api/v1/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, usertype: "admin" }),
    });
  }

  try {
    return await apiFetchData<LoginResponse>("product", "/api/v1/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, usertype: "admin" }),
    });
  } catch {
    if (password.length < 6) {
      throw new ApiError(401, "Invalid credentials");
    }
    return {
      token: `mock-jwt-${btoa(email)}-${Date.now()}`,
      user: {
        name: email
          .split("@")[0]
          .replace(/[._]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        role: "Super Admin",
      },
    };
  }
}

export async function fetchAdminProfile(): Promise<AuthUser> {
  return apiFetchData<AuthUser>("product", "/api/v1/admin/auth/me");
}
