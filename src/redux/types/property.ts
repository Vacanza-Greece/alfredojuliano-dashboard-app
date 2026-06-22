export interface PropertyImage {
  url: string;
  publicId: string;
}

export interface Owner {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  photo: string;
  age: number | null;
  dateOfBirth: string | null;
  identification: string | null;
  languagePreference: string | null;
  city: string;
  password: string;
  resetToken: string | null;
  resetTokenExpiry: string | null;
  isSubscribed: boolean;
  paymentCardNumber: string[];
  role: string;
  createdAt: string;
  updatedAt: string;
  referralCode: string;
  referredBy: string | null;
  balance: number;
  totalReferrals: number;
  totalListed: number;
  totalExchange: number;
  hasOnboarded: boolean;
  isSuspended: boolean;
  suspensionReason: string | null;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  greek_name: string;
}

export interface Transport {
  id: string;
  name: string;
  icon: string;
  greek_name: string;
}

export interface Surrounding {
  id: string;
  name: string;
  icon: string;
  greek_name: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  country: string;
  price: number;
  size: number;
  bedrooms: number;
  isExchanged: boolean | null;
  bathrooms: number;
  images: PropertyImage[];
  propertyType: "HOME" | "APARTMENT" | "VILLA" | "CONDO";
  maxPeople: number;
  isAvailable: boolean;
  isTravelWithPets: boolean;
  ownerId: string;
  isDeleted: boolean;
  averageRating: number;
  reviewCount: number;
  availabilityStartDate: string | null;
  availabilityEndDate: string | null;
  createdAt: string;
  updatedAt: string;
  owner: Owner;
  amenities: Amenity[];
  transports: Transport[];
  surroundings: Surrounding[];
  coverImage?: string | null;
}

export interface PropertiesResponse {
  data: Property[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DeletePropertyResponse {
  message: string;
}
