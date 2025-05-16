import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllUserAdasheCircles,
  getAdasheCircleMetadata,
  getAdasheTransactionHistory,
} from "../../services/blockchain/useAdasheHistory";
import {
  createAdasheCircle,
  joinAdasheCircle,
  contributeToAdashe,
  withdrawFromAdashe,
} from "../../services/blockchain/useAdasheContract";

// Fetch all Adashe data including circles from blockchain
export const fetchAdasheData = createAsyncThunk(
  "adashe/fetchData",
  async ({ embeddedWallet }, { rejectWithValue }) => {
    try {
      if (!embeddedWallet) {
        return rejectWithValue("Wallet not connected");
      }

      // Get user's circles from blockchain
      const userCircles = await getAllUserAdasheCircles(embeddedWallet);

      // Format circles to match our application's structure
      const formattedCircles = await Promise.all(
        userCircles.map(async (circle) => {
          // Get transaction history for this circle
          const transactions = await getAdasheTransactionHistory(
            embeddedWallet,
            circle.address
          );

          // Create payment schedule from transactions
          const paymentSchedule = transactions
            .filter((tx) => tx.type === "Payout")
            .map((tx, index) => ({
              round: index + 1,
              recipient: { id: tx.address, name: tx.user },
              date: tx.date.split(",")[0], // Just the date part
              contributions: circle.totalContributedWeeks,
              status:
                index < circle.currentWeek - 1
                  ? "completed"
                  : index === circle.currentWeek - 1
                  ? "active"
                  : "pending",
            }));

          // Create member list from circle metadata
          const members = circle.memberAddresses.map((address, index) => ({
            id: address,
            name: index === 0 ? "You" : `Member ${index + 1}`,
            address: address.slice(0, 10) + "..." + address.slice(-8),
          }));

          // Current date for calculations
          const currentDate = new Date();
          const startDate = new Date(currentDate);
          startDate.setDate(startDate.getDate() - circle.currentWeek * 7); // Approximate start

          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + circle.totalWeeks * 7); // Approximate end

          // Format dates
          const formatDate = (date) => {
            return `${date.getDate().toString().padStart(2, "0")}-${(
              date.getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}-${date.getFullYear()}`;
          };

          // Next contribution and payout dates
          const nextContributionDate = new Date(currentDate);
          nextContributionDate.setDate(nextContributionDate.getDate() + 7);

          const nextPayoutDate = new Date(nextContributionDate);
          nextPayoutDate.setDate(nextPayoutDate.getDate() + 1);

          return {
            id: circle.address,
            name: `Adashe Circle ${circle.address.slice(0, 6)}`,
            weeklyAmount:
              circle.totalWeeks > 0
                ? Math.round(
                    (circle.totalContributedWeeks / circle.totalWeeks) * 100
                  )
                : 0,
            memberCount: circle.membersCount,
            totalMembers: circle.membersCount,
            totalRounds: circle.totalWeeks,
            currentRound: circle.currentWeek,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            nextContributionDate: `${nextContributionDate.getDate()} ${nextContributionDate.toLocaleString(
              "default",
              { month: "short" }
            )} ${nextContributionDate.getFullYear()}`,
            nextPayoutDate: `${nextPayoutDate.getDate()} ${nextPayoutDate.toLocaleString(
              "default",
              { month: "short" }
            )} ${nextPayoutDate.getFullYear()}`,
            totalContributionAmount: circle.membersCount * 100, // Example calculation
            cycleProgress: Math.round(
              ((circle.currentWeek - 1) / circle.totalWeeks) * 100
            ),
            invitationCode: `Adashe${circle.address.slice(0, 8)}`,
            isActive: true,
            members,
            paymentSchedule,
          };
        })
      );

      return {
        balance: formattedCircles.reduce(
          (sum, circle) => sum + circle.weeklyAmount,
          0
        ),
        circles: formattedCircles,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch Adashe data");
    }
  }
);

// Contribute to a specific Adashe circle
export const contributeToCircle = createAsyncThunk(
  "adashe/contribute",
  async (
    { embeddedWallet, circleId, weekNumber, amount },
    { rejectWithValue }
  ) => {
    try {
      // Enhanced wallet validation with detailed error
      if (!embeddedWallet) {
        console.error("Embedded wallet is null or undefined");
        return rejectWithValue("Wallet not connected");
      }

      // Check if wallet is ready
      try {
        const provider = await embeddedWallet.getEthereumProvider();
        if (!provider) {
          console.error("Ethereum provider not available");
          return rejectWithValue("Wallet provider not available");
        }
      } catch (walletError) {
        console.error("Error accessing wallet:", walletError);
        return rejectWithValue(
          "Failed to access wallet: " + walletError.message
        );
      }

      // Validate input parameters
      if (!circleId) {
        return rejectWithValue("Invalid circle - please select a valid circle");
      }

      if (!amount || isNaN(amount) || amount <= 0) {
        return rejectWithValue("Contribution amount must be greater than 0");
      }

      // Make contribution via blockchain
      const receipt = await contributeToAdashe(
        embeddedWallet,
        circleId,
        weekNumber,
        amount,
        null,
        (error) => {
          throw error;
        }
      );

      // Get updated circle metadata after contribution
      const updatedCircle = await getAdasheCircleMetadata(
        embeddedWallet,
        circleId
      );

      return {
        circleId,
        amount,
        receipt,
        updatedCircle,
        success: true,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to contribute");
    }
  }
);

// Withdraw from a specific Adashe circle
export const withdrawFromCircle = createAsyncThunk(
  "adashe/withdraw",
  async ({ embeddedWallet, circleId, roundId }, { rejectWithValue }) => {
    try {
      if (!embeddedWallet) {
        return rejectWithValue("Wallet not connected");
      }

      // Withdraw via blockchain
      const receipt = await withdrawFromAdashe(
        embeddedWallet,
        circleId,
        null,
        (error) => {
          throw error;
        }
      );

      return {
        circleId,
        roundId,
        receipt,
        success: true,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to withdraw");
    }
  }
);

// Create a new Adashe circle
export const createCircle = createAsyncThunk(
  "adashe/createCircle",
  async ({ embeddedWallet, circleData }, { rejectWithValue }) => {
    try {
      // Enhanced wallet validation
      if (!embeddedWallet) {
        console.error("Embedded wallet is null or undefined");
        return rejectWithValue("Wallet not connected");
      }

      // Check if wallet is ready
      try {
        const provider = await embeddedWallet.getEthereumProvider();
        if (!provider) {
          console.error("Ethereum provider not available");
          return rejectWithValue("Wallet provider not available");
        }
      } catch (walletError) {
        console.error("Error accessing wallet:", walletError);
        return rejectWithValue(
          "Failed to access wallet: " + walletError.message
        );
      }

      // Validate circle data using our helper
      const { name, contributionAmount, memberCount, frequency } = circleData;

      // Import validateAdasheCircleParams from contract helpers
      const {
        validateAdasheCircleParams,
      } = require("../../utils/contractHelpers");

      // Validate the circle data
      const validationError = validateAdasheCircleParams({
        name,
        contributionAmount,
        memberCount,
      });

      if (validationError) {
        return rejectWithValue(validationError);
      }

      // Create circle via blockchain
      const receipt = await createAdasheCircle(
        embeddedWallet,
        name,
        contributionAmount,
        memberCount,
        frequency,
        "You", // creator name
        null,
        (error) => {
          throw error;
        }
      );

      // When creating a circle, we don't know the new address immediately
      // We'll need to fetch it from the transaction receipt or events
      // For now, we'll create a placeholder circle until the next data refresh

      // Extract circle address from transaction events if available
      let circleAddress = "";
      if (receipt && receipt.logs && receipt.logs.length > 0) {
        // In a real implementation, you would parse the event data to get the address
        circleAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      } else {
        circleAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      }

      // Create a temporary circle object with expected structure
      const newCircle = {
        id: circleAddress,
        name,
        weeklyAmount: contributionAmount,
        memberCount,
        totalMembers: memberCount,
        totalRounds: memberCount,
        currentRound: 1,
        startDate: new Date().toLocaleDateString("en-GB"),
        endDate: new Date(
          Date.now() + memberCount * 7 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-GB"),
        nextContributionDate: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-GB"),
        nextPayoutDate: new Date(
          Date.now() + 8 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-GB"),
        totalContributionAmount: contributionAmount * memberCount,
        cycleProgress: 0,
        invitationCode: `${name}${Math.floor(Math.random() * 1000)}`,
        isActive: true,
        members: [
          {
            id: "your-wallet-address",
            name: "You",
            address: "Your wallet address",
          },
        ],
        paymentSchedule: [],
        // Store the receipt for reference
        receiptHash: receipt.hash || "",
      };

      return {
        newCircle,
        receipt,
        success: true,
      };
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
