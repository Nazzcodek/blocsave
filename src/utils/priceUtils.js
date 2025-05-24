import { useState, useEffect } from 'react';

export const useExchangeRate = () => {
  const [exchangeRate, setExchangeRate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=ngn"
        );
        const data = await response.json();
        setExchangeRate(data["usd-coin"].ngn);
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRate();
    // Refresh rate every 5 minutes
    const interval = setInterval(fetchExchangeRate, 300000);
    return () => clearInterval(interval);
  }, []);

  return { exchangeRate, isLoading };
};

export const convertNairaToUSDC = (nairaAmount, exchangeRate) => {
  if (!exchangeRate) return 0;
  return (nairaAmount / exchangeRate).toFixed(2);
};

export const convertUSDCToNaira = (usdcAmount, exchangeRate) => {
  if (!exchangeRate) return 0;
  return (usdcAmount * exchangeRate).toFixed(2);
}; 