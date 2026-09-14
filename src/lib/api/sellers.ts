import { apiFetchData } from "./client";

// Mirrors AdminKycService#buildSummary (ProductClientService). Pending-list
// items and the detail view share this shape; detail additionally carries
// the full decrypted aadhaarNumber/panNumber.
export interface SellerKycSummary {
  sellerId: string;
  legalName: string;
  phone: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  aadhaarLast4: string | null;
  panLast4: string | null;
  gstNumber: string | null;
  aadhaarFrontUrl: string | null;
  aadhaarBackUrl: string | null;
  panDocumentUrl: string | null;
  gstDocumentUrl: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export interface SellerBankDetailsInfo {
  payoutType: "BANK_ACCOUNT" | "UPI";
  accountHolderName: string | null;
  accountNumberLast4: string | null;
  ifscCode: string | null;
  bankName: string | null;
  upiIdMasked: string | null;
  verified: boolean;
}

export interface SellerKycDetail extends SellerKycSummary {
  aadhaarNumber: string | null;
  panNumber: string | null;
  bankDetails: SellerBankDetailsInfo | null;
}

export interface PendingKycList {
  items: SellerKycSummary[];
  totalElements: number;
  totalPages: number;
}

export async function getPendingKyc(page = 0, size = 20): Promise<PendingKycList> {
  return apiFetchData<PendingKycList>("product", `/api/v1/admin/sellers/kyc/pending?page=${page}&size=${size}`);
}

export async function getKycDetail(sellerId: string): Promise<SellerKycDetail> {
  return apiFetchData<SellerKycDetail>("product", `/api/v1/admin/sellers/kyc/${sellerId}`);
}

// Approves KYC and authorizes the shop (sets seller ACTIVE, generates QR, indexes shop).
// Backend requires the seller to have completed onboarding through BANK_ACCOUNT stage first,
// otherwise it throws — surfaced here as an ApiError with that message.
export async function approveKyc(sellerId: string): Promise<SellerKycSummary> {
  return apiFetchData<SellerKycSummary>("product", `/api/v1/admin/sellers/kyc/${sellerId}/approve`, {
    method: "PATCH",
  });
}

// Authorizes the seller's submitted bank account or UPI payout details.
// Independent from document approval — both must be authorized for onboarding
// to complete.
export async function authorizeBankDetails(sellerId: string): Promise<SellerBankDetailsInfo> {
  return apiFetchData<SellerBankDetailsInfo>("product", `/api/v1/admin/sellers/kyc/${sellerId}/authorize-bank-details`, {
    method: "PATCH",
  });
}

export async function rejectKyc(sellerId: string, reason: string): Promise<SellerKycSummary> {
  return apiFetchData<SellerKycSummary>("product", `/api/v1/admin/sellers/kyc/${sellerId}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

export interface ActivateSellerResult {
  sellerId: string;
  sellerPageUrl: string;
  qrCodeUrl: string;
}

export async function activateSeller(sellerId: string): Promise<ActivateSellerResult> {
  return apiFetchData<ActivateSellerResult>("product", `/api/v1/admin/sellers/${sellerId}/activate`, {
    method: "PATCH",
  });
}

export async function deactivateSeller(sellerId: string): Promise<void> {
  return apiFetchData<void>("product", `/api/v1/admin/sellers/${sellerId}/deactivate`, {
    method: "PATCH",
  });
}

// Mirrors AdminSellerController#buildSummary
export interface SellerProfileSummary {
  sellerId: string;
  legalName: string | null;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  phone: string;
  status: string | null;
  riskTier: string | null;
  onboardingStage: string | null;
  businessType: string | null;
  gstNumber: string | null;
  category: string | null;
  qrCodeUrl: string | null;
  profilePhotoUrl: string | null;
  coverImageUrl: string | null;
  bio: string | null;
  websiteUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SellerAddress {
  line1: string | null;
  line2: string | null;
  landmark: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
}

export interface SellerProfileDetail extends SellerProfileSummary {
  address: SellerAddress | null;
}

export interface SellerProfileList {
  items: SellerProfileSummary[];
  totalElements: number;
  totalPages: number;
}

export async function listSellerProfiles(page = 0, size = 100): Promise<SellerProfileList> {
  return apiFetchData<SellerProfileList>("product", `/api/v1/admin/sellers?page=${page}&size=${size}`);
}

export async function getSellerProfile(sellerId: string): Promise<SellerProfileDetail> {
  return apiFetchData<SellerProfileDetail>("product", `/api/v1/admin/sellers/${sellerId}`);
}

// All submitted KYC document sets, any status (vs. getPendingKyc which is
// scoped to the review queue only). Backs the "Seller Documents" view.
export async function listSellerDocuments(page = 0, size = 100): Promise<PendingKycList> {
  return apiFetchData<PendingKycList>("product", `/api/v1/admin/sellers/kyc/documents?page=${page}&size=${size}`);
}
