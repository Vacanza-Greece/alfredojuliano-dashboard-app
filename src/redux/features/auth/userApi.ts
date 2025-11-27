// src/redux/features/auth/userApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import { User } from "@/redux/types/user";

export enum BadgeType {
  REVIEW_BADGE = "REVIEW_BADGE",
  REGION_BADGE = "REGION_BADGE",
  SUSTAINABILITY_BADGE = "SUSTAINABILITY_BADGE",
  SEASONAL_BADGE = "SEASONAL_BADGE",
  EXCHANGE_BADGE = "EXCHANGE_BADGE",
  REFERRAL_BADGE = "REFERRAL_BADGE",
  VERIFICATION_BADGE = "VERIFICATION_BADGE",
  LOYALTY_BADGE = "LOYALTY_BADGE",
  EARLY_ADOPTER = "EARLY_ADOPTER",
  PREMIUM_TRAVELER = "PREMIUM_TRAVELER",
  TOP_SUPPORTER = "TOP_SUPPORTER",
  TRAVELER = "TRAVELER",
  SUPPORTER = "SUPPORTER",
  GOLDEN_HOST = "GOLDEN_HOST",
  VERIFIED = "VERIFIED",
  DUO = "DUO",
  LOTS_OF_FRIENDS = "LOTS_OF_FRIENDS",
  PURE_CHARISMA = "PURE_CHARISMA",
  VIP = "VIP",
  DIAMOND_VIP = "DIAMOND_VIP",
  THE_FIRST_TRADE = "THE_FIRST_TRADE",
  EXPERIENCED = "EXPERIENCED",
  VETERAN = "VETERAN",
  PHILOXENIA = "PHILOXENIA",
  IT_MY_TOWN = "IT_MY_TOWN",
  EMPIRE = "EMPIRE",
  EXPLORER = "EXPLORER",
  AUTUMN_TRAVELER = "AUTUMN_TRAVELER",
  AUTUMN_EXPERT_TRAVELER = "AUTUMN_EXPERT_TRAVELER",
  WINTER_TRAVELER = "WINTER_TRAVELER",
  WINTER_EXPERT_TRAVELER = "WINTER_EXPERT_TRAVELER",
  SPRING_TRAVELER = "SPRING_TRAVELER",
  SPRING_EXPERT_TRAVELER = "SPRING_EXPERT_TRAVELER",
  SUMMER_TRAVELER = "SUMMER_TRAVELER",
  SUMMER_EXPERT_TRAVELER = "SUMMER_EXPERT_TRAVELER",
  ECO_CONSCIOUS_HOST = "ECO_CONSCIOUS_HOST",
  EVERY_EURO_COUNTS = "EVERY_EURO_COUNTS",
  ATTICA = "ATTICA",
  ATTICA_EXPERT = "ATTICA_EXPERT",
  CENTRAL_GREECE = "CENTRAL_GREECE",
  CENTRAL_GREECE_EXPERT = "CENTRAL_GREECE_EXPERT",
  SPORADES = "SPORADES",
  SPORADES_EXPERT = "SPORADES_EXPERT",
  THRACE = "THRACE",
  THRACE_EXPERT = "THRACE_EXPERT",
  IONIAN = "IONIAN",
  IONIAN_EXPERT = "IONIAN_EXPERT",
  SARONIC = "SARONIC",
  SARONIC_EXPERT = "SARONIC_EXPERT",
  CRETE = "CRETE",
  CRETE_EXPERT = "CRETE_EXPERT",
  EPIRUS = "EPIRUS",
  EPIRUS_EXPERT = "EPIRUS_EXPERT",
  CYCLADES = "CYCLADES",
  CYCLADES_EXPERT = "CYCLADES_EXPERT",
  DODECANESE = "DODECANESE",
  DODECANESE_EXPERT = "DODECANESE_EXPERT",
  GREECE_TROTTER = "GREECE_TROTTER",
  PELOPONNESE = "PELOPONNESE",
  PELOPONNESE_EXPERT = "PELOPONNESE_EXPERT",
  NORTH_AEGEAN = "NORTH_AEGEAN",
  NORTH_AEGEAN_EXPERT = "NORTH_AEGEAN_EXPERT",
  MACEDONIA = "MACEDONIA",
  MACEDONIA_EXPERT = "MACEDONIA_EXPERT",
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query({
      query: () => ({
        url: "/user",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    getUserById: build.query<User, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "GET",
      }),
      providesTags: (_r, _e, id) => [{ type: "User", id }],
    }),

    deleteUser: build.mutation({
      query: (id: string) => ({
        url: `/user/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // ✅ Add update role mutation
    updateUserRole: build.mutation({
      query: ({ id, role }: { id: string; role: "USER" | "ADMIN" }) => ({
        url: `/user/update/${id}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["User"],
    }),

    // ✅ Add badge mutation
    giveBadge: build.mutation({
      query: ({ id, badgetype }: { id: string; badgetype: BadgeType }) => ({
        url: `/user/give-badge/${id}`,
        method: "PATCH",
        body: { badgetype },
      }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserRoleMutation, // ✅ Export mutation
  useGiveBadgeMutation, // ✅ Export mutation
  useGetUserByIdQuery,
} = userApi;

// // src/redux/features/auth/userApi.ts
// import { baseApi } from "@/redux/hooks/baseApi";

// export enum BadgeType {
//   REVIEW_BADGE = "REVIEW_BADGE",
//   REGION_BADGE = "REGION_BADGE",
//   SUSTAINABILITY_BADGE = "SUSTAINABILITY_BADGE",
//   SEASONAL_BADGE = "SEASONAL_BADGE",
//   EXCHANGE_BADGE = "EXCHANGE_BADGE",
//   REFERRAL_BADGE = "REFERRAL_BADGE",
//   VERIFICATION_BADGE = "VERIFICATION_BADGE",
//   LOYALTY_BADGE = "LOYALTY_BADGE",
//   EARLY_ADOPTER = "EARLY_ADOPTER",
//   PREMIUM_TRAVELER = "PREMIUM_TRAVELER",
//   TOP_SUPPORTER = "TOP_SUPPORTER",
//   TRAVELER = "TRAVELER",
//   SUPPORTER = "SUPPORTER",
//   GOLDEN_HOST = "GOLDEN_HOST",
//   VERIFIED = "VERIFIED",
//   DUO = "DUO",
//   LOTS_OF_FRIENDS = "LOTS_OF_FRIENDS",
//   PURE_CHARISMA = "PURE_CHARISMA",
//   VIP = "VIP",
//   DIAMOND_VIP = "DIAMOND_VIP",
//   THE_FIRST_TRADE = "THE_FIRST_TRADE",
//   EXPERIENCED = "EXPERIENCED",
//   VETERAN = "VETERAN",
//   PHILOXENIA = "PHILOXENIA",
//   IT_MY_TOWN = "IT_MY_TOWN",
//   EMPIRE = "EMPIRE",
//   EXPLORER = "EXPLORER",
//   AUTUMN_TRAVELER = "AUTUMN_TRAVELER",
//   AUTUMN_EXPERT_TRAVELER = "AUTUMN_EXPERT_TRAVELER",
//   WINTER_TRAVELER = "WINTER_TRAVELER",
//   WINTER_EXPERT_TRAVELER = "WINTER_EXPERT_TRAVELER",
//   SPRING_TRAVELER = "SPRING_TRAVELER",
//   SPRING_EXPERT_TRAVELER = "SPRING_EXPERT_TRAVELER",
//   SUMMER_TRAVELER = "SUMMER_TRAVELER",
//   SUMMER_EXPERT_TRAVELER = "SUMMER_EXPERT_TRAVELER",
//   ECO_CONSCIOUS_HOST = "ECO_CONSCIOUS_HOST",
//   EVERY_EURO_COUNTS = "EVERY_EURO_COUNTS",
//   ATTICA = "ATTICA",
//   ATTICA_EXPERT = "ATTICA_EXPERT",
//   CENTRAL_GREECE = "CENTRAL_GREECE",
//   CENTRAL_GREECE_EXPERT = "CENTRAL_GREECE_EXPERT",
//   SPORADES = "SPORADES",
//   SPORADES_EXPERT = "SPORADES_EXPERT",
//   THRACE = "THRACE",
//   THRACE_EXPERT = "THRACE_EXPERT",
//   IONIAN = "IONIAN",
//   IONIAN_EXPERT = "IONIAN_EXPERT",
//   SARONIC = "SARONIC",
//   SARONIC_EXPERT = "SARONIC_EXPERT",
//   CRETE = "CRETE",
//   CRETE_EXPERT = "CRETE_EXPERT",
//   EPIRUS = "EPIRUS",
//   EPIRUS_EXPERT = "EPIRUS_EXPERT",
//   CYCLADES = "CYCLADES",
//   CYCLADES_EXPERT = "CYCLADES_EXPERT",
//   DODECANESE = "DODECANESE",
//   DODECANESE_EXPERT = "DODECANESE_EXPERT",
//   GREECE_TROTTER = "GREECE_TROTTER",
//   PELOPONNESE = "PELOPONNESE",
//   PELOPONNESE_EXPERT = "PELOPONNESE_EXPERT",
//   NORTH_AEGEAN = "NORTH_AEGEAN",
//   NORTH_AEGEAN_EXPERT = "NORTH_AEGEAN_EXPERT",
//   MACEDONIA = "MACEDONIA",
//   MACEDONIA_EXPERT = "MACEDONIA_EXPERT",
// }

// export const userApi = baseApi.injectEndpoints({
//   endpoints: (build) => ({
//     getUsers: build.query({
//       query: () => ({
//         url: "/user",
//         method: "GET",
//       }),
//       providesTags: ["User"],
//     }),

//     deleteUser: build.mutation({
//       query: (id: string) => ({
//         url: `/user/delete/${id}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: ["User"],
//     }),

//     // ✅ Add update role mutation
//     updateUserRole: build.mutation({
//       query: ({ id, role }: { id: string; role: "USER" | "ADMIN" }) => ({
//         url: `/user/update/${id}`,
//         method: "PATCH",
//         body: { role },
//       }),
//       invalidatesTags: ["User"],
//     }),

//     // ✅ Add badge mutation
//     giveBadge: build.mutation({
//       query: ({ id, badgetype }: { id: string; badgetype: BadgeType }) => ({
//         url: `/user/give-badge/${id}`,
//         method: "PATCH",
//         body: { badgetype },
//       }),
//       invalidatesTags: ["User"],
//     }),
//   }),
//   overrideExisting: false,
// });

// export const {
//   useGetUsersQuery,
//   useDeleteUserMutation,
//   useUpdateUserRoleMutation, // ✅ Export mutation
//   useGiveBadgeMutation, // ✅ Export mutation
// } = userApi;
