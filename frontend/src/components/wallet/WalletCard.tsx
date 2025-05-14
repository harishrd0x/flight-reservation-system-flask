import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, CreditCard, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

export interface Transaction {
  id: string;
  amount: number;
  type: "deposit" | "withdrawal" | "payment";
  description: string;
  date: string;
}

export interface Wallet {
  id?: string;
  userId?: string;
  balance: number;
  transactions?: Transaction[];
}

interface WalletCardProps {
  balance: number;
  transactions: Transaction[];
  onFundsAdded?: (amount: number, paymentMethod: string) => void;
}

const WalletCard: React.FC<WalletCardProps> = ({
  balance,
  transactions,
  onFundsAdded,
}) => {
  // State for controlling the payment dialog.
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI"); // Default to UPI
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddFunds = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!amount) {
      toast({
        title: "Error",
        description: "Please enter an amount to add.",
        variant: "destructive",
      });
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    // Simulate a payment processing delay
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Payment Successful",
        description: `₹${numericAmount.toFixed(2)} added to your wallet via ${paymentMethod}!`,
      });
      setIsPaymentModalOpen(false);
      setAmount("");
      if (onFundsAdded) {
        onFundsAdded(numericAmount, paymentMethod);
      }
    }, 2000);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-2xl">Your Wallet</CardTitle>
          <Button
            onClick={handleAddFunds}
            className="bg-airline-blue hover:bg-airline-navy text-white transition-colors"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Funds
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-airline-blue/10 rounded-lg mb-6">
            <div>
              <p className="text-sm text-gray-500">Current Balance</p>
              <h3 className="text-3xl font-bold">₹{(balance * 83).toFixed(2)}</h3>
            </div>
            <CreditCard className="h-12 w-12 text-airline-blue opacity-70" />
          </div>
          <h4 className="font-medium text-lg mb-4">Recent Transactions</h4>
          <div className="space-y-4">
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center p-3 border rounded-lg shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type === "deposit"
                          ? "bg-green-100 text-green-600"
                          : transaction.type === "withdrawal"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {transaction.type === "deposit" ? (
                        <PlusCircle className="h-4 w-4" />
                      ) : transaction.type === "withdrawal" ? (
                        <CreditCard className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div
                    className={`font-semibold ${
                      transaction.type === "deposit" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "deposit" ? "+" : "-"}₹
                    {(transaction.amount * 83).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                No transactions yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal for Adding Funds */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="w-full max-w-sm p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Add Funds
            </DialogTitle>
            <DialogDescription>
              Enter the amount and select a payment method to add funds to your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700">
                Payment Method
              </Label>
              <div className="mt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`block w-full px-4 py-2 text-sm border rounded-md transition-colors ${
                    paymentMethod === "UPI"
                      ? "bg-airline-blue text-white border-airline-blue"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  UPI / PhonePe
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`block w-full px-4 py-2 text-sm border rounded-md transition-colors ${
                    paymentMethod === "CARD"
                      ? "bg-airline-blue text-white border-airline-blue"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Credit/Debit Card
                </button>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePaymentSubmit}
              disabled={isProcessing}
              className="ml-2"
            >
              {isProcessing ? "Processing..." : "Proceed Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletCard;
