
import { useWalletLogic } from '@/logic/WalletLogic';
import { useAuth } from '@/context/AuthContext';

/**
 * Service for handling wallet operations
 * Connects UI components with business logic
 */
export const useWalletService = () => {
  const walletLogic = useWalletLogic();
  const { user } = useAuth();
  
  /**
   * Get user wallet
   */
  const getWallet = () => {
    return walletLogic.getWallet(user?.email);
  };
  
  /**
   * Add money to wallet
   */
  const addMoney = (amount: number) => {
    return walletLogic.addMoney(amount, user?.email);
  };
  
  /**
   * Get wallet transactions
   */
  const getTransactions = () => {
    return walletLogic.getTransactions(user?.email);
  };
  
  return {
    getWallet,
    addMoney,
    getTransactions
  };
};
