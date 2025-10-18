// src/redux/types/badge.type.ts
export type BadgeType = "GOLDEN_HOST" | "REVIEW_BADGE" | "EARLY_ADOPTER";

export interface Badge {
  id: string;
  type: BadgeType;
  displayName: string;
  description: string;
  icon: string; // URL
  iconPublicId: string;
  createdAt: string;
}
