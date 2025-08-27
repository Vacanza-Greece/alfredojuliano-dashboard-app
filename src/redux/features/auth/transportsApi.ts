import { baseApi } from "@/redux/hooks/baseApi";
import { Transport, TransportResponse, UpdateTransportRequest } from "@/redux/types/transport";


export const transportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransports: builder.query<Transport[], void>({
      query: () => "/onboarding/transports",
      transformResponse: (response: TransportResponse) => response.data,
      providesTags: ["Transport"],
    }),

    createTransport: builder.mutation<Transport, FormData>({
      query: (formData) => ({
        url: "/onboarding/transports",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Transport"],
    }),

    updateTransport: builder.mutation<
      Transport,
      { id: string; data: UpdateTransportRequest }
    >({
      query: ({ id, data }) => ({
        url: `/onboarding/transports/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Transport"],
    }),

    deleteTransport: builder.mutation<Transport, string>({
      query: (id) => ({
        url: `/onboarding/transports/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Transport"],
    }),
  }),
});

export const {
  useGetTransportsQuery,
  useCreateTransportMutation,
  useUpdateTransportMutation,
  useDeleteTransportMutation,
} = transportsApi;
