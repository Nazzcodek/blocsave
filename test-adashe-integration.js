/**
 * Test script to verify Adashe transaction history integration
 * This tests the updated TransactionHistory and BalanceCard components
 */

console.log("Testing Adashe Transaction History Integration...");

// Test 1: Check if the new transaction history service exists and exports the right functions
try {
  const adasheHistory = require("./src/services/blockchain/useAdasheHistory.js");

  console.log("✅ useAdasheHistory.js exists");

  // Check if all required functions are exported
  const requiredFunctions = [
    "getAdasheContributionHistory",
    "getAdasheWithdrawalHistory",
    "getAllAdasheTransactionHistory",
    "getAdasheCircleTransactionHistory",
  ];

  const availableFunctions = Object.keys(adasheHistory);
  console.log("Available functions:", availableFunctions);

  const missingFunctions = requiredFunctions.filter(
    (fn) => !availableFunctions.includes(fn)
  );

  if (missingFunctions.length === 0) {
    console.log("✅ All required functions are exported from useAdasheHistory");
  } else {
    console.log("❌ Missing functions:", missingFunctions);
  }
} catch (error) {
  console.log("❌ Error loading useAdasheHistory:", error.message);
}

// Test 2: Check if TransactionHistory component accepts circleId parameter
try {
  const fs = require("fs");
  const transactionHistoryContent = fs.readFileSync(
    "./src/components/adashe/TransactionHistory.js",
    "utf8"
  );

  if (transactionHistoryContent.includes("circleId = null")) {
    console.log("✅ TransactionHistory component accepts circleId parameter");
  } else {
    console.log("❌ TransactionHistory component missing circleId parameter");
  }

  if (transactionHistoryContent.includes("getAllAdasheTransactionHistory")) {
    console.log("✅ TransactionHistory imports getAllAdasheTransactionHistory");
  } else {
    console.log(
      "❌ TransactionHistory missing getAllAdasheTransactionHistory import"
    );
  }
} catch (error) {
  console.log("❌ Error reading TransactionHistory:", error.message);
}

// Test 3: Check if BalanceCard uses the correct Redux state
try {
  const fs = require("fs");
  const balanceCardContent = fs.readFileSync(
    "./src/components/adashe/BalanceCard.js",
    "utf8"
  );

  if (balanceCardContent.includes("balance, circles")) {
    console.log("✅ BalanceCard uses balance and circles from Redux state");
  } else {
    console.log("❌ BalanceCard not using correct Redux state");
  }

  if (balanceCardContent.includes("activeCircles = circles.filter")) {
    console.log("✅ BalanceCard calculates activeCircles dynamically");
  } else {
    console.log("❌ BalanceCard missing activeCircles calculation");
  }
} catch (error) {
  console.log("❌ Error reading BalanceCard:", error.message);
}

// Test 4: Check if CircleDetail passes circleId to TransactionHistory
try {
  const fs = require("fs");
  const circleDetailContent = fs.readFileSync(
    "./src/components/adashe/CircleDetail.js",
    "utf8"
  );

  if (circleDetailContent.includes("circleId={selectedCircleId}")) {
    console.log("✅ CircleDetail passes circleId to TransactionHistory");
  } else {
    console.log("❌ CircleDetail not passing circleId to TransactionHistory");
  }
} catch (error) {
  console.log("❌ Error reading CircleDetail:", error.message);
}

console.log("\nIntegration test completed!");
