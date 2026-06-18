// src/redux/features/newsLetter/newsLetterSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Newsletter = {
  id?: string;
  name?: string;
  email: string;
  createdAt?: string;
};

type State = {
  selectedNewsletter: Newsletter | null;
};

const initialState: State = {
  selectedNewsletter: null,
};

const newsLetterSlice = createSlice({
  name: "newsLetter",
  initialState,
  reducers: {
    setSelectedNewsletter(state, action: PayloadAction<Newsletter | null>) {
      state.selectedNewsletter = action.payload;
    },
    clearSelectedNewsletter(state) {
      state.selectedNewsletter = null;
    },
  },
});

export const { setSelectedNewsletter, clearSelectedNewsletter } =
  newsLetterSlice.actions;

export default newsLetterSlice.reducer;
