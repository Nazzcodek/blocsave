/**
 * Application constants module
 * This file contains all application-wide constants
 */

/**
 * Navigation links configuration
 * @type {Array<{name: string, path: string, icon: string}>}
 */
export const NAVIGATION_LINKS = [
  { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { name: "Quick Save", path: "/quicksave", icon: "save" },
  { name: "SafeLock", path: "/safelock", icon: "lock" },
  { name: "Adashe", path: "/adashe", icon: "ad" },
  { name: "Activity", path: "/activity", icon: "activity" },
];

/**
 * Savings product types
 * @type {Object<string, string>}
 */
export const SAVINGS_TYPES = {
  QUICK_SAVE: "quicksave",
  SAFE_LOCK: "safelock",
  AD_SAVINGS: "adashe",
};

/**
 * Transaction types
 * @type {Object<string, string>}
 */
export const TRANSACTION_TYPES = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  TRANSFER: "transfer",
  INTEREST: "interest",
};

/**
 * Transaction statuses
 * @type {Object<string, string>}
 */
export const TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

/**
 * API error messages
 * @type {Object<string, string>}
 */
export const ERROR_MESSAGES = {
  DEFAULT: "An error occurred. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  AUTHENTICATION: "Authentication failed. Please log in again.",
  VALIDATION: "Please check your input and try again.",
  PERMISSION: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
};

/**
 * Currency symbols
 * @type {Object<string, string>}
 */
export const CURRENCY = {
  USDC: "USDC",
  NGN: "NGN",
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
};

/**
 * SafeLock durations in days
 * @type {Array<{value: number, label: string}>}
 */
export const SAFELOCK_DURATIONS = [
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
];
