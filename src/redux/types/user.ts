// src/types/user.ts
export interface AchievementBadge {
  id: string;
  type: string;
  displayName: string;
  greek_displayName?: string | null;
  description?: string | null;
  badge_type?: string | null;
  greek_discription?: string | null;
  icon?: string | null;
  iconPublicId?: string | null;
  createdAt?: string | null;
}

export interface Onboarding {
  id: string;
  userId: string;
  homeAddress?: string | null;
  destination?: string | null;
  ageRange?: string | null;
  gender?: string | null;
  employmentStatus?: string | null;
  travelType?: string[] | null;
  favoriteDestinations?: string[] | null;
  travelMostlyWith?: string | null;
  isTravelWithPets?: boolean;
  address: string;
  notes?: string | null;
  maxPeople?: number | null;
  propertyType?: string | null;
  isMainResidence?: boolean;
  homeName?: string | null;
  homeDescription?: string | null;
  aboutNeighborhood?: string | null;
  homeImages?: string[] | null;
  isAvailableForExchange?: boolean;
  availabilityStartDate?: string | null;
  availabilityEndDate?: string | null;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  photo: string | null;
  role: "USER" | "ADMIN";
  isSubscribed: boolean;
  createdAt: string;
  updatedAt: string;
  // extra from swagger response:
  age?: number | null;
  dateOfBirth?: string | null;
  languagePreference?: string | null;
  city?: string | null;
  referralCode?: string | null;
  referredBy?: string | null;
  balance?: number;
  totalReferrals?: number;
  totalListed?: number;
  totalExchange?: number;
  hasOnboarded?: boolean;
  isSuspended?: boolean;
  suspensionReason?: string | null;
  achievementBadges?: AchievementBadge[];
  onboarding?: Onboarding | null;
  identification?: string | null;
  subscriptions?: {
    planId?: string;
    [key: string]: any;
  }[];
}
