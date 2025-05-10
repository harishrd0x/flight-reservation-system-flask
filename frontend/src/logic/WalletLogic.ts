
import { Wallet, Transaction } from '@/models/types/wallet';
import { LocalStorageRepository } from '@/models/repository/LocalStorageRepository';
import { useToast } from '@/hooks/use-toast';

/**
 * Business logic for wallet operations
 */
export class WalletLogic {
  private walletRepository: LocalStorageRepository<Wallet>;
  private toast = useToast();

  constructor() {
    this.walletRepository = new LocalStorageRepository<Wallet>('wallet');
  }

  /**
   * Get user wallet
   */
  getWallet(userId?: string): Wallet {
    const wallets = this.walletRepository.getAll();
    return wallets[0] || { balance: 2500, transactions: [] };
  }

  /**
   * Add money to wallet
   */
  addMoney(amount: number, userId?: string): Wallet {
    try {
      if (amount <= 0) {
        this.toast.toast({
          title: "Invalid Amount",
          description: "Please enter a positive amount",
          variant: "destructive"
        });
        return this.getWallet(userId);
      }

      const wallet = this.getWallet(userId);
      
      const transaction: Transaction = {
        id: `deposit-${Date.now()}`,
        amount: amount,
        type: "deposit",
        description: "Money added to wallet",
        date: new Date().toLocaleString('en-US', {
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };
      
      const updatedWallet: Wallet = {
        ...wallet,
        balance: wallet.balance + amount,
        transactions: [transaction, ...(wallet.transactions || [])],
      };
      
      this.walletRepository.save([updatedWallet]);
      
      this.toast.toast({
        title: "Money Added",
        description: `$${amount} has been added to your wallet`,
      });
      
      return updatedWallet;
    } catch (error) {
      console.error("Error adding money to wallet:", error);
      this.toast.toast({
        title: "Transaction Failed",
        description: "Failed to add money to wallet",
        variant: "destructive"
      });
      return this.getWallet(userId);
    }
  }

  /**
   * Get wallet transactions
   */
  getTransactions(userId?: string): Transaction[] {
    const wallet = this.getWallet(userId);
    return wallet.transactions || [];
  }
}

export const useWalletLogic = () => {
  return new WalletLogic();
};
