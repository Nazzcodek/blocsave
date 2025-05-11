import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import savingsServices from "../../services/savingsServices";

// Async thunk for fetching all savings products
export const fetchSavingsProducts = createAsyncThunk(
  "savings/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await savingsServices.getSavingsProducts();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch savings products"
      );
    }
  }
);

// Async thunk for QuickSave action
export const quickSave = createAsyncThunk(
  "savings/quickSave",
  async (amount, { rejectWithValue }) => {
    try {
      const response = await savingsServices.quickSave(amount);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to quick save");
    }
  }
);

// Async thunk for SafeLock action
export const createSafeLock = createAsyncThunk(
  "savings/createSafeLock",
  async (data, { rejectWithValue }) => {
    try {
      const response = await savingsServices.createSafeLock(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create safe lock"
      );
    }
  }
);

// Async thunk for AdSavings action
export const createAdSavings = createAsyncThunk(
  "savings/createAdSavings",
  async (data, { rejectWithValue }) => {
    try {
      const response = await savingsServices.createAdSavings(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create ad savings"
      );
    }
  }
);

const initialState = {
  quickSave: {
    balance: 0,
    interestRate: 0,
    loading: false,
    error: null,
  },
  safeLock: {
    balance: 0,
    interestRate: 0,
    loading: false,
    error: null,
  },
  adSavings: {
    balance: 0,
    interestRate: 0,
    loading: false,
    error: null,
  },
  loading: false,
  error: null,
};

const savingsSlice = createSlice({
  name: "savings",
  initialState,
  reducers: {
    clearSavingsError: (state) => {
      state.error = null;
      state.quickSave.error = null;
      state.safeLock.error = null;
      state.adSavings.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch savings products cases
      .addCase(fetchSavingsProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavingsProducts.fulfilled, (state, action) => {
        state.loading = false;

        // Update individual savings products
        if (action.payload.quickSave) {
          state.quickSave.balance = action.payload.quickSave.balance;
          state.quickSave.interestRate = action.payload.quickSave.interestRate;
        }

        if (action.payload.safeLock) {
          state.safeLock.balance = action.payload.safeLock.balance;
          state.safeLock.interestRate = action.payload.safeLock.interestRate;
        }

        if (action.payload.adSavings) {
          state.adSavings.balance = action.payload.adSavings.balance;
          state.adSavings.interestRate = action.payload.adSavings.interestRate;
        }
      })
      .addCase(fetchSavingsProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // QuickSave cases
      .addCase(quickSave.pending, (state) => {
        state.quickSave.loading = true;
        state.quickSave.error = null;
      })
      .addCase(quickSave.fulfilled, (state, action) => {
        state.quickSave.loading = false;
        state.quickSave.balance = action.payload.newBalance;
      })
      .addCase(quickSave.rejected, (state, action) => {
        state.quickSave.loading = false;
        state.quickSave.error = action.payload;
      })

      // SafeLock cases
      .addCase(createSafeLock.pending, (state) => {
        state.safeLock.loading = true;
        state.safeLock.error = null;
      })
      .addCase(createSafeLock.fulfilled, (state, action) => {
        state.safeLock.loading = false;
        state.safeLock.balance = action.payload.newBalance;
      })
      .addCase(createSafeLock.rejected, (state, action) => {
        state.safeLock.loading = false;
        state.safeLock.error = action.payload;
      })

      // AdSavings cases
      .addCase(createAdSavings.pending, (state) => {
        state.adSavings.loading = true;
        state.adSavings.error = null;
      })
      .addCase(createAdSavings.fulfilled, (state, action) => {
        state.adSavings.loading = false;
        state.adSavings.balance = action.payload.newBalance;
      })
      .addCase(createAdSavings.rejected, (state, action) => {
        state.adSavings.loading = false;
        state.adSavings.error = action.payload;
      });
  },
});

export const { clearSavingsError } = savingsSlice.actions;
export default savingsSlice.reducer;
