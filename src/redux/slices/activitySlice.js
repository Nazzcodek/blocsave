import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import savingsServices from "../../services/savingsServices";

// Async thunk for fetching activity history
export const fetchActivityHistory = createAsyncThunk(
  "activity/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await savingsServices.getActivityHistory();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch activity history"
      );
    }
  }
);

const initialState = {
  transactions: [],
  loading: false,
  error: null,
};

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    clearActivityError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchActivityHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearActivityError } = activitySlice.actions;
export default activitySlice.reducer;
