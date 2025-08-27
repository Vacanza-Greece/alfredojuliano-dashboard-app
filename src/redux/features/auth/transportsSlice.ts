
import { Transport } from "@/redux/types/transport";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TransportsState {
  transports: Transport[];
  selectedTransport: Transport | null;
  loading: boolean;
  error: string | null;
}

const initialState: TransportsState = {
  transports: [],
  selectedTransport: null,
  loading: false,
  error: null,
};

const transportsSlice = createSlice({
  name: "transports",
  initialState,
  reducers: {
    setTransports: (state, action: PayloadAction<Transport[]>) => {
      state.transports = action.payload;
    },
    setSelectedTransport: (state, action: PayloadAction<Transport | null>) => {
      state.selectedTransport = action.payload;
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
  setTransports,
  setSelectedTransport,
  setLoading,
  setError,
  clearError,
} = transportsSlice.actions;

export default transportsSlice.reducer;
