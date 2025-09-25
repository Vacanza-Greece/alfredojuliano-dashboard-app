// src/redux/features/plan/planApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import { Plan, PlanFormData } from "@/redux/types/venue.type";

export const planApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // -----------------------------
    // Get all plans
    // -----------------------------
    getPlans: build.query<Plan[], void>({
      query: () => ({
        url: "/plans",
        method: "GET",
      }),
      transformResponse: (response: { data: Plan[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Plan" as const, id })),
              { type: "Plan" },
            ]
          : [{ type: "Plan" }],
    }),

    // -----------------------------
    // Get plan by ID
    // -----------------------------
    getPlanById: build.query<Plan, string>({
      query: (id) => ({
        url: `/plans/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Plan", id }],
    }),

    // -----------------------------
    // Create new plan
    // -----------------------------
    createPlan: build.mutation<Plan, PlanFormData>({
      query: (data) => ({
        url: "/plans",
        method: "POST",
        body: {
          ...data,
          // Ensure features are flattened from translations if needed
          translations: data.translations.map((t) => ({
            ...t,
            features: t.features.filter(Boolean),
          })),
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Plan" }],
    }),

    // -----------------------------
    // Update existing plan
    // -----------------------------
    updatePlan: build.mutation<Plan, { id: string; data: PlanFormData }>({
      query: ({ id, data }) => ({
        url: `/plans/${id}`,
        method: "PATCH",
        body: {
          ...data,
          translations: data.translations.map((t) => ({
            ...t,
            features: t.features.filter(Boolean),
          })),
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Plan", id }],
    }),

    // -----------------------------
    // Delete plan
    // -----------------------------
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

// Export hooks for components
export const {
  useGetPlansQuery,
  useGetPlanByIdQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
} = planApi;



// import { baseApi } from "@/redux/hooks/baseApi";
// import { Plan, PlanFormData } from "@/redux/types/venue.type";

// export const planApi = baseApi.injectEndpoints({
//   endpoints: (build) => ({
//     getPlans: build.query<Plan[], void>({
//       query: () => ({
//         url: "/plans",
//         method: "GET",
//       }),
//       transformResponse: (response: { data: Plan[] }) => response.data, // unwrap the data
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.map(({ id }) => ({ type: "Plan" as const, id })),
//               { type: "Plan" },
//             ]
//           : [{ type: "Plan" }],
//     }),
//     getPlanById: build.query<Plan, string>({
//       query: (id) => ({
//         url: `/plans/${id}`,
//         method: "GET",
//       }),
//       providesTags: (_result, _error, id) => [{ type: "Plan", id }],
//     }),
//     createPlan: build.mutation<Plan, PlanFormData>({
//       query: ({ isPopular, ...data }) => ({
//         url: "/plans",
//         method: "POST",
//         body: {
//           ...data,
//           price: Number(data.price),
//           features: data.features?.filter(Boolean) || [],
//         },
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }),
//       invalidatesTags: [{ type: "Plan" }],
//     }),

//     updatePlan: build.mutation<Plan, { id: string; data: PlanFormData }>({
//       query: ({ id, data }) => ({
//         url: `/plans/${id}`,
//         method: "PATCH",
//         body: data,
//       }),
//       invalidatesTags: (_result, _error, { id }) => [{ type: "Plan", id }],
//     }),

//     deletePlan: build.mutation<void, string>({
//       query: (id) => ({
//         url: `/plans/${id}`,
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }),
//       invalidatesTags: (_result, _error, id) => [{ type: "Plan", id }],
//     }),
//   }),
// });

// export const {
//   useGetPlansQuery,
//   useGetPlanByIdQuery,
//   useCreatePlanMutation,
//   useUpdatePlanMutation,
//   useDeletePlanMutation,
// } = planApi;
