// src/redux/features/auth/badgeApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import { Badge, BadgeType } from "@/redux/types/badge.type";

export const badgeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBadges: builder.query<Badge[], void>({
      query: () => "/badges",
      providesTags: ["Badge"],
    }),
    getUserBadges: builder.query<Badge[], string>({
      query: (userId) => `/badges/user/${userId}`,
      providesTags: ["Badge"],
    }),
    createBadge: builder.mutation<Badge, FormData>({
      query: (data) => ({
        url: "/badges",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Badge"],
    }),
    updateBadge: builder.mutation<Badge, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/badges/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Badge"],
    }),
    deleteBadge: builder.mutation<Badge, string>({
      query: (id) => ({
        url: `/badges/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Badge"],
    }),
  }),
});

export const {
  useGetBadgesQuery,
  useGetUserBadgesQuery,
  useCreateBadgeMutation,
  useUpdateBadgeMutation,
  useDeleteBadgeMutation,
} = badgeApi;
