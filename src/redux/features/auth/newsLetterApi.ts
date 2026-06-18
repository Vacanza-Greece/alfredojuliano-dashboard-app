// src/redux/features/newsLetter/newsLetterApi.ts
import { baseApi } from "@/redux/hooks/baseApi";

export const newsLetterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /web-subscribe  -> list all subscribers
    getAllNewsletters: builder.query<
      Array<{ id: string; name?: string; email: string; createdAt?: string }>,
      void
    >({
      query: () => ({
        url: "/web-subscribe",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: "Message" as const, id: r.id })),
              { type: "Message" as const, id: "LIST" },
            ]
          : [{ type: "Message" as const, id: "LIST" }],
      transformResponse: (response: any) => {
        // Transform if server wraps response object (adjust if needed)
        // Example server response: { status:200, message:"...", data: [...] }
        if (response?.data) return response.data;
        return response;
      },
    }),

    // POST /web-subscribe -> add a new subscriber
    addNewsletter: builder.mutation<
      { id: string; name?: string; email: string },
      { name?: string; email: string }
    >({
      query: (body) => ({
        url: "/web-subscribe",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Message", id: "LIST" }],
      transformResponse: (response: any) => response?.data ?? response,
    }),

    // PATCH /web-subscribe/:id -> update subscriber
    updateNewsletter: builder.mutation<
      { id: string; name?: string; email: string },
      { id: string; name?: string; email?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/web-subscribe/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Message", id: "LIST" }],
      transformResponse: (response: any) => response?.data ?? response,
    }),

    // DELETE /web-subscribe/:id -> delete subscriber
    deleteNewsletter: builder.mutation<any, string>({
      query: (id) => ({
        url: `/web-subscribe/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Message", id: "LIST" }],
    }),

    // POST /web-subscribe/promotional-mail -> send promotional mail to all subscribers
    sendPromotionalMail: builder.mutation<
      any,
      { subject: string; message: string }
    >({
      query: (body) => ({
        url: "/web-subscribe/promotional-mail",
        method: "POST",
        body,
      }),
      // optional: invalidating tags not strictly needed, but we list it if server returns something we want to refresh
      invalidatesTags: [{ type: "Message", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllNewslettersQuery,
  useAddNewsletterMutation,
  useUpdateNewsletterMutation,
  useDeleteNewsletterMutation,
  useSendPromotionalMailMutation,
} = newsLetterApi;
