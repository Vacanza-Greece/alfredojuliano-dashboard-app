// redux/features/auth/amenitiesSlice.ts
import { Amenity } from "@/redux/types/amenity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AmenitiesState {
  amenities: Amenity[];
  selectedAmenity: Amenity | null;
  loading: boolean;
  error: string | null;
}

const initialState: AmenitiesState = {
  amenities: [],
  selectedAmenity: null,
  loading: false,
  error: null,
};

const amenitiesSlice = createSlice({
  name: "amenities",
  initialState,
  reducers: {
    setAmenities: (state, action: PayloadAction<Amenity[]>) => {
      state.amenities = action.payload;
    },
    setSelectedAmenity: (state, action: PayloadAction<Amenity | null>) => {
      state.selectedAmenity = action.payload;
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
  setAmenities,
  setSelectedAmenity,
  setLoading,
  setError,
  clearError,
} = amenitiesSlice.actions;

export default amenitiesSlice.reducer;
