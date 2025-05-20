import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createSafelockAddress,
  safeLockToken,
  withdrawSafeLock,
} from "../../services/blockchain/useSafeLock";
import {
  getLockedSaving,
  getWithdrawalHistory,
  getAllTransactionHistory,
} from "../../services/blockchain/useSafeLockHistory";
import { getWalletUSDCBalance } from "../../services/blockchain/useWalletUSDCBalance";

// Async thunks
export const fetchSafelockData = createAsyncThunk(
  "safelock/fetchData",
  async (embeddedWallet, { rejectWithValue }) => {
    try {
      if (!embeddedWallet) {
        return rejectWithValue("Wallet not connected");
      }

      // Get the user's USDC wallet balance
      const walletBalance = await getWalletUSDCBalance(embeddedWallet);

      // Get user's safelocks from blockchain
      const activeSafelocks = await getLockedSaving(embeddedWallet);

      // Get withdrawal history
      const completedSafelocks = await getWithdrawalHistory(embeddedWallet);

      // Get all transactions
      const transactions = await getAllTransactionHistory(embeddedWallet);

      // Calculate total safelock balance from active safelocks
      const totalBalance = activeSafelocks.reduce(
        (total, safelock) => total + safelock.amount,
        0
      );

      return {
        totalBalance,
        walletBalance,
        activeLocks: activeSafelocks.length,
        activeSafelocks,
        completedSafelocks,
        transactions,
      };
    } catch (error) {
      console.error("Error fetching SafeLock data:", error);
      return rejectWithValue(error.message || "Failed to fetch SafeLock data");
    }
  }
);

// Step 1: Create SafeLock Address
export const createSafeLockAddress = createAsyncThunk(
  "safelock/createAddress",
  async ({ embeddedWallet, durationDays }, { rejectWithValue }) => {
    try {
      if (!embeddedWallet) {
        return rejectWithValue("Wallet not connected");
      }

      const safeLockAddress = await createSafelockAddress(
        embeddedWallet,
        durationDays,
        null,
        (error) => console.error("SafeLock creation error:", error)
      );

      return {
        safeLockAddress,
        durationDays,
      };
    } catch (error) {
      console.error("Error creating SafeLock address:", error);
      return rejectWithValue(
        error.message || "Failed to create SafeLock address"
      );
    }
  }
);

// Step 2: Deposit funds into SafeLock
export const depositToSafeLock = createAsyncThunk(
  "safelock/deposit",
  async ({ embeddedWallet, amount, safeLockAddress }, { rejectWithValue }) => {
    try {
      if (!embeddedWallet) {
        return rejectWithValue("Wallet not connected");
      }

      if (!safeLockAddress) {
        return rejectWithValue("Invalid SafeLock address");
      }

      // First check wallet balance to ensure user has sufficient funds
      const walletBalance = await getWalletUSDCBalance(embeddedWallet);
      if (parseFloat(walletBalance) < parseFloat(amount)) {
        return rejectWithValue("Insufficient balance in wallet");
      }

      // Deposit tokens to the SafeLock contract
      const receipt = await safeLockToken(
        embeddedWallet,
        amount.toString(),
        safeLockAddress,
        null,
        (error) => console.error("SafeLock deposit error:", error)
      );

      // Get the updated safelock data
      const safelock = await getLockedSaving(embeddedWallet);
      const latestSafelock = safelock[0]; // Get the latest SafeLock entry

      return {
        safelock: latestSafelock,
        transaction: {
          id: receipt.transactionHash,
          type: "SafeLock Deposit",
          transactionId: receipt.transactionHash,
          amount: parseFloat(amount),
          date: new Date().toISOString(),
          from: "Wallet",
          to: "SafeLock",
          status: "Completed",
        },
      };
    } catch (error) {
      console.error("Error depositing to SafeLock:", error);
      return rejectWithValue(error.message || "Failed to deposit to SafeLock");
    }
  }
);

export const breakSafelock = createAsyncThunk(
  "safelock/break",
  async ({ embeddedWallet, safeLockAddress, index }, { rejectWithValue }) => {
    try {
      if (!embeddedWallet || !safeLockAddress) {
        return rejectWithValue("Missing wallet or SafeLock address");
      }

      // Get the safelock info before withdrawal (to have record of it)
      const safelocks = await getLockedSaving(embeddedWallet);
      const safelockToBreak = safelocks.find((s, i) => i === index);
      if (!safelockToBreak) {
        return rejectWithValue("SafeLock not found");
      }

      // Withdraw from the SafeLock
      const receipt = await withdrawSafeLock(
        embeddedWallet,
        safeLockAddress,
        index,
        null,
        (error) => console.error("SafeLock withdrawal error:", error)
      );

      return {
        safelockId: index,
        completedSafelock: {
          ...safelockToBreak,
          status: "completed",
          payoutAmount: safelockToBreak.amount, // In a real scenario, this might include interest
        },
        transaction: {
          id: receipt.transactionHash,
          type: "SafeLock Withdrawal",
          transactionId: receipt.transactionHash,
          amount: safelockToBreak.amount,
          date: new Date().toISOString(),
          from: "SafeLock",
          to: "Wallet",
          status: "Completed",
        },
      };
    } catch (error) {
      console.error("Error breaking SafeLock:", error);
      return rejectWithValue(error.message || "Failed to break SafeLock");
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
  // New step-based safelock creation
  creationStep: 1, // 1: choose duration, 2: deposit amount
  currentSafeLockAddress: null,
  durationDays: 30,
};

const safelockSlice = createSlice({
  name: "safelock",
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    resetSafeLockCreation: (state) => {
      state.creationStep = 1;
      state.currentSafeLockAddress = null;
      state.durationDays = 30;
    },
    setDuration: (state, action) => {
      state.durationDays = action.payload;
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

      // Step 1: Create SafeLock Address reducers
      .addCase(createSafeLockAddress.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createSafeLockAddress.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentSafeLockAddress = action.payload.safeLockAddress;
        state.durationDays = action.payload.durationDays;
        state.creationStep = 2; // Move to step 2
      })
      .addCase(createSafeLockAddress.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Step 2: Deposit to SafeLock reducers
      .addCase(depositToSafeLock.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(depositToSafeLock.fulfilled, (state, action) => {
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
        // Reset creation state
        state.creationStep = 1;
        state.currentSafeLockAddress = null;
      })
      .addCase(depositToSafeLock.rejected, (state, action) => {
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
          (_, index) => index !== action.payload.safelockId
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

export const { setActiveTab, resetSafeLockCreation, setDuration } =
  safelockSlice.actions;

export default safelockSlice.reducer;
