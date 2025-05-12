import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { validateAmount } from "../../utils/validators";

/**
 * Custom hook for handling quicksave form state and validation
 * @param {Object} options - Configuration options
 * @param {number} options.maxAmount - Maximum allowed amount
 * @returns {Object} Form state and handlers
 */
const useQuicksaveForm = ({ maxAmount = 0 }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
   const [txHash, setTxHash] = useState("");
  const { activeTab } = useSelector((state) => state.quicksave);

  // Reset form when tab changes
  useEffect(() => {
    setAmount("");
    setError("");
  }, [activeTab]);

  // Validate amount on change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);

    // Clear error if input is empty
    if (!value) {
      setError("");
      return;
    }

    // Validate amount
    const validationError = validateAmount(value, maxAmount);
    setError(validationError || "");
  };

  // Set maximum amount
  const handleMaxAmount = () => {
    if (maxAmount) {
      setAmount(maxAmount.toString());
      setError("");
    }
  };

  // Check if form is valid
  const isValid = amount && !error;

  return {
    amount,
    error,
    isValid,
    handleAmountChange,
    handleMaxAmount,
    setError,
    setTxHash
  };
};

export default useQuicksaveForm;
