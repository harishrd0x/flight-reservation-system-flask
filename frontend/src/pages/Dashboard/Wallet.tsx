import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

// Define a Transaction interface
interface Transaction {
  id: string;
  amount: number;
  type: "deposit" | "withdrawal" | "payment";
  description: string;
  date: string;
}

// Update Wallet interface to optionally include transactions.
interface Wallet {
  userId: string;
  userName: string;
  email: string;
  balance: number;
  transactions?: Transaction[];
}

function WalletsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for payment modal and form fields
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI"); // default option
  const [isProcessing, setIsProcessing] = useState(false);

  // State to track which wallets have their transaction history expanded
  const [expandedWallets, setExpandedWallets] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("User is not authenticated");
      setLoading(false);
      return;
    }

    // Fetch wallet data from your backend.
    // Your backend should return an array of wallet objects with optional transactions.
    fetch("http://localhost:5000/wallet/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error fetching wallets");
        }
        return response.json();
      })
      .then((data) => {
        setWallets(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching wallets:", err);
        setError("Error fetching wallets");
        setLoading(false);
      });
  }, []);

  const filteredWallets = wallets.filter(
    (wallet) =>
      wallet.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open the Add Funds modal for a wallet.
  const handleAddFunds = (wallet: Wallet) => {
    console.log("Opening add funds modal for wallet:", wallet);
    setSelectedWallet(wallet);
    setIsPaymentModalOpen(true);
  };

  // Toggle the transaction history display for a wallet.
  const handleToggleTransactions = (walletId: string) => {
    if (expandedWallets.includes(walletId)) {
      setExpandedWallets(expandedWallets.filter((id) => id !== walletId));
    } else {
      setExpandedWallets([...expandedWallets, walletId]);
    }
  };

  // Submit the payment to the backend URL "/wallet/add"
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

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/wallet/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          walletId: selectedWallet?.userId,
          amount: numericAmount,
          paymentMethod: paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add funds");
      }

      const resData = await response.json();
      // Assuming the backend returns the updated wallet balance as resData.balance

      toast({
        title: "Payment Successful",
        description: `₹${numericAmount.toFixed(2)} added via ${paymentMethod}!`,
      });

      // Update the wallet balance locally with the response value.
      if (selectedWallet) {
        setWallets((prevWallets) =>
          prevWallets.map((w) =>
            w.userId === selectedWallet.userId
              ? { ...w, balance: resData.balance }
              : w
          )
        );
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsPaymentModalOpen(false);
      setSelectedWallet(null);
      setAmount("");
    }
  };

  if (loading) {
    return <div>Loading wallets...</div>;
  }
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Wallets</h1>
        <p className="text-gray-500">View all customer wallet balances.</p>
      </div>

      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Search by customer name or email..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWallets.length > 0 ? (
          filteredWallets.map((wallet) => (
            <Card
              key={wallet.userId}
              className="overflow-hidden hover:shadow-lg transition"
            >
              <CardHeader className="bg-gray-50 pb-2">
                <CardTitle className="flex items-center">
                  <div className="bg-airline-blue text-white p-2 rounded-full mr-2">
                    <User className="h-4 w-4" />
                  </div>
                  {wallet.userName}
                </CardTitle>
                <p className="text-sm text-gray-500">{wallet.email}</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-between p-4 bg-airline-blue/10 rounded-lg mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Balance</p>
                    <h3 className="text-2xl font-bold">
                      ₹{(wallet.balance * 83).toFixed(2)}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => handleAddFunds(wallet)}
                    className="w-full bg-airline-blue hover:bg-airline-navy text-white transition"
                  >
                    Add Funds
                  </Button>
                  <Button
                    onClick={() => handleToggleTransactions(wallet.userId)}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                  >
                    {expandedWallets.includes(wallet.userId)
                      ? "Hide Transactions"
                      : "View Transactions"}
                  </Button>
                </div>
                {/* Transaction History */}
                {expandedWallets.includes(wallet.userId) && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-lg font-semibold mb-2">Transaction History</h4>
                    {wallet.transactions && wallet.transactions.length > 0 ? (
                      wallet.transactions.map((tx) => (
                        <div key={tx.id} className="mb-2 p-2 border rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">{tx.description}</span>
                            <span className={`font-semibold ${tx.type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                              {tx.type === "deposit" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{tx.date}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No transactions yet</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <User className="h-12 w-12 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium">No wallets found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search terms</p>
          </div>
        )}
      </div>

      {/* Payment Modal for Adding Funds */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="w-full max-w-sm p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Funds</DialogTitle>
            <DialogDescription>
              {selectedWallet
                ? `Add funds for ${selectedWallet.userName} (${selectedWallet.email})`
                : "Add funds"}
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
            <Button onClick={handlePaymentSubmit} disabled={isProcessing} className="ml-2">
              {isProcessing ? "Processing..." : "Proceed Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WalletsPage;
