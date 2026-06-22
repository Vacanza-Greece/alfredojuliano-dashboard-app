import { baseApi } from "@/redux/hooks/baseApi";
import { LoginResponse } from "@/redux/types/venue.type";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { email: string; password: string }>(
      {
        query: (userInfo) => ({
          url: "auth/login",
          method: "POST",
          body: userInfo,
        }),
      }
    ),

    //added commit for no reason....

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
        headers: {
          Authorization: `Bearer ${typeof window !== "undefined"
            ? localStorage.getItem("token") || ""
            : ""
            }`,
        },
        body: {},
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;

// import { baseApi } from "@/redux/hooks/baseApi";

// const autApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     login: builder.mutation({
//       query: (userInfo) => ({
//         url: "auth/login",
//         method: "POST",
//         body: userInfo,
//       }),
//     }),
//   }),
// });

// export const { useLoginMutation } = autApi;
