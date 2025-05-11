/**
 * Input validation utilities
 * This module provides validation functions for various form inputs and data
 * Used throughout the application to ensure data integrity and provide user feedback
 */

/**
 * Validate amount input for transactions
 * @param {string|number} amount - The amount to validate
 * @param {number} maxAmount - The maximum allowed amount
 * @returns {string|null} Error message or null if valid
 */
export const validateAmount = (amount, maxAmount = 0) => {
  // Check if amount is empty
  if (!amount || amount === "") {
    return "Please enter an amount";
  }

  // Convert to number for validation
  const numAmount = parseFloat(amount);

  // Check if amount is a valid number
  if (isNaN(numAmount)) {
    return "Please enter a valid amount";
  }

  // Check if amount is positive
  if (numAmount <= 0) {
    return "Amount must be greater than zero";
  }

  // Check if amount has more than 2 decimal places
  if (
    numAmount.toFixed(2) !== numAmount.toString() &&
    numAmount.toString().includes(".")
  ) {
    return "Amount cannot have more than 2 decimal places";
  }

  // Check if amount exceeds max amount
  if (maxAmount && numAmount > maxAmount) {
    return `Amount cannot exceed ${maxAmount.toFixed(2)}`;
  }

  // Valid amount
  return null;
};

/**
 * Validate if a transaction ID is in the correct format
 * @param {string} transactionId - The transaction ID to validate
 * @returns {boolean} Whether the transaction ID is valid
 */
export const isValidTransactionId = (transactionId) => {
  if (!transactionId) return false;

  // Example: TRX-7M94AU2
  const transactionIdRegex = /^TRX-[A-Z0-9]{7}$/;
  return transactionIdRegex.test(transactionId);
};

/**
 * Validate if a date string is in a valid format
 * @param {string} dateStr - The date string to validate
 * @returns {boolean} Whether the date string is valid
 */
export const isValidDateFormat = (dateStr) => {
  if (!dateStr) return false;

  // Check if the string can be parsed to a valid date
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateEmail = (email) => {
  if (!email) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  return null;
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @param {Object} options - Validation options
 * @param {number} [options.minLength=8] - Minimum password length
 * @param {boolean} [options.requireUppercase=true] - Require uppercase letters
 * @param {boolean} [options.requireLowercase=true] - Require lowercase letters
 * @param {boolean} [options.requireNumbers=true] - Require numbers
 * @param {boolean} [options.requireSpecialChars=true] - Require special characters
 * @returns {string|null} Error message or null if valid
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options;

  if (!password) {
    return "Password is required";
  }

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`;
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  if (requireNumbers && !/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }

  if (
    requireSpecialChars &&
    !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  ) {
    return "Password must contain at least one special character";
  }

  return null;
};

/**
 * Validate phone number format
 * @param {string} phone - The phone number to validate
 * @param {string} [country='US'] - The country code for validation format
 * @returns {string|null} Error message or null if valid
 */
export const validatePhone = (phone, country = "US") => {
  if (!phone) {
    return "Phone number is required";
  }

  // Simple validation - can be enhanced with country-specific rules
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  if (!phoneRegex.test(phone.replace(/\s+/g, ""))) {
    return "Please enter a valid phone number";
  }

  return null;
};

/**
 * Validate a blockchain wallet address (for Ethereum/Base chains)
 * @param {string} address - The wallet address to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateWalletAddress = (address) => {
  if (!address) {
    return "Wallet address is required";
  }

  // Check for standard Ethereum address format (0x followed by 40 hex chars)
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(address)) {
    return "Please enter a valid wallet address";
  }

  return null;
};

/**
 * Validate account number format
 * @param {string} accountNumber - The account number to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber) {
    return "Account number is required";
  }

  // Basic numeric validation with length check (typically 10 digits)
  const accountRegex = /^[0-9]{10}$/;
  if (!accountRegex.test(accountNumber)) {
    return "Please enter a valid 10-digit account number";
  }

  return null;
};

/**
 * Validate form input is not empty
 * @param {string} value - The value to check
 * @param {string} fieldName - The name of the field (for error message)
 * @returns {string|null} Error message or null if valid
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${fieldName} is required`;
  }

  return null;
};

/**
 * Validate input is within a minimum and maximum value
 * @param {number} value - The value to check
 * @param {Object} options - Validation options
 * @param {number} [options.min] - Minimum value (if provided)
 * @param {number} [options.max] - Maximum value (if provided)
 * @param {string} [options.fieldName='Value'] - Name of the field for error message
 * @returns {string|null} Error message or null if valid
 */
export const validateMinMax = (value, options = {}) => {
  const { min, max, fieldName = "Value" } = options;

  // Convert to number for validation
  const numValue = parseFloat(value);

  // Check if value is a valid number
  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }

  if (min !== undefined && numValue < min) {
    return `${fieldName} must be at least ${min}`;
  }

  if (max !== undefined && numValue > max) {
    return `${fieldName} cannot exceed ${max}`;
  }

  return null;
};
