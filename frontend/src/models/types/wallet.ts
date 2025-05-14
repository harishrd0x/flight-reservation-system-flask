// src/models/types/wallet.ts

export interface Wallet {
  id?: string;      // Primary key provided by the database
  userId?: string;  // The owner's user id (mapped from the backend column "user_id")
  balance: number;  // The wallet balance
}
