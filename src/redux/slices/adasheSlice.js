import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Mock API calls for demo purposes
export const fetchAdasheData = createAsyncThunk(
  "adashe/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      return {
        balance: 100,
        circles: [
          {
            id: "jesusboyz-circle",
            name: "Jesusboyz",
            weeklyAmount: 100,
            memberCount: 5,
            totalMembers: 5,
            totalRounds: 5,
            currentRound: 3,
            startDate: "01-05-2025",
            endDate: "31-05-2025",
            nextContributionDate: "17 May 2025",
            nextPayoutDate: "18 May 2025",
            totalContributionAmount: 500,
            cycleProgress: 40,
            invitationCode: "Jesusboyz109",
            isActive: true,
            // Only include serializable data, no React elements
            members: [
              {
                id: "0x1234_5678",
                name: "You",
                address: "0xd74f2835ddcbc1fcad1f4d...",
              },
              {
                id: "1x1234_5678",
                name: "Dave",
                address: "0xd74f2835ddcbc1fcad1f4d...",
              },
              {
                id: "2x1234_5678",
                name: "Danny",
                address: "0xd74f2835ddcbc1fcad1f4d...",
              },
              {
                id: "3x1234_5678",
                name: "Mic",
                address: "0xd74f2835ddcbc1fcad1f4d...",
              },
              {
                id: "4x1234_5678",
                name: "James",
                address: "0xd74f2835ddcbc1fcad1f4d...",
              },
            ],
            paymentSchedule: [
              {
                round: 1,
                recipient: { id: "3x1234_5678", name: "Mic" },
                date: "01-05-2025",
                contributions: 5,
                status: "completed",
              },
              {
                round: 2,
                recipient: { id: "4x1234_5678", name: "James" },
                date: "01-05-2025",
                contributions: 5,
                status: "completed",
              },
              {
                round: 3,
                recipient: { id: "0x1234_5678", name: "You" },
                date: "01-05-2025",
                contributions: 2,
                status: "active",
              },
              {
                round: 4,
                recipient: { id: "1x1234_5678", name: "Dave" },
                date: "01-05-2025",
                contributions: 0,
                status: "pending",
              },
              {
                round: 5,
                recipient: { id: "2x1234_5678", name: "Danny" },
                date: "01-05-2025",
                contributions: 0,
                status: "pending",
              },
            ],
          },
        ],
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const contributeToCircle = createAsyncThunk(
  "adashe/contribute",
  async ({ circleId, amount }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      return { circleId, amount, success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const withdrawFromCircle = createAsyncThunk(
  "adashe/withdraw",
  async ({ roundId }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      return { roundId, success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCircle = createAsyncThunk(
  "adashe/createCircle",
  async (circleData, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      const { name, contributionAmount, memberCount, frequency } = circleData;

      // Generate a unique ID for the new circle
      const newCircleId = `circle-${Date.now()}`;

      // Create a new circle object
      const newCircle = {
        id: newCircleId,
        name,
        weeklyAmount: contributionAmount,
        memberCount,
        totalMembers: memberCount,
        totalRounds: memberCount,
        currentRound: 1,
        startDate: "12-05-2025",
        endDate: "12-06-2025",
        nextContributionDate: "19 May 2025",
        nextPayoutDate: "20 May 2025",
        totalContributionAmount: contributionAmount * memberCount,
        cycleProgress: 0,
        invitationCode: `${name}${Math.floor(Math.random() * 1000)}`,
        isActive: true,
        members: [
          {
            id: "0x1234_5678",
            name: "You",
            address: "0xd74f2835ddcbc1fcad1f4d...",
          },
          // In a real app, this would be populated with actual members
        ],
        paymentSchedule: [],
      };

      return { newCircle, success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  balance: 0,
  circles: [],
  isLoading: false,
  error: null,
  activeTab: "create", // For main Adashe page tabs
  detailTabView: "Schedule", // For circle detail page tabs
  detailView: false, // Controls whether to show circle details
  selectedCircleId: null, // ID of the circle being viewed
};

const adasheSlice = createSlice({
  name: "adashe",
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setDetailTabView: (state, action) => {
      state.detailTabView = action.payload;
    },
    viewCircleDetail: (state, action) => {
      state.selectedCircleId = action.payload;
      state.detailView = true;
    },
    backFromDetail: (state) => {
      state.detailView = false;
      state.selectedCircleId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdasheData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdasheData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.balance;
        state.circles = action.payload.circles;
      })
      .addCase(fetchAdasheData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch Adashe data";
      })
      .addCase(contributeToCircle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(contributeToCircle.fulfilled, (state, action) => {
        state.isLoading = false;
        // Here you would typically update state based on the contribution
        // For this example, we'll just show how you could mark a contribution
        const { circleId } = action.payload;
        // Update circle state logic would go here
      })
      .addCase(contributeToCircle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to contribute";
      })
      .addCase(withdrawFromCircle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(withdrawFromCircle.fulfilled, (state, action) => {
        state.isLoading = false;
        const { roundId } = action.payload;
        // In a real app, you would update the circle's payment schedule
        // to mark this round as withdrawn/completed
        if (state.selectedCircleId) {
          const circleIndex = state.circles.findIndex(
            (circle) => circle.id === state.selectedCircleId
          );
          if (circleIndex !== -1) {
            const roundIndex = state.circles[
              circleIndex
            ].paymentSchedule.findIndex((round) => round.round === roundId);
            if (roundIndex !== -1) {
              state.circles[circleIndex].paymentSchedule[roundIndex].status =
                "completed";
            }
          }
        }
      })
      .addCase(withdrawFromCircle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to withdraw funds";
      })
      .addCase(createCircle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCircle.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add the newly created circle to state
        if (action.payload.success) {
          state.circles.push(action.payload.newCircle);
          // Switch to the manage tab to show the new circle
          state.activeTab = "manage";
        }
      })
      .addCase(createCircle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create circle";
      });
  },
});

export const {
  setActiveTab,
  setDetailTabView,
  viewCircleDetail,
  backFromDetail,
} = adasheSlice.actions;
export default adasheSlice.reducer;
