import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import safelockService from "../../services/safelockService";

// Async thunks
export const fetchSafelockData = createAsyncThunk(
  "safelock/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await safelockService.getSafelockData();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSafelock = createAsyncThunk(
  "safelock/create",
  async (safelockData, { rejectWithValue }) => {
    try {
      const response = await safelockService.createSafelock(safelockData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const breakSafelock = createAsyncThunk(
  "safelock/break",
  async (safelockId, { rejectWithValue }) => {
    try {
      const response = await safelockService.breakSafelock(safelockId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  activeTab: "create",
  totalBalance: 0,
  walletBalance: 0,
  activeLocks: 0,
  activeSafelocks: [],
  completedSafelocks: [],
  transactions: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const safelockSlice = createSlice({
  name: "safelock",
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSafelockData reducers
      .addCase(fetchSafelockData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSafelockData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.totalBalance = action.payload.totalBalance;
        state.walletBalance = action.payload.walletBalance;
        state.activeLocks = action.payload.activeLocks;
        state.activeSafelocks = action.payload.activeSafelocks;
        state.completedSafelocks = action.payload.completedSafelocks;
        state.transactions = action.payload.transactions;
      })
      .addCase(fetchSafelockData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // createSafelock reducers
      .addCase(createSafelock.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createSafelock.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.activeSafelocks = [
          action.payload.safelock,
          ...state.activeSafelocks,
        ];
        state.totalBalance += action.payload.safelock.amount;
        state.walletBalance -= action.payload.safelock.amount;
        state.activeLocks = state.activeSafelocks.length;
        state.transactions = [
          action.payload.transaction,
          ...state.transactions,
        ];
        state.activeTab = "manage"; // Switch to manage tab after creation
      })
      .addCase(createSafelock.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // breakSafelock reducers
      .addCase(breakSafelock.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(breakSafelock.fulfilled, (state, action) => {
        state.isSubmitting = false;

        // Remove from active and add to completed
        state.activeSafelocks = state.activeSafelocks.filter(
          (safelock) => safelock.id !== action.payload.safelockId
        );
        state.completedSafelocks = [
          action.payload.completedSafelock,
          ...state.completedSafelocks,
        ];

        // Update balances
        state.totalBalance -= action.payload.completedSafelock.amount;
        state.walletBalance += action.payload.completedSafelock.payoutAmount;
        state.activeLocks = state.activeSafelocks.length;

        // Add transaction
        state.transactions = [
          action.payload.transaction,
          ...state.transactions,
        ];
      })
      .addCase(breakSafelock.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveTab } = safelockSlice.actions;

export default safelockSlice.reducer;
