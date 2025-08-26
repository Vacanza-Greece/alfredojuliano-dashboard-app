import { baseApi } from "@/redux/hooks/baseApi";
import {
  ChatMessage,
  CreateExchangeRequest,
  ExchangeRequest,
  UpdateExchangeRequest,
} from "@/redux/types/auth.type";

export const exchangeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExchangeRequests: builder.query<ExchangeRequest[], void>({
      query: () => "/exchange-request",
      providesTags: ["ExchangeRequest"],
    }),

    getExchangeRequestById: builder.query<ExchangeRequest, string>({
      query: (id) => `/exchange-request/${id}`,
      providesTags: (result, error, id) => [{ type: "ExchangeRequest", id }],
    }),

    createExchangeRequest: builder.mutation<
      ExchangeRequest,
      CreateExchangeRequest
    >({
      query: (body) => ({
        url: "/exchange-request",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ExchangeRequest"],
    }),

    updateExchangeRequest: builder.mutation<
      ExchangeRequest,
      { id: string; data: UpdateExchangeRequest }
    >({
      query: ({ id, data }) => ({
        url: `/exchange-request/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ExchangeRequest", id },
        "ExchangeRequest",
      ],
    }),

    deleteExchangeRequest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/exchange-request/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ExchangeRequest"],
    }),

    sendMessage: builder.mutation<
      ChatMessage,
      { exchangeRequestId: string; message: string }
    >({
      query: ({ exchangeRequestId, message }) => ({
        url: `/exchange-request/${exchangeRequestId}/message`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: (result, error, { exchangeRequestId }) => [
        { type: "ExchangeRequest", id: exchangeRequestId },
      ],
    }),
  }),
});

export const {
  useGetExchangeRequestsQuery,
  useGetExchangeRequestByIdQuery,
  useCreateExchangeRequestMutation,
  useUpdateExchangeRequestMutation,
  useDeleteExchangeRequestMutation,
  useSendMessageMutation,
} = exchangeApi;
