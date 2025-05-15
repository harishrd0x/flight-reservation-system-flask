// DashboardLayout.tsx
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Plane,
  Calendar,
  CreditCard,
  MessageSquare,
  Users,
  Building2,
  PlusCircle,
} from "lucide-react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

// Navigation items for admin and customer.
const adminNavItems = [
  { name: "Flights Available", path: "/dashboard/flights", icon: <Plane className="h-5 w-5" /> },
  { name: "View Bookings", path: "/dashboard/bookings", icon: <Calendar className="h-5 w-5" /> },
  // { name: "Wallets", path: "/dashboard/wallet", icon: <CreditCard className="h-5 w-5" /> },
  { name: "Add Airplanes", path: "/dashboard/add-airplane", icon: <PlusCircle className="h-5 w-5" /> },
  { name: "Add Flight", path: "/dashboard/add-flight", icon: <Plane className="h-5 w-5" /> },
  { name: "Add Airport", path: "/dashboard/add-airport", icon: <Building2 className="h-5 w-5" /> },
  { name: "View Reviews", path: "/dashboard/reviews", icon: <MessageSquare className="h-5 w-5" /> },
];

const customerNavItems = [
  { name: "Flights Available", path: "/dashboard/flights", icon: <Plane className="h-5 w-5" /> },
  { name: "View Bookings", path: "/dashboard/bookings", icon: <Calendar className="h-5 w-5" /> },
  { name: "Wallet", path: "/dashboard/wallet", icon: <CreditCard className="h-5 w-5" /> },
  { name: "Passengers", path: "/dashboard/passengers", icon: <Users className="h-5 w-5" /> },
  { name: "Submit Review", path: "/dashboard/review", icon: <MessageSquare className="h-5 w-5" /> },
];

export default function DashboardLayout() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Choose nav items based on the user's type.
  const navItems = user?.userType === "admin" ? adminNavItems : customerNavItems;

  // --- Wallet Fetching, Transactions & Payment Logic ---
  // Only for route "/dashboard/wallet"
  const [wallet, setWallet] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string>("");

  // Payment modal and fields state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Mock Pay"); // default method
  const [isProcessing, setIsProcessing] = useState(false);

  // Extra payment details state:
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");

  useEffect(() => {
    if (location.pathname === "/dashboard/wallet") {
      if (!token) {
        setWalletError("User is not authenticated.");
        setWalletLoading(false);
        return;
      }
      setWalletLoading(true);
      fetch("http://localhost:5000/wallet/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch wallet details");
          return res.json();
        })
        .then((data) => {
          console.log("Fetched wallet details:", data);
          // Save wallet data to localStorage (for temporary persistence)
          localStorage.setItem("wallet", JSON.stringify(data));
          setWallet(data);
        })
        .catch((err: any) => {
          console.error("Wallet fetch error:", err);
          setWalletError(err.message || "Error fetching wallet details");
        })
        .finally(() => {
          setWalletLoading(false);
        });
    }
  }, [location.pathname, token]);

  // Handle opening the "Add Funds" modal
  const handleAddFunds = () => {
    console.log("Opening Add Funds Modal");
    setIsPaymentModalOpen(true);
  };

  // Handle payment submission; update wallet balance and transactions in localStorage
  const handlePaymentSubmit = async () => {
    if (!amount) {
      toast({ title: "Error", description: "Please enter an amount.", variant: "destructive" });
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: "Error", description: "Invalid amount.", variant: "destructive" });
      return;
    }

    // Build paymentDetails based on selected method
    let paymentDetails: any = {};
    if (paymentMethod === "Credit Card") {
      paymentDetails = { cardNumber, expiry, cvv };
    } else if (paymentMethod === "UPI" || paymentMethod === "PhonePe") {
      paymentDetails = { upiId };
    } else if (paymentMethod === "PayPal") {
      paymentDetails = { paypalEmail };
    }
    console.log("Processing payment:", numericAmount, "via", paymentMethod, "with details:", paymentDetails);
    setIsProcessing(true);
    try {
      const response = await fetch("http://localhost:5000/wallet/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ amount: numericAmount, paymentMethod, paymentDetails }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add funds");
      }
      const resData = await response.json();
      console.log("Payment successful:", resData);
      
      // Fallback calculation in case response does not include updated balance
      const newBalance = resData.balance !== undefined ? Number(resData.balance) : Number(wallet.balance) + numericAmount;

      toast({
        title: "Payment Successful",
        description: `₹${numericAmount.toFixed(2)} added via ${paymentMethod}!`,
      });

      // Create a new transaction object
      const newTransaction = {
        id: `t${Date.now()}`,
        amount: numericAmount,
        type: "deposit",
        description: `Funds added via ${paymentMethod}`,
        date: new Date().toLocaleString(),
      };

      // Update wallet state with new balance and transaction
      const updatedWallet = wallet
        ? {
            ...wallet,
            balance: newBalance,
            transactions: wallet.transactions 
              ? [newTransaction, ...wallet.transactions] 
              : [newTransaction],
          }
        : null;
      setWallet(updatedWallet);
      localStorage.setItem("wallet", JSON.stringify(updatedWallet));
    } catch (error: any) {
      console.error("Error processing payment:", error.message);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setIsPaymentModalOpen(false);
      setAmount("");
      // Reset extra payment fields
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setUpiId("");
      setPaypalEmail("");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar items={navItems} />
        <div className="flex-1 p-6 md:p-8">
          {location.pathname === "/dashboard/wallet" ? (
            walletLoading ? (
              <div>Loading wallet data...</div>
            ) : walletError ? (
              <div className="text-red-500">{walletError}</div>
            ) : wallet ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">Your Wallet</h2>
                <p>Balance: ₹{Number(wallet.balance).toFixed(2)}</p>
                <Button onClick={handleAddFunds} className="mt-4">
                  Add Funds
                </Button>
                <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Funds</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Amount Input */}
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (₹)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            className="pl-8"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>
                      {/* Payment Method Selector */}
                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <div className="flex space-x-4">
                          {/* Credit Card Option */}
                          <label
                            className={`flex items-center cursor-pointer transition-transform duration-300 hover:scale-105 p-2 rounded-md border ${
                              paymentMethod === "Credit Card"
                                ? "border-airline-blue bg-airline-blue text-white"
                                : "border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="Credit Card"
                              checked={paymentMethod === "Credit Card"}
                              onChange={() => setPaymentMethod("Credit Card")}
                              className="appearance-none w-4 h-4 mr-1"
                            />
                            Credit Card
                          </label>
                          {/* UPI Option */}
                          <label
                            className={`flex items-center cursor-pointer transition-transform duration-300 hover:scale-105 p-2 rounded-md border ${
                              paymentMethod === "UPI"
                                ? "border-airline-blue bg-airline-blue text-white"
                                : "border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="UPI"
                              checked={paymentMethod === "UPI"}
                              onChange={() => setPaymentMethod("UPI")}
                              className="appearance-none w-4 h-4 mr-1"
                            />
                            UPI
                          </label>
                          {/* PayPal Option */}
                          <label
                            className={`flex items-center cursor-pointer transition-transform duration-300 hover:scale-105 p-2 rounded-md border ${
                              paymentMethod === "PayPal"
                                ? "border-airline-blue bg-airline-blue text-white"
                                : "border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="PayPal"
                              checked={paymentMethod === "PayPal"}
                              onChange={() => setPaymentMethod("PayPal")}
                              className="appearance-none w-4 h-4 mr-1"
                            />
                            PayPal
                          </label>
                          {/* Mock Pay Option */}
                          <label
                            className={`flex items-center cursor-pointer transition-transform duration-300 hover:scale-105 p-2 rounded-md border ${
                              paymentMethod === "Mock Pay"
                                ? "border-airline-blue bg-airline-blue text-white"
                                : "border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="Mock Pay"
                              checked={paymentMethod === "Mock Pay"}
                              onChange={() => setPaymentMethod("Mock Pay")}
                              className="appearance-none w-4 h-4 mr-1"
                            />
                            Mock Pay
                          </label>
                        </div>
                      </div>
                      {/* Conditionally render additional fields */}
                      {paymentMethod === "Credit Card" && (
                        <div className="mt-4 space-y-2">
                          <Label>Card Number</Label>
                          <Input
                            type="text"
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                          />
                          <Label>Expiry (MM/YY)</Label>
                          <Input
                            type="text"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                          />
                          <Label>CVV</Label>
                          <Input
                            type="password"
                            placeholder="CVV"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                          />
                        </div>
                      )}
                      {(paymentMethod === "UPI" || paymentMethod === "PhonePe") && (
                        <div className="mt-4">
                          <Label>UPI ID</Label>
                          <Input
                            type="text"
                            placeholder="example@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                          />
                        </div>
                      )}
                      {paymentMethod === "PayPal" && (
                        <div className="mt-4">
                          <Label>PayPal Email</Label>
                          <Input
                            type="email"
                            placeholder="your-email@example.com"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePaymentSubmit}
                        disabled={isProcessing}
                        className="bg-airline-blue hover:bg-airline-navy"
                      >
                        {isProcessing ? "Processing..." : "Add Funds"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div>No wallet data available.</div>
            )
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
}
