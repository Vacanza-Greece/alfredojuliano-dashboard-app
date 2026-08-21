// src/redux/features/auth/vacanzaProtectApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import {
  ProtectPlan,
  ProtectPlanType,
  ProtectPurchase,
  ProtectPurchasesResponse,
  ProtectPurchaseStatus,
} from "@/redux/types/protect.type";

interface ApiEnvelope<T> {
  status: number;
  message: string;
  data: T;
}

export const vacanzaProtectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProtectPurchases: builder.query<
      ProtectPurchasesResponse,
      { status?: ProtectPurchaseStatus; planType?: ProtectPlanType } | void
    >({
      query: (filters) => ({
        url: "/vacanza-protect/purchases",
        method: "GET",
        params: {
          ...(filters && filters.status ? { status: filters.status } : {}),
          ...(filters && filters.planType ? { planType: filters.planType } : {}),
        },
      }),
      transformResponse: (response: ApiEnvelope<ProtectPurchasesResponse>) =>
        response.data,
      providesTags: ["ProtectPurchase"],
    }),

    getProtectPurchase: builder.query<ProtectPurchase, string>({
      query: (id) => ({
        url: `/vacanza-protect/purchases/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<ProtectPurchase>) =>
        response.data,
      providesTags: ["ProtectPurchase"],
    }),

    getProtectPlans: builder.query<ProtectPlan[], void>({
      query: () => ({
        url: "/vacanza-protect/plans",
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<ProtectPlan[]>) => response.data,
      providesTags: ["ProtectPlan"],
    }),

    updateProtectPlan: builder.mutation<
      ProtectPlan,
      {
        id: string;
        data: Partial<Pick<ProtectPlan, "price" | "coverAmount" | "priceId" | "isActive">>;
      }
    >({
      query: ({ id, data }) => ({
        url: `/vacanza-protect/plans/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiEnvelope<ProtectPlan>) => response.data,
      invalidatesTags: ["ProtectPlan"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProtectPurchasesQuery,
  useGetProtectPurchaseQuery,
  useGetProtectPlansQuery,
  useUpdateProtectPlanMutation,
} = vacanzaProtectApi;
