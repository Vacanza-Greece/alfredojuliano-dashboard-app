import { baseApi } from "@/redux/hooks/baseApi";
import { Plan, PlanFormData } from "@/redux/types/venue.type";

export const planApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPlans: build.query<Plan[], void>({
      query: () => ({
        url: "/plans",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Plan" as const, id })),
              { type: "Plan" },
            ]
          : [{ type: "Plan" }],
    }),
    getPlanById: build.query<Plan, string>({
      query: (id) => ({
        url: `/plans/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Plan", id }],
    }),
    createPlan: build.mutation<Plan, PlanFormData>({
      query: ({ isPopular, ...data }) => ({
        url: "/plans",
        method: "POST",
        body: {
          ...data,
          price: Number(data.price),
          features: data.features?.filter(Boolean) || [],
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Plan" }],
    }),

    updatePlan: build.mutation<
      Plan,
      { id: string; data: Partial<PlanFormData> }
    >({
      query: ({ id, data }) => ({
        url: `/plans/${id}`,
        method: "PATCH",
        body: {
          ...data,
          price: data.price !== undefined ? Number(data.price) : undefined,
          features: data.features ? data.features.filter(Boolean) : undefined,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Plan", id },
        { type: "Plan" },
      ],
    }),

    deletePlan: build.mutation<void, string>({
      query: (id) => ({
        url: `/plans/${id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Plan", id }],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetPlanByIdQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
} = planApi;
