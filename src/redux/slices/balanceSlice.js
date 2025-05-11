import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import balanceService from "../../services/balanceService";

// Async thunk for fetching wallet balance
export const fetchWalletBalance = createAsyncThunk(
  "balance/fetchWallet",
  async (_, { rejectWithValue }) => {
    try {
      const response = await balanceService.getWalletBalance();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch wallet balance"
      );
    }
  }
);

// Async thunk for fetching savings balance
export const fetchSavingsBalance = createAsyncThunk(
  "balance/fetchSavings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await balanceService.getSavingsBalance();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch savings balance"
      );
    }
  }
);

// Async thunk for funding account
export const fundWallet = createAsyncThunk(
  "balance/fundWallet",
  async (amount, { rejectWithValue }) => {
    try {
      const response = await balanceService.fundAccount(amount);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fund wallet");
    }
  }
);

// Async thunk for withdrawing from account
export const withdrawFromWallet = createAsyncThunk(
  "balance/withdrawFromWallet",
  async (amount, { rejectWithValue }) => {
    try {
      const response = await balanceService.withdrawFromWallet(amount);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to withdraw from wallet"
      );
    }
  }
);

const initialState = {
  walletBalance: {
    amount: 0,
    currency: "USDC",
    loading: false,
    error: null,
  },
  savingsBalance: {
    amount: 0,
    currency: "USDC",
    loading: false,
    error: null,
  },
};

const balanceSlice = createSlice({
  name: "balance",
  initialState,
  reducers: {
    clearBalanceError: (state) => {
      state.walletBalance.error = null;
      state.savingsBalance.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Wallet balance cases
      .addCase(fetchWalletBalance.pending, (state) => {
        state.walletBalance.loading = true;
        state.walletBalance.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.walletBalance.loading = false;
        state.walletBalance.amount = action.payload.amount;
        state.walletBalance.currency = action.payload.currency;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.walletBalance.loading = false;
        state.walletBalance.error = action.payload;
      })

      // Savings balance cases
      .addCase(fetchSavingsBalance.pending, (state) => {
        state.savingsBalance.loading = true;
        state.savingsBalance.error = null;
      })
      .addCase(fetchSavingsBalance.fulfilled, (state, action) => {
        state.savingsBalance.loading = false;
        state.savingsBalance.amount = action.payload.amount;
        state.savingsBalance.currency = action.payload.currency;
      })
      .addCase(fetchSavingsBalance.rejected, (state, action) => {
        state.savingsBalance.loading = false;
        state.savingsBalance.error = action.payload;
      })

      // Fund wallet cases
      .addCase(fundWallet.fulfilled, (state, action) => {
        state.walletBalance.amount = action.payload.newBalance;
      })

      // Withdraw wallet cases
      .addCase(withdrawFromWallet.fulfilled, (state, action) => {
        state.walletBalance.amount = action.payload.newBalance;
      });
  },
});

export const { clearBalanceError } = balanceSlice.actions;
export default balanceSlice.reducer;
