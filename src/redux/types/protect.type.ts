// src/redux/types/protect.type.ts

export type ProtectPlanType = "YEARLY" | "PER_TRIP";

export type ProtectPurchaseStatus =
  | "PENDING"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED"
  | "FAILED";

export type ProtectPurchaseSource = "LANDING" | "DASHBOARD";

export interface ProtectPlan {
  id: string;
  type: ProtectPlanType;
  price: number;
  currency: string;
  priceId: string;
  coverAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProtectPurchaseUser {
  id: string;
  fullName: string;
  email: string;
  photo: string | null;
  phoneNumber: string | null;
}

export interface ProtectPurchase {
  id: string;
  userId: string | null;
  email: string;
  fullName: string | null;
  planId: string;
  planType: ProtectPlanType;
  amount: number;
  currency: string;
  status: ProtectPurchaseStatus;
  tripsCovered: number;
  propertyAddress: string | null;
  source: ProtectPurchaseSource;
  stripeSessionId: string | null;
  stripeSubscriptionId: string | null;
  stripePaymentIntentId: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  plan: ProtectPlan;
  user: ProtectPurchaseUser | null;
}

export interface ProtectSummary {
  totalPurchases: number;
  activeCovers: number;
  totalRevenue: number;
  yearlyCovers: number;
  perTripCovers: number;
}

export interface ProtectPurchasesResponse {
  purchases: ProtectPurchase[];
  summary: ProtectSummary;
}
