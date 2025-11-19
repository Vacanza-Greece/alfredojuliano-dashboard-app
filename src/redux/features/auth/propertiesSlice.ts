import { Property } from "@/redux/types/property";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PropertiesState {
  properties: Property[];
  selectedProperty: Property | null;
  loading: boolean;
  error: string | null;
  filters: {
    country: string;
    propertyType: string;
    isAvailable: boolean | null;
  };
}

const initialState: PropertiesState = {
  properties: [],
  selectedProperty: null,
  loading: false,
  error: null,
  filters: {
    country: "",
    propertyType: "",
    isAvailable: null,
  },
};

const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    setProperties: (state, action: PayloadAction<Property[]>) => {
      state.properties = action.payload;
    },
    setSelectedProperty: (state, action: PayloadAction<Property | null>) => {
      state.selectedProperty = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<PropertiesState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        country: "",
        propertyType: "",
        isAvailable: null,
      };
    },
    deleteProperty: (state, action: PayloadAction<string>) => {
      state.properties = state.properties.filter(
        (property) => property.id !== action.payload
      );
    },
  },
});

export const {
  setProperties,
  setSelectedProperty,
  setLoading,
  setError,
  setFilters,
  clearFilters,
  deleteProperty,
} = propertiesSlice.actions;

export default propertiesSlice.reducer;
