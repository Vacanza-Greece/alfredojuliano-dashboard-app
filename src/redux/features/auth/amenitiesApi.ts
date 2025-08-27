// redux/features/auth/amenitiesApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import { Amenity, AmenityResponse, UpdateAmenityRequest } from "@/redux/types/amenity";

export const amenitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAmenities: builder.query<Amenity[], void>({
      query: () => "/onboarding/amenities",
      transformResponse: (response: AmenityResponse) => response.data,
      providesTags: ["Amenity"],
    }),

    createAmenity: builder.mutation<Amenity, FormData>({
      query: (formData) => ({
        url: "/onboarding/amenities",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Amenity"],
    }),

    updateAmenity: builder.mutation<Amenity, { id: string; data: UpdateAmenityRequest }>({
      query: ({ id, data }) => ({
        url: `/onboarding/amenities/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Amenity"],
    }),

    deleteAmenity: builder.mutation<Amenity, string>({
      query: (id) => ({
        url: `/onboarding/amenities/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Amenity"],
    }),
  }),
});

export const {
  useGetAmenitiesQuery,
  useCreateAmenityMutation,
  useUpdateAmenityMutation,
  useDeleteAmenityMutation,
} = amenitiesApi;