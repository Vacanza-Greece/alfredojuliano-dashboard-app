import { baseApi } from "@/redux/hooks/baseApi";
import {
  DeletePropertyResponse,
  PropertiesResponse,
  Property,
} from "@/redux/types/property";

export const propertiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query<PropertiesResponse, { limit?: number; page?: number } | void>({
      query: (params) => {
        const limit = params?.limit ?? 9999;
        const page = params?.page ?? 1;
        return `/property?limit=${limit}&page=${page}`;
      },
      providesTags: ["Property"],
    }),

    getPropertyById: builder.query<Property, string>({
      query: (id) => `/property/${id}`,
      providesTags: (result, error, id) => [{ type: "Property", id }],
    }),

    deleteProperty: builder.mutation<DeletePropertyResponse, string>({
      query: (id) => ({
        url: `/property/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Property"],
    }),

    createProperty: builder.mutation<Property, Partial<Property>>({
      query: (propertyData) => ({
        url: "/property",
        method: "POST",
        body: propertyData,
      }),
      invalidatesTags: ["Property"],
    }),

    updateProperty: builder.mutation<
      Property,
      { id: string; data: any }
    >({
      query: ({ id, data }) => ({
        url: `/property/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Property", id }],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetPropertyByIdQuery,
  useDeletePropertyMutation,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
} = propertiesApi;
