// src/redux/features/auth/badgeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Badge } from "@/redux/types/badge.type";

interface BadgeState {
  selectedBadge: Badge | null;
}

const initialState: BadgeState = {
  selectedBadge: null,
};

export const badgeSlice = createSlice({
  name: "badge",
  initialState,
  reducers: {
    setSelectedBadge: (state, action: PayloadAction<Badge>) => {
      state.selectedBadge = action.payload;
    },
    clearSelectedBadge: (state) => {
      state.selectedBadge = null;
    },
  },
});

export const { setSelectedBadge, clearSelectedBadge } = badgeSlice.actions;

export default badgeSlice.reducer;
