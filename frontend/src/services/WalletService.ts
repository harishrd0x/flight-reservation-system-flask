import { useWalletLogic } from '@/logic/WalletLogic';
import { useAuth } from '@/context/AuthContext';

/**
 * Service for handling wallet operations.
 * Connects UI components with backend-based wallet logic.
 */
export const useWalletService = () => {
  const walletLogic = useWalletLogic();
  // The backend identifies the user via a JWT token in the request headers,
  // so we don't need to pass user-specific data such as email from the frontend.
  const { user } = useAuth();
  
  /**
   * Get the current user's wallet.
   */
  const getWallet = () => {
    return walletLogic.getWallet();
  };
  
  /**
   * Add money to the current user's wallet.
   */
  const addMoney = (amount: number) => {
    return walletLogic.addMoney(amount);
  };
  
  return {
    getWallet,
    addMoney
  };
};

export default useWalletService;
