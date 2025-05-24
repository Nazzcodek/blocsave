import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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
  getAdasheDetails,
} from "../../services/blockchain/useAdashe";
import {
  getAdasheBalance,
  getAllAdasheBalances,
} from "../../services/blockchain/useAdasheBalance";
import { ethers } from "ethers";
import { validateWalletAddress } from "../../utils/validators";

// Fetch all Adashe data including circles from blockchain
export const fetchAdasheData = createAsyncThunk(
  "adashe/fetchData",
  async ({ embeddedWallet, page = 1, limit = 5 }, { rejectWithValue }) => {
    try {
      if (!embeddedWallet) {
        return rejectWithValue("Wallet not connected");
      }

      // Get all Adashe addresses from factory
      let adasheAddresses = await getAllAdasheAddresses(embeddedWallet);

      if (!adasheAddresses || adasheAddresses.length === 0) {
        return {
          balance: 0,
          circles: [],
          totalCount: 0,
          page: 1,
          hasMore: false,
        };
      }

      // Blockchain arrays typically append new elements at the end
      adasheAddresses = [...adasheAddresses].reverse();

      // Calculate pagination values
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      // Get the addresses for the current page
      const paginatedAddresses = adasheAddresses.slice(startIndex, endIndex);

      console.log(
        `[fetchAdasheData] Processing ${paginatedAddresses.length} of ${adasheAddresses.length} total circles (page ${page})`
      );

      // Get balances only for the current page of addresses to improve performance
      const allBalances = await getAllAdasheBalances(
        embeddedWallet,
        paginatedAddresses
      );

      // Format circles to match our application's structure
      const formattedCircles = await Promise.all(
        paginatedAddresses.map(async (address, index) => {
          // Get members from blockchain
          const members = await getAdasheMembers(embeddedWallet, address);

          // Get current week of this circle
          const currentWeek = await getCurrentWeek(embeddedWallet, address);

          // Get Adashe details from blockchain
          let adasheDetails = null;
          try {
            adasheDetails = await getAdasheDetails(embeddedWallet, address);
          } catch (e) {
            adasheDetails = null;
          }

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
          endDate.setDate(endDate.getDate() + totalWeeks * 7);
          // Format dates
          const formatDate = (date) => {
            return `${date.getDate().toString().padStart(2, "0")}-${(
              date.getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}-${date.getFullYear()}`;
          };

          // Format members with position based on contract order
          const formattedMembers = members.map((memberAddress, idx) => ({
            id: memberAddress,
            position: idx + 1, // 1-based position from contract order
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
            name:
              adasheDetails?.circleName ||
              `Adashe Circle ${address.slice(0, 6)}`,
            weeklyAmount: adasheDetails?.weeklyContribution
              ? Number(ethers.formatUnits(adasheDetails.weeklyContribution, 6))
              : balanceInfo.contributedWeeks > 0
              ? balanceInfo.totalContribution / balanceInfo.contributedWeeks
              : 0,
            memberCount: members.length,
            totalMembers: members.length,
            totalRounds: members.length,
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
        totalCount: adasheAddresses.length, // Total number of circles
        page: page, // Current page
        hasMore: endIndex < adasheAddresses.length, // Whether there are more circles to load
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
        (address) => {
          console.log(
            "[createCircle] Successfully created Adashe address:",
            address
          );
        },
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

      // Get user email or address for creator name
      let creatorName = "";
      if (embeddedWallet?.user?.email) {
        creatorName = embeddedWallet.user.email.split("@")[0];
      } else if (embeddedWallet?.user?.address) {
        const addr = embeddedWallet.user.address;
        creatorName = addr.slice(0, 6) + "..." + addr.slice(-4);
      } else {
        creatorName = "Creator";
      }

      // Get the creator's wallet address
      let creatorAddress = null;
      if (embeddedWallet?.user?.address) {
        creatorAddress = embeddedWallet.user.address.toLowerCase();
      }

      const receipt = await createAdasheCircle(
        embeddedWallet,
        adasheAddress,
        name,
        contributionAmount,
        memberCount,
        frequency,
        creatorName, // Use dynamic creator name
        (receipt) => {
          console.log(
            "[createCircle] Successfully created Adashe circle:",
            receipt
          );
        },
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
        creator: creatorAddress, // Store the creator's wallet address for robust identification
        creatorDisplayName: creatorName, // Optionally keep display name for UI
        members: members.map((address, index) => ({
          id: address,
          name:
            embeddedWallet?.user?.address &&
            address.toLowerCase() === embeddedWallet.user.address.toLowerCase()
              ? creatorName
              : `Member ${index + 1}`,
          address: address.slice(0, 10) + "..." + address.slice(-8),
        })),
        paymentSchedule: Array.from({ length: memberCount }, (_, i) => ({
          round: i + 1,
          recipient: {
            id: members[i] || `unknown-${i}`,
            name:
              embeddedWallet?.user?.address &&
              members[i]?.toLowerCase() ===
                embeddedWallet.user.address.toLowerCase()
                ? creatorName
                : `Member ${i + 1}`,
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

// Join existing Adashe circle by contract address
export const joinCircle = createAsyncThunk(
  "adashe/joinCircle",
  async (
    { embeddedWallet, contractAddress, userName },
    { rejectWithValue }
  ) => {
    try {
      // Wallet validation
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
      if (!contractAddress || contractAddress.trim() === "") {
        return rejectWithValue(
          "Please provide contract address to join the circle"
        );
      }

      if (!userName || userName.trim() === "") {
        return rejectWithValue("Please provide your name to join the circle");
      }

      // Validate contract address format
      if (!contractAddress.startsWith("0x") || contractAddress.length !== 42) {
        return rejectWithValue("Invalid contract address format");
      }

      // Join the circle via blockchain (by contract address)
      let joinResult;
      try {
        joinResult = await joinAdasheCircle(
          embeddedWallet,
          contractAddress,
          userName.trim(),
          (receipt) => {
            console.log(
              "[joinCircle] Successfully joined/verified circle:",
              receipt
            );
          },
          (error) => {
            console.error("[joinCircle] Failed to join circle:", error);
            throw error;
          }
        );

        // Check if the result is just a message (already a member)
        if (joinResult?.message) {
          // User is already a member or owner - return success with message
          console.log(
            "[joinCircle] User already a member:",
            joinResult.message
          );
          return {
            contractAddress,
            message: joinResult.message,
            alreadyMember: true,
            isOwner: joinResult.isOwner || false,
          };
        }
      } catch (error) {
        console.error("[joinCircle] Join error:", error);

        // Handle specific error cases with user-friendly messages
        const errorMessage = error.message || "Failed to join circle";

        // Check for already a member scenarios
        if (
          errorMessage.toLowerCase().includes("already a member") ||
          errorMessage.toLowerCase().includes("creator of this circle")
        ) {
          return {
            contractAddress,
            message: errorMessage,
            alreadyMember: true,
            isOwner: errorMessage.toLowerCase().includes("creator"),
          };
        }

        // Check for circle full scenario
        if (errorMessage.toLowerCase().includes("circle is full")) {
          return rejectWithValue(
            "This circle is full and cannot accept new members. Please try joining a different circle."
          );
        }

        // Handle missing revert data specifically
        if (errorMessage.toLowerCase().includes("missing revert data")) {
          return rejectWithValue(
            "Unable to join circle. You may already be a member or the action is not allowed. Please check your membership status."
          );
        }

        // Handle other contract errors
        return rejectWithValue(errorMessage);
      }

      // Get members after joining
      const members = await getAdasheMembers(embeddedWallet, contractAddress);
      // Get current week
      const currentWeek = await getCurrentWeek(embeddedWallet, contractAddress);

      return {
        circleId: contractAddress,
        receipt: joinResult,
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
  isContributing: false, // Track contribution in progress
  error: null,
  activeTab: "create", // Main Adashe page tabs
  detailTabView: "Schedule", // Circle detail page tabs
  detailView: false, // Controls whether to show circle details
  selectedCircleId: null, // ID of the circle being viewed
  totalCount: 0, // Total number of circles
  currentPage: 1, // Current page of circles
  hasMorePages: false, // Whether there are more pages of circles
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
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.page;
        state.hasMorePages = action.payload.hasMore;
      })
      .addCase(fetchAdasheData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch Adashe data";
      })
      .addCase(contributeToCircle.pending, (state) => {
        state.isContributing = true;
        state.error = null;
      })
      .addCase(contributeToCircle.fulfilled, (state, action) => {
        state.isContributing = false;
        // Update the circle's contribution info if needed
        if (action.payload && action.payload.circleId) {
          const { circleId } = action.payload;
          const circleIndex = state.circles.findIndex((c) => c.id === circleId);

          // If we found the circle, update its contribution status
          if (circleIndex !== -1) {
            // The specific updates would depend on your data model
            // For example, you might want to increment the contributedWeeks count
            const circle = state.circles[circleIndex];
            if (circle) {
              // Placeholder for circle-specific updates
              // This would be replaced with actual logic based on your app's needs
            }
          }
        }
      })
      .addCase(contributeToCircle.rejected, (state, action) => {
        state.isContributing = false;
        state.error = action.payload || "Failed to contribute";
      })
      .addCase(withdrawFromCircle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(withdrawFromCircle.fulfilled, (state, action) => {
        state.isLoading = false;
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

        // If the user is already a member, we just show a success notification
        if (action.payload?.alreadyMember) {
          state.userNotification = {
            type: "success",
            message:
              action.payload.message ||
              "You are already a member of this group",
          };
          return;
        }

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
