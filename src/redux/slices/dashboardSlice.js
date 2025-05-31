import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAdasheTotalPool } from "@/services/adasheService";

// Async thunk for fetching dashboard data
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async (_, { getState, rejectWithValue }) => {
    try {
      const data = {
        walletBalance: { amount: "0", currency: "USDC" },
        savingsBalance: { amount: "0", currency: "USDC" },
        savingsProducts: [
          {
            type: "Quicksave",
            balance: "0",
            description: "Daily interest, no lockup period",
            icon: null,
          },
          {
            type: "SafeLock",
            balance: "0",
            description: "Higher yield, locked",
            icon: null,
          },
          {
            type: "Adashe",
            balance: "0",
            description: "Group Saving with your friends",
            icon: null,
          },
        ],
        transactions: [],
      };

      // Fetch Adashe total pool (actual, from blockchain)
      const state = getState();
      const embeddedWallet = state.auth?.embeddedWallet;
      let adasheTotalPool = 0;
      if (embeddedWallet) {
        try {
          adasheTotalPool = await getAdasheTotalPool(embeddedWallet);
        } catch (e) {
          adasheTotalPool = 0;
        }
      }

      // Attach adasheTotalPool to savingsProducts if needed
      const savingsProducts = data.savingsProducts.map((product) => {
        if (product.type?.toLowerCase() === "adashe") {
          return {
            ...product,
            balance: adasheTotalPool,
            balanceLoading: state.dashboard?.isLoading ?? true, // Show loading while dashboard is loading
          };
        }
        return product;
      });

      return {
        ...data,
        savingsProducts,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    walletBalance: { amount: "0", currency: "USDC" },
    savingsProducts: [],
    transactions: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.walletBalance = action.payload.walletBalance;
        state.savingsProducts = action.payload.savingsProducts;
        state.transactions = action.payload.transactions;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
