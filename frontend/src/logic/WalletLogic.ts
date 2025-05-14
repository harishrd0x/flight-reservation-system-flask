// src/models/wallet/WalletLogic.ts
import { Wallet } from '@/models/types/wallet';
import { useToast } from '@/hooks/use-toast';

export class WalletLogic {
  private toast = useToast();

  /**
   * Fetch wallet data from backend API.
   */
  async getWallet(): Promise<Wallet> {
    try {
      const response = await fetch('http://localhost:5000/wallet/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication if needed:
          // 'Authorization': `Bearer ${yourJWTtoken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Wallet not found');
      }
      const wallet: Wallet = await response.json();
      return wallet;
    } catch (error) {
      console.error("Error fetching wallet:", error);
      this.toast.toast({
        title: "Error",
        description: "Failed to load wallet",
        variant: "destructive"
      });
      return { balance: 0, userId: '' };
    }
  }

  /**
   * Add funds using the backend API.
   */
  async addMoney(amount: number): Promise<Wallet> {
    try {
      if (amount <= 0) {
        this.toast.toast({
          title: "Invalid Amount",
          description: "Please enter a positive amount",
          variant: "destructive"
        });
        return await this.getWallet();
      }

      const response = await fetch('http://localhost:5000/wallet/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${yourJWTtoken}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error('Failed to add funds');
      }
      const data = await response.json();
      this.toast.toast({
        title: "Money Added",
        description: `$${amount} has been added to your wallet`,
      });
      return data.wallet;
    } catch (error) {
      console.error("Error adding money to wallet:", error);
      this.toast.toast({
        title: "Transaction Failed",
        description: "Failed to add money to wallet",
        variant: "destructive"
      });
      return await this.getWallet();
    }
  }
}

export const useWalletLogic = () => {
  return new WalletLogic();
};
