import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Mock data for the example - in a real app, this would be fetched from an API
const mockData = {
  walletBalance: {
    amount: "100.84",
    currency: "USDC",
  },
  savingsBalance: {
    amount: "121.84",
    currency: "USDC",
  },
  savingsProducts: [
    {
      type: "Quicksave",
      balance: "21.00",
      description: "Daily interest, no lockup period",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      type: "SafeLock",
      balance: "100.84",
      description: "Higher yield, locked",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      type: "Adashe",
      balance: "0",
      description: "Earn interest on stables",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
      ),
    },
  ],
  transactions: [
    {
      id: "TRX-789f4h12",
      source: "Quicksave",
      date: "Sep 9, 2024, 04:05pm",
      amount: "-20.0",
    },
    {
      id: "TRX-789f4h12",
      source: "Quicksave",
      date: "Sep 9, 2024, 04:05pm",
      amount: "-20.0",
    },
    {
      id: "TRX-789f4h12",
      source: "Quicksave",
      date: "Sep 9, 2024, 04:05pm",
      amount: "-20.0",
    },
    {
      id: "TRX-789f4h12",
      source: "Quicksave",
      date: "Sep 9, 2024, 04:05pm",
      amount: "-20.0",
    },
  ],
};

// Async thunk for fetching dashboard data
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.get('/dashboard');
      // return response.data;

      // For this example, we'll use mock data with a delay to simulate network
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockData);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    walletBalance: { amount: "0", currency: "USDC" },
    savingsBalance: { amount: "0", currency: "USDC" },
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
        state.savingsBalance = action.payload.savingsBalance;
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
