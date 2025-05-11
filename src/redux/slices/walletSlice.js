import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import blockchainBalanceService from "../../services/blockchainBalanceService";

// Mock token address for USDC on Base Sepolia
const USDC_TOKEN_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// Async thunk for fetching on-chain token balance
export const fetchTokenBalance = createAsyncThunk(
  "wallet/fetchTokenBalance",
  async ({ address, client }, { rejectWithValue }) => {
    try {
      const balance = await blockchainBalanceService.getTokenBalance(
        address,
        USDC_TOKEN_ADDRESS,
        client
      );
      return { balance, currency: "USDC" };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch token balance");
    }
  }
);

// Async thunk for on-chain fund wallet
export const fundOnChainWallet = createAsyncThunk(
  "wallet/fundOnChain",
  async ({ amount, address, client, walletClient }, { rejectWithValue }) => {
    try {
      const txHash = await blockchainBalanceService.fundWallet(
        amount,
        address,
        USDC_TOKEN_ADDRESS,
        client,
        walletClient
      );

      // In a real app, you would wait for the transaction to be mined
      // and get the updated balance

      return {
        txHash,
        amount,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fund wallet on-chain");
    }
  }
);

// Async thunk for on-chain withdraw from wallet
export const withdrawOnChainWallet = createAsyncThunk(
  "wallet/withdrawOnChain",
  async (
    { amount, targetAddress, address, client, walletClient },
    { rejectWithValue }
  ) => {
    try {
      const txHash = await blockchainBalanceService.withdrawFromWallet(
        amount,
        targetAddress,
        USDC_TOKEN_ADDRESS,
        client,
        walletClient
      );

      // In a real app, you would wait for the transaction to be mined
      // and get the updated balance

      return {
        txHash,
        amount,
      };
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to withdraw from wallet on-chain"
      );
    }
  }
);

// Async thunk for fetching transaction history
export const fetchTransactionHistory = createAsyncThunk(
  "wallet/fetchTransactions",
  async ({ address, client }, { rejectWithValue }) => {
    try {
      const transactions = await blockchainBalanceService.getTransactionHistory(
        address,
        client
      );
      return transactions;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch transaction history"
      );
    }
  }
);

const initialState = {
  address: null,
  isConnected: false,
  balance: {
    amount: 0,
    currency: "USDC",
    loading: false,
    error: null,
  },
  pendingTransactions: [],
  transactionHistory: {
    data: [],
    loading: false,
    error: null,
  },
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWalletAddress: (state, action) => {
      state.address = action.payload;
      state.isConnected = !!action.payload;
    },
    clearWalletError: (state) => {
      state.balance.error = null;
      state.transactionHistory.error = null;
    },
    addPendingTransaction: (state, action) => {
      state.pendingTransactions.push(action.payload);
    },
    removePendingTransaction: (state, action) => {
      state.pendingTransactions = state.pendingTransactions.filter(
        (tx) => tx.hash !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Token balance cases
      .addCase(fetchTokenBalance.pending, (state) => {
        state.balance.loading = true;
        state.balance.error = null;
      })
      .addCase(fetchTokenBalance.fulfilled, (state, action) => {
        state.balance.loading = false;
        state.balance.amount = action.payload.balance;
        state.balance.currency = action.payload.currency;
      })
      .addCase(fetchTokenBalance.rejected, (state, action) => {
        state.balance.loading = false;
        state.balance.error = action.payload;
      })

      // Transaction history cases
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.transactionHistory.loading = true;
        state.transactionHistory.error = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.transactionHistory.loading = false;
        state.transactionHistory.data = action.payload;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.transactionHistory.loading = false;
        state.transactionHistory.error = action.payload;
      })

      // Fund wallet on-chain cases
      .addCase(fundOnChainWallet.fulfilled, (state, action) => {
        // Add to pending transactions
        state.pendingTransactions.push({
          hash: action.payload.txHash,
          type: "fund",
          amount: action.payload.amount,
          timestamp: Date.now(),
        });
      })

      // Withdraw from wallet on-chain cases
      .addCase(withdrawOnChainWallet.fulfilled, (state, action) => {
        // Add to pending transactions
        state.pendingTransactions.push({
          hash: action.payload.txHash,
          type: "withdraw",
          amount: action.payload.amount,
          timestamp: Date.now(),
        });
      });
  },
});

export const {
  setWalletAddress,
  clearWalletError,
  addPendingTransaction,
  removePendingTransaction,
} = walletSlice.actions;

export default walletSlice.reducer;
