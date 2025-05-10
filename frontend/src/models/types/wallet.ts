
export interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string;
  date: string;
}

export interface Wallet {
  id?: string;
  userId?: string;
  balance: number;
  transactions?: Transaction[];
}
