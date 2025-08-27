import { baseApi } from "@/redux/hooks/baseApi";
import { Surrounding, SurroundingResponse, UpdateSurroundingRequest } from "@/redux/types/surrounding";


export const surroundingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSurroundings: builder.query<Surrounding[], void>({
      query: () => "/onboarding/surroundings",
      transformResponse: (response: SurroundingResponse) => response.data,
      providesTags: ["Surrounding"],
    }),

    createSurrounding: builder.mutation<Surrounding, FormData>({
      query: (formData) => ({
        url: "/onboarding/surroundings",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Surrounding"],
    }),

    updateSurrounding: builder.mutation<
      Surrounding,
      { id: string; data: UpdateSurroundingRequest }
    >({
      query: ({ id, data }) => ({
        url: `/onboarding/surroundings/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Surrounding"],
    }),

    deleteSurrounding: builder.mutation<Surrounding, string>({
      query: (id) => ({
        url: `/onboarding/surroundings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Surrounding"],
    }),
  }),
});

export const {
  useGetSurroundingsQuery,
  useCreateSurroundingMutation,
  useUpdateSurroundingMutation,
  useDeleteSurroundingMutation,
} = surroundingsApi;
