import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import quicksaveService from "../../services/quicksaveService";

// Async thunks
export const fetchQuicksaveBalance = createAsyncThunk(
  "quicksave/fetchBalance",
  async (_, { rejectWithValue }) => {
    try {
      const data = await quicksaveService.getBalance();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchQuicksaveTransactions = createAsyncThunk(
  "quicksave/fetchTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await quicksaveService.getTransactions();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWalletBalance = createAsyncThunk(
  "quicksave/fetchWalletBalance",
  async (_, { rejectWithValue }) => {
    try {
      const data = await quicksaveService.getWalletBalance();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveToQuicksave = createAsyncThunk(
  "quicksave/save",
  async (amount, { rejectWithValue, dispatch }) => {
    try {
      const data = await quicksaveService.save(amount);
      // Refresh balances and transactions after successful save
      dispatch(fetchQuicksaveBalance());
      dispatch(fetchWalletBalance());
      dispatch(fetchQuicksaveTransactions());
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const withdrawFromQuicksave = createAsyncThunk(
  "quicksave/withdraw",
  async (amount, { rejectWithValue, dispatch }) => {
    try {
      const data = await quicksaveService.withdraw(amount);
      // Refresh balances and transactions after successful withdrawal
      dispatch(fetchQuicksaveBalance());
      dispatch(fetchWalletBalance());
      dispatch(fetchQuicksaveTransactions());
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  balance: 0,
  walletBalance: 0,
  transactions: [],
  activeTab: "save",
  isLoading: false,
  isSubmitting: false,
  error: null,
  success: null,
};

const quicksaveSlice = createSlice({
  name: "quicksave",
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchQuicksaveBalance
      .addCase(fetchQuicksaveBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuicksaveBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.balance;
      })
      .addCase(fetchQuicksaveBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Handle fetchQuicksaveTransactions
      .addCase(fetchQuicksaveTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuicksaveTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
      })
      .addCase(fetchQuicksaveTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Handle fetchWalletBalance
      .addCase(fetchWalletBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.walletBalance = action.payload.balance;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Handle saveToQuicksave
      .addCase(saveToQuicksave.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.success = null;
      })
      .addCase(saveToQuicksave.fulfilled, (state) => {
        state.isSubmitting = false;
        state.success = "Successfully saved to Quicksave";
      })
      .addCase(saveToQuicksave.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Handle withdrawFromQuicksave
      .addCase(withdrawFromQuicksave.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.success = null;
      })
      .addCase(withdrawFromQuicksave.fulfilled, (state) => {
        state.isSubmitting = false;
        state.success = "Successfully withdrawn from Quicksave";
      })
      .addCase(withdrawFromQuicksave.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveTab, clearMessages } = quicksaveSlice.actions;

export default quicksaveSlice.reducer;
