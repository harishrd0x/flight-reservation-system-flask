import { useAuth } from "@/context/AuthContext";

/**
 * Service for handling wallet operations.
 * Connects UI components with backend-based wallet logic.
 */
export const useWalletService = () => {
  const { user, token } = useAuth(); // Get user and token from AuthContext
  
  /**
   * Get the current user's wallet from the backend.
   */
  const getWallet = async () => {
    try {
      const response = await fetch("http://localhost:5000/wallet/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch wallet");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error fetching wallet:", error.message);
      throw error;
    }
  };

  /**
   * Add money to the user's wallet via the backend.
   */
  const addMoney = async (amount: number) => {
    try {
      const response = await fetch("http://localhost:5000/wallet/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add money");
      }

      return await response.json(); // Returns updated wallet data
    } catch (error: any) {
      console.error("Error adding money:", error.message);
      throw error;
    }
  };

  return {
    getWallet,
    addMoney,
  };
};

export default useWalletService;
