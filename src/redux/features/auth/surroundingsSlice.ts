import { Surrounding } from "@/redux/types/surrounding";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SurroundingsState {
  surroundings: Surrounding[];
  selectedSurrounding: Surrounding | null;
  loading: boolean;
  error: string | null;
}

const initialState: SurroundingsState = {
  surroundings: [],
  selectedSurrounding: null,
  loading: false,
  error: null,
};

const surroundingsSlice = createSlice({
  name: "surroundings",
  initialState,
  reducers: {
    setSurroundings: (state, action: PayloadAction<Surrounding[]>) => {
      state.surroundings = action.payload;
    },
    setSelectedSurrounding: (
      state,
      action: PayloadAction<Surrounding | null>
    ) => {
      state.selectedSurrounding = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSurroundings,
  setSelectedSurrounding,
  setLoading,
  setError,
  clearError,
} = surroundingsSlice.actions;

export default surroundingsSlice.reducer;
