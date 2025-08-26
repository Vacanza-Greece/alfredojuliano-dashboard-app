import { ExchangeRequest } from "@/redux/types/auth.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ExchangeState {
  selectedRequest: ExchangeRequest | null;
  filters: {
    status: string;
    search: string;
  };
  isChatOpen: boolean;
}

const initialState: ExchangeState = {
  selectedRequest: null,
  filters: {
    status: "ALL",
    search: "",
  },
  isChatOpen: false,
};

const exchangeSlice = createSlice({
  name: "exchange",
  initialState,
  reducers: {
    setSelectedRequest: (state, action: PayloadAction<ExchangeRequest | null>) => {
      state.selectedRequest = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    toggleChat: (state) => {
      state.isChatOpen = !state.isChatOpen;
    },
    closeChat: (state) => {
      state.isChatOpen = false;
    },
    openChat: (state) => {
      state.isChatOpen = true;
    },
    clearFilters: (state) => {
      state.filters = {
        status: "ALL",
        search: "",
      };
    },
  },
});

export const {
  setSelectedRequest,
  setStatusFilter,
  setSearchFilter,
  toggleChat,
  closeChat,
  openChat,
  clearFilters,
} = exchangeSlice.actions;

export default exchangeSlice.reducer;