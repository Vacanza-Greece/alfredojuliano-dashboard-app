import { baseApi } from "@/redux/hooks/baseApi";
import {
  DeletePropertyResponse,
  PropertiesResponse,
  Property,
} from "@/redux/types/property";

export const propertiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query<PropertiesResponse, void>({
      query: () => "/property",
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
      { id: string; data: Partial<Property> }
    >({
      query: ({ id, data }) => ({
        url: `/property/${id}`,
        method: "PUT",
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
