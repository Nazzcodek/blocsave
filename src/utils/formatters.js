/**
 * Format a number as a currency string
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'USD')
 * @returns {string} - The formatted currency string
 */
export const formatCurrency = (amount, currency = "USD") => {
  if (amount === null || amount === undefined) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Parse a currency string into a number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} - The parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;

  // Remove currency symbols and commas, then parse as float
  const numericString = currencyString.replace(/[^0-9.-]+/g, "");
  return parseFloat(numericString);
};

/**
 * Add commas to a number for better readability
 * @param {number} num - The number to format
 * @returns {string} - The formatted number string with commas
 */
export const addCommas = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format date to readable string
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    // Format: Sep 9, 2024, 06:19pm
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString || "N/A";
  }
};

/**
 * Format transaction ID for display
 * @param {string} transactionId - Transaction ID to format
 * @returns {string} Formatted transaction ID
 */
export const formatTransactionId = (transactionId) => {
  if (!transactionId) return "N/A";

  // Display only first and last few characters with ellipsis
  if (transactionId.length > 12) {
    return `${transactionId.substring(0, 6)}...${transactionId.substring(
      transactionId.length - 4
    )}`;
  }

  return transactionId;
};

/**
 * Format a value as a percentage string
 * @param {number} value - The percentage value (e.g. 5 for 5%)
 * @param {Object} options - Formatting options
 * @param {number} [options.minimumFractionDigits=1] - Minimum fraction digits
 * @param {number} [options.maximumFractionDigits=2] - Maximum fraction digits
 * @param {string} [options.style="percent"] - Formatting style
 * @returns {string} - The formatted percentage string
 */
export const formatPercentage = (value, options = {}) => {
  const defaultOptions = {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
    style: "percent",
  };
  const mergedOptions = { ...defaultOptions, ...options };

  return Number(value / 100).toLocaleString(undefined, mergedOptions);
};

/**
 * Format amount with currency symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount with currency symbol
 */
export const formatAmount = (amount) => {
  try {
    // Check if amount is a valid number
    if (isNaN(parseFloat(amount))) {
      return "$0.00";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting amount:", error);
    return `$${amount || "0.00"}`;
  }
};

/**
 * Truncate text with ellipsis if it exceeds max length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length allowed
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 20) => {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return `${text.substring(0, maxLength)}...`;
};

/**
 * Get a future date by adding days to the current date
 * @param {number} days - Number of days to add
 * @returns {Date} - The future date
 */
export const getFutureDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date - The date to format
 * @returns {string} - The formatted date
 */
export const formatYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Calculate interest rate based on lock duration
 * @param {number} duration - Lock duration in days
 * @returns {number} - Interest rate percentage
 */
export const getInterestRate = (duration) => {
  if (duration <= 30) return 5;
  if (duration <= 60) return 8;
  return 10;
};

/**
 * Calculate daily interest amount
 * @param {number} principal - The principal amount
 * @param {number} rate - Annual interest rate percentage
 * @returns {number} - Daily interest amount
 */
export const calculateDailyInterest = (principal, rate) => {
  const dailyRate = rate / 100 / 365;
  return principal * dailyRate;
};

/**
 * Calculate total interest for a specific period
 * @param {number} principal - The principal amount
 * @param {number} rate - Annual interest rate percentage
 * @param {number} days - Number of days
 * @returns {number} - Total interest amount
 */
export const calculateTotalInterest = (principal, rate, days) => {
  const dailyInterest = calculateDailyInterest(principal, rate);
  return dailyInterest * days;
};

/**
 * Calculate expected returns for a safelock
 * @param {number} amount - The lock amount
 * @param {number} duration - Lock duration in days
 * @returns {object} - Expected returns object
 */
export const calculateReturns = (amount, duration) => {
  const rate = getInterestRate(duration);
  const dailyInterest = calculateDailyInterest(amount, rate);
  const totalInterest = calculateTotalInterest(amount, rate, duration);
  const maturityAmount = amount + totalInterest;
  const maturityDate = formatDate(getFutureDate(duration));

  return {
    daily: dailyInterest,
    total: totalInterest,
    maturityAmount,
    maturityDate,
  };
};
