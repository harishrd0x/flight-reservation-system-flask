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

export default function DashboardLayout() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Navigation items for admin and customer.
  const adminNavItems = [
    { name: "Flights Available", path: "/dashboard/flights", icon: <Plane className="h-5 w-5" /> },
    { name: "View Bookings", path: "/dashboard/bookings", icon: <Calendar className="h-5 w-5" /> },
    { name: "Wallets", path: "/dashboard/wallets", icon: <CreditCard className="h-5 w-5" /> },
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

  // Choose nav items based on the user's type.
  const navItems = user?.userType === "admin" ? adminNavItems : customerNavItems;

  // --- Wallet Fetching Logic ---
  // We'll fetch wallet details only when the current route is "/dashboard/wallet".
  const [wallet, setWallet] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string>("");

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
          if (!res.ok) {
            throw new Error("Failed to fetch wallet details");
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched wallet details:", data);
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
                {/* Add additional wallet details here if available */}
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
