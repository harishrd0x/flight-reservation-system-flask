import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

// Wallet interface (only includes balance)
interface Wallet {
  userId: string;
  userName: string;
  balance: number;
}

function WalletsPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("User is not authenticated");
      setLoading(false);
      return;
    }

    // Fetch user's wallet from the backend
    fetch("http://localhost:5000/wallet/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error fetching wallet");
        return response.json();
      })
      .then((data) => {
        setWallet({
          userId: data.userId,
          userName: data.userName,
          balance: data.balance,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching wallet:", err);
        setError("Error fetching wallet");
        setLoading(false);
      });
  }, []);

  // Open Add Funds modal
  const handleAddFunds = () => {
    setIsPaymentModalOpen(true);
  };

  // Submit payment request
  const handlePaymentSubmit = async () => {
    if (!amount) {
      toast({
        title: "Error",
        description: "Please enter an amount.",
        variant: "destructive",
      });
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Error",
        description: "Invalid amount.",
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
          amount: numericAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add funds");
      }

      const resData = await response.json();

      toast({
        title: "Payment Successful",
        description: `₹${numericAmount.toFixed(2)} added!`,
      });

      // Update wallet balance locally
      setWallet((prevWallet) =>
        prevWallet ? { ...prevWallet, balance: resData.balance } : prevWallet
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsPaymentModalOpen(false);
      setAmount("");
    }
  };

  if (loading) return <div>Loading wallet...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Your Wallet</h1>

      <Card className="p-4">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <User className="mr-2 h-5 w-5 text-wallet-blue" />
            {wallet?.userName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Balance: ₹{wallet?.balance.toFixed(2)}</p>
          <Button onClick={handleAddFunds} className="mt-2">
            Add Funds
          </Button>
        </CardContent>
      </Card>

      {/* Add Funds Dialog */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
          </DialogHeader>
          <Label>Amount (₹)</Label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={handlePaymentSubmit} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Add Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WalletsPage;
