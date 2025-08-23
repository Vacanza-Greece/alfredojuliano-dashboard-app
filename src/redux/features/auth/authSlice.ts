import { AppRootState } from "@/redux/store";
import { TAuth, User } from "@/redux/types/venue.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: TAuth = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setUser, logOut } = authSlice.actions;
export default authSlice.reducer;

export const useCurrentToken = (state: AppRootState) => state.auth.token;
export const useCurrentUser = (state: AppRootState) => state.auth.user;

// import { AppRootState } from "@/redux/store";
// import { TAuth } from "@/redux/types/auth.type";
// import { createSlice } from "@reduxjs/toolkit";

// const initialState: TAuth = {
//   user: null,
//   token: null,
// };
// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setUser: (state, action) => {
//       const { user, token } = action.payload;
//       state.user = user;
//       state.token = token;
//     },
//     logOut: (state) => {
//       state.user = null;
//       state.token = null;
//     },
//   },
// });

// export const { setUser, logOut } = authSlice.actions;
// export default authSlice.reducer;
// // directly pass userInfod
// export const useCurrentToken = (state: AppRootState) => state.auth.token;
// export const useCurrentUser = (state: AppRootState) => state.auth.user;
