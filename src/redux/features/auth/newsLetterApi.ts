// src/redux/features/newsLetter/newsLetterApi.ts
import { baseApi } from "@/redux/hooks/baseApi";

export const newsLetterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /web-subscribe  -> list all subscribers
    getAllNewsletters: builder.query<
      Array<{ id: string; email: string; createdAt?: string }>,
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
      { id: string; email: string },
      { email: string }
    >({
      query: (body) => ({
        url: "/web-subscribe",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Message", id: "LIST" }],
      transformResponse: (response: any) => response?.data ?? response,
    }),

    // DELETE -> delete subscriber by id OR by email
    // If caller passes an id (uuid), we call /web-subscribe/{id}
    // If the param looks like an email (contains @) call /web-subscribe?email=<email>
    deleteNewsletter: builder.mutation<any, string>({
      query: (idOrEmail) => {
        const looksLikeEmail = idOrEmail.includes("@");
        if (looksLikeEmail) {
          return {
            url: `/web-subscribe?email=${encodeURIComponent(idOrEmail)}`,
            method: "DELETE",
          };
        } else {
          return {
            url: `/web-subscribe/${encodeURIComponent(idOrEmail)}`,
            method: "DELETE",
          };
        }
      },
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
  useDeleteNewsletterMutation,
  useSendPromotionalMailMutation,
} = newsLetterApi;
