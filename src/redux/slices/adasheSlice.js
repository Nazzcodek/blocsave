import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Import our new blockchain services
import {
  createAdasheAddress,
  getAllAdasheAddresses,
} from "../../services/blockchain/useAdasheFactory";
import {
  createAdasheCircle,
  joinAdasheCircle,
  contributeToAdashe,
  withdrawFromAdashe,
  getAdasheMembers,
  getContributionProgress,
  getCurrentWeek,
} from "../../services/blockchain/useAdashe";
import {
  getAdasheBalance,
  getAllAdasheBalances,
} from "../../services/blockchain/useAdasheBalance";

// Fetch all Adashe data including circles from blockchain
export const fetchAdasheData = createAsyncThunk(
  "adashe/fetchData",
  async ({ embeddedWallet }, { rejectWithValue }) => {
    try {
      if (!embeddedWallet) {
        return rejectWithValue("Wallet not connected");
      }

      // Get all Adashe addresses from factory
      const adasheAddresses = await getAllAdasheAddresses(embeddedWallet);

      if (!adasheAddresses || adasheAddresses.length === 0) {
        return {
          balance: 0,
          circles: [],
        };
      }

      // Get all balances in parallel using our new service
      const allBalances = await getAllAdasheBalances(
        embeddedWallet,
        adasheAddresses
      );

      // Format circles to match our application's structure
      const formattedCircles = await Promise.all(
        adasheAddresses.map(async (address, index) => {
          // Get members from blockchain
          const members = await getAdasheMembers(embeddedWallet, address);

          // Get current week of this circle
          const currentWeek = await getCurrentWeek(embeddedWallet, address);

          // Get balance info for this address (should be in allBalances already)
          const balanceInfo = allBalances.find(
            (b) => b.address === address
          ) || {
            contributedWeeks: 0,
            totalContribution: 0,
            currentWeek: Number(currentWeek),
            isCompleted: false,
          };

          // Current date for calculations
          const currentDate = new Date();
          const startDate = new Date(currentDate);
          startDate.setDate(startDate.getDate() - balanceInfo.currentWeek * 7); // Approximate start

          // Total weeks/rounds is equal to member count in Adashe circles
          const totalWeeks = members.length;

          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + totalWeeks * 7); // Approximate end

          // Format dates
          const formatDate = (date) => {
            return `${date.getDate().toString().padStart(2, "0")}-${(
              date.getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}-${date.getFullYear()}`;
          };

          // Format members
          const formattedMembers = members.map((memberAddress, idx) => ({
            id: memberAddress,
            name: idx === 0 ? "You" : `Member ${idx + 1}`,
            address:
              memberAddress.slice(0, 10) + "..." + memberAddress.slice(-8),
          }));

          // Next contribution and payout dates
          const nextContributionDate = new Date(currentDate);
          nextContributionDate.setDate(nextContributionDate.getDate() + 7);

          const nextPayoutDate = new Date(nextContributionDate);
          nextPayoutDate.setDate(nextPayoutDate.getDate() + 1);

          // Generate payment schedule
          const paymentSchedule = Array.from(
            { length: members.length },
            (_, i) => ({
              round: i + 1,
              recipient: {
                id: members[i] || `unknown-member-${i}`,
                name: i === 0 ? "You" : `Member ${i + 1}`,
              },
              date: new Date(
                startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000
              ).toLocaleDateString("en-GB"),
              contributions:
                i < balanceInfo.currentWeek ? balanceInfo.contributedWeeks : 0,
              status:
                i < balanceInfo.currentWeek - 1
                  ? "completed"
                  : i === balanceInfo.currentWeek - 1
                  ? "active"
                  : "pending",
            })
          );

          return {
            id: address,
            name: `Adashe Circle ${address.slice(0, 6)}`,
            weeklyAmount:
              balanceInfo.totalContribution / balanceInfo.contributedWeeks,
            memberCount: members.length,
            totalMembers: members.length,
            totalRounds: totalWeeks,
            currentRound: Number(currentWeek),
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
            totalContribution: balanceInfo.totalContribution,
            totalContributionAmount:
              balanceInfo.totalContribution * members.length,
            cycleProgress: Math.round(
              ((Number(currentWeek) - 1) / totalWeeks) * 100
            ),
            invitationCode: `Adashe${address.slice(0, 8)}`,
            isActive: true,
            members: formattedMembers,
            paymentSchedule,
            contractAddress: address,
          };
        })
      );

      // Calculate total balance across all circles
      const totalBalance = allBalances.reduce(
        (sum, balance) => sum + balance.totalContribution,
        0
      );

      return {
        balance: totalBalance,
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
      // Embedded wallet validation with detailed error
      if (!embeddedWallet) {
        return rejectWithValue("Wallet not connected");
      }

      // Check if wallet is ready
      try {
        const provider = await embeddedWallet.getEthereumProvider();
        if (!provider) {
          return rejectWithValue("Wallet provider not available");
        }
      } catch (walletError) {
        console.error(
          "[contributeToCircle] Error accessing wallet:",
          walletError
        );
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

      // Get current week if not provided
      if (!weekNumber) {
        weekNumber = await getCurrentWeek(embeddedWallet, circleId);
      }

      const receipt = await contributeToAdashe(
        embeddedWallet,
        circleId,
        weekNumber,
        amount,
        (error) => {
          console.error("[contributeToCircle] Contribution failed:", error);
          throw error;
        }
      );

      // Get updated balance after contribution
      const balanceInfo = await getAdasheBalance(embeddedWallet, circleId);

      return {
        circleId,
        weekNumber,
        amount,
        receipt,
        balanceInfo,
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
        console.error(
          "[withdrawFromCircle] Embedded wallet is null or undefined"
        );
        return rejectWithValue("Wallet not connected");
      }

      if (!circleId) {
        return rejectWithValue("Invalid circle - please select a valid circle");
      }

      const receipt = await withdrawFromAdashe(
        embeddedWallet,
        circleId,
        (error) => {
          console.error("[withdrawFromCircle] Withdrawal failed:", error);
          throw error;
        }
      );

      // Get updated balance after withdrawal
      const balanceInfo = await getAdasheBalance(embeddedWallet, circleId);
      return {
        circleId,
        roundId,
        receipt,
        balanceInfo,
        success: true,
      };
    } catch (error) {
      console.error("[withdrawFromCircle] Error:", error);
      return rejectWithValue(error.message || "Failed to withdraw");
    }
  }
);

// Create new Adashe circle
export const createCircle = createAsyncThunk(
  "adashe/createCircle",
  async ({ embeddedWallet, circleData }, { rejectWithValue }) => {
    try {
      // Advanced wallet validation
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

      // Create Adashe Address via factory
      console.log("[createCircle] Step 1: Creating Adashe contract address");
      const adasheAddress = await createAdasheAddress(
        embeddedWallet,
        (error) => {
          console.error(
            "[createCircle] Failed to create Adashe address:",
            error
          );
          throw error;
        }
      );

      if (!adasheAddress) {
        return rejectWithValue("Failed to create Adashe contract");
      }

      const receipt = await createAdasheCircle(
        embeddedWallet,
        adasheAddress,
        name,
        contributionAmount,
        memberCount,
        frequency,
        "You", // Creator name

        (error) => {
          console.error(
            "[createCircle] Failed to create Adashe circle:",
            error
          );
          throw error;
        }
      );

      // Get current week of the circle
      const currentWeek = await getCurrentWeek(embeddedWallet, adasheAddress);

      // Get circle members
      const members = await getAdasheMembers(embeddedWallet, adasheAddress);

      // Create circle object with real data from blockchain
      const newCircle = {
        id: adasheAddress,
        name,
        weeklyAmount: contributionAmount,
        memberCount: members.length,
        totalMembers: Number(memberCount),
        totalRounds: Number(memberCount),
        currentRound: Number(currentWeek),
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
        cycleProgress: Math.round(
          ((Number(currentWeek) - 1) / memberCount) * 100
        ),
        invitationCode: `${name}${adasheAddress.slice(0, 6)}`,
        isActive: true,
        members: members.map((address, index) => ({
          id: address,
          name: index === 0 ? "You" : `Member ${index + 1}`,
          address: address.slice(0, 10) + "..." + address.slice(-8),
        })),
        paymentSchedule: Array.from({ length: memberCount }, (_, i) => ({
          round: i + 1,
          recipient: {
            id: i === 0 ? members[0] : `unknown-${i}`,
            name: i === 0 ? "You" : `Member ${i + 1}`,
          },
          date: new Date(
            Date.now() + (i * 7 + 1) * 24 * 60 * 60 * 1000
          ).toLocaleDateString("en-GB"),
          contributions: 0,
          status: i === 0 ? "active" : "pending",
        })),
        // Store contract address and receipt hash for reference
        contractAddress: adasheAddress,
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

// Join existing Adashe circle
export const joinCircle = createAsyncThunk(
  "adashe/joinCircle",
  async ({ embeddedWallet, circleId, name }, { rejectWithValue }) => {
    try {
      // Advanced wallet validation
      if (!embeddedWallet) {
        console.error("[joinCircle] Embedded wallet is null or undefined");
        return rejectWithValue("Wallet not connected");
      }

      // Check if wallet is ready
      try {
        const provider = await embeddedWallet.getEthereumProvider();
        if (!provider) {
          console.error("[joinCircle] Ethereum provider not available");
          return rejectWithValue("Wallet provider not available");
        }
      } catch (walletError) {
        console.error("[joinCircle] Error accessing wallet:", walletError);
        return rejectWithValue(
          "Failed to access wallet: " + walletError.message
        );
      }

      // Validate parameters
      if (!circleId) {
        return rejectWithValue("Invalid circle address");
      }

      if (!name || name.trim() === "") {
        return rejectWithValue("Please provide group name to join the circle");
      }

      // Join the circle via blockchain
      const receipt = await joinAdasheCircle(
        embeddedWallet,
        circleId,
        name,
        (error) => {
          console.error("[joinCircle] Failed to join circle:", error);
          throw error;
        }
      );

      // Get members after joining
      const members = await getAdasheMembers(embeddedWallet, circleId);

      // Get current week
      const currentWeek = await getCurrentWeek(embeddedWallet, circleId);

      return {
        circleId,
        receipt,
        members,
        currentWeek: Number(currentWeek),
        memberIndex: members.length - 1, // Assuming the user is the last member added
        success: true,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to join circle");
    }
  }
);

const initialState = {
  balance: 0,
  circles: [],
  isLoading: false,
  error: null,
  activeTab: "create", // Main Adashe page tabs
  detailTabView: "Schedule", // Circle detail page tabs
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
        // You would typically update state based on the contribution
        // As an example, we'll just show how you could mark a contribution
        const { circleId } = action.payload;
        // Circle state logic would go here
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
      })
      .addCase(joinCircle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinCircle.fulfilled, (state, action) => {
        state.isLoading = false;
        const { circleId, members, currentWeek } = action.payload;
        // Find the circle and update its members and current round
        const circleIndex = state.circles.findIndex(
          (circle) => circle.id === circleId
        );
        if (circleIndex !== -1) {
          state.circles[circleIndex].members = members;
          state.circles[circleIndex].currentRound = currentWeek;
          state.circles[circleIndex].totalMembers = members.length;
        }
      })
      .addCase(joinCircle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to join circle";
      });
  },
});

export const {
  setActiveTab,
  setDetailTabView,
  viewCircleDetail,
  backFromDetail,
} = adasheSlice.actions;

// Export reducer only, not the thunks again
export default adasheSlice.reducer;
