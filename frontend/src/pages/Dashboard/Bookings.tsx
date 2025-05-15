// src/pages/Dashboard/Bookings.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import BookingCard from "@/components/bookings/BookingCard";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { generateBookingPDF } from "@/utils/pdfUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PassengerInfo } from "@/models/types/user";
import { Button } from "@/components/ui/button";

// Interface matching the backend response for a booking.
interface BookingDetails {
  id: number | string;
  flight_id?: number | string;  // optional in case it's missing
  booking_price: number;
  booking_status: "confirmed" | "pending" | "cancelled" | string;
  created_at: string;
  seat_class: string;
  user_id: number | string;
  user_name: string;
  passengers?: PassengerInfo[];
  from?: string;
  fromCode?: string;
  to?: string;
  toCode?: string;
  departureDate?: string;
  departureTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  refund_amount?: number; // Optional field for refund amount if provided by backend
}

export default function BookingsPage() {
  const { user, token } = useAuth();
  const isAdmin = user?.userType === "admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingDetails[]>([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  
  // New state variables for refund popup.
  const [refundAmount, setRefundAmount] = useState<number | null>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);

  // Base API URL – assuming your blueprint is registered with the prefix "/bookings"
  const API_BASE_URL = "http://localhost:5000/bookings";

  // Fetch bookings on mount.
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // For non-admin users, use the user-specific endpoint by email.
        const endpoint = isAdmin
          ? API_BASE_URL
          : `${API_BASE_URL}/user/${encodeURIComponent(user?.email || "")}`;
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch bookings from the backend.");
        }
        const data = await response.json();
        console.log("Fetched bookings:", data);
        setBookings(data);
      } catch (error: any) {
        console.error("Error loading bookings:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load bookings.",
          variant: "destructive",
        });
      }
    };

    fetchBookings();
  }, [isAdmin, token, user]);

  // Filter bookings based on the search term.
  useEffect(() => {
    const search = searchTerm.toLowerCase();
    const filtered = bookings.filter((booking) => {
      const flightMatch = booking.flight_id
        ? booking.flight_id.toString().toLowerCase().includes(search)
        : false;
      const fromMatch = booking.from ? booking.from.toLowerCase().includes(search) : false;
      const toMatch = booking.to ? booking.to.toLowerCase().includes(search) : false;
      const userNameMatch = isAdmin
        ? booking.user_name.toLowerCase().includes(search)
        : false;
      return flightMatch || fromMatch || toMatch || userNameMatch;
    });
    setFilteredBookings(filtered);
  }, [searchTerm, bookings, isAdmin]);

  // Handler for cancelling a booking.
  const handleCancelBooking = async (id: number | string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cancel/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (!response.ok) {
        throw new Error("Failed to cancel booking on the backend.");
      }
      const updatedBooking: BookingDetails = await response.json();
      setBookings((prev) =>
        prev.map((booking) => (booking.id === id ? updatedBooking : booking))
      );
      
      // If the backend response includes a refund amount, show the refund popup.
      if (updatedBooking.refund_amount !== undefined) {
        setRefundAmount(updatedBooking.refund_amount);
        setIsRefundDialogOpen(true);
      }
      
      toast({
        title: "Booking Cancelled",
        description: `Booking ${id} has been cancelled. Refund: ₹${updatedBooking.refund_amount ?? 0}`,
      });
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking.",
        variant: "destructive",
      });
    }
  };

  // Handler to download a PDF.
  const handleDownloadPDF = (booking: BookingDetails) => {
    generateBookingPDF(booking);
  };

  // Handler for viewing booking details.
  const handleViewDetails = (id: number | string) => {
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      setSelectedBooking(booking);
      setIsDetailsDialogOpen(true);
    }
  };

  // Handler for confirming a ticket/payment using PUT.
  const handleConfirmTicket = async (bookingId: number | string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/confirm/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ payment_status: "PAID" }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Failed to confirm booking.");
        } catch (e) {
          throw new Error(`Request failed: ${errorText}`);
        }
      }

      // Safely parse the response.
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Could not parse JSON from response:", responseText);
        throw new Error("Unexpected response format while confirming booking.");
      }
      console.log("Booking confirmed:", data);
      toast({
        title: "Booking Confirmed",
        description: data.message || "Payment successful and ticket confirmed!",
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, booking_status: "confirmed" } : b
        )
      );
      setIsDetailsDialogOpen(false);
      setSelectedBooking(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Bookings</h1>

      <Input
        placeholder="Search bookings..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      {filteredBookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              id={booking.id}
              flightId={booking.flight_id || "N/A"}
              from={booking.from || "N/A"}
              fromCode={booking.fromCode || "N/A"}
              to={booking.to || "N/A"}
              toCode={booking.toCode || "N/A"}
              departureDate={booking.departureDate || "N/A"}
              departureTime={booking.departureTime || "N/A"}
              arrivalDate={booking.arrivalDate || "N/A"}
              arrivalTime={booking.arrivalTime || "N/A"}
              price={booking.booking_price}
              status={booking.booking_status as "confirmed" | "pending" | "cancelled"}
              onCancel={() => handleCancelBooking(booking.id)}
              onViewDetails={() => handleViewDetails(booking.id)}
              onDownloadPdf={() => handleDownloadPDF(booking)}
              passengers={booking.passengers}
            />
          ))}
        </div>
      )}

      {/* Dialog for booking details */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              {selectedBooking && (
                <>
                  <span>
                    <strong>Booking ID:</strong> {selectedBooking.id}
                  </span>
                  <br />
                  <span>
                    <strong>Flight ID:</strong> {selectedBooking.flight_id || "N/A"}
                  </span>
                  <br />
                  <span>
                    <strong>Route:</strong> {selectedBooking.from || "N/A"} (
                    {selectedBooking.fromCode || "N/A"}) to {selectedBooking.to || "N/A"} (
                    {selectedBooking.toCode || "N/A"})
                  </span>
                  <br />
                  <span>
                    <strong>Departure:</strong> {selectedBooking.departureDate || "N/A"} at{" "}
                    {selectedBooking.departureTime || "N/A"}
                  </span>
                  <br />
                  <span>
                    <strong>Arrival:</strong> {selectedBooking.arrivalDate || "N/A"} at{" "}
                    {selectedBooking.arrivalTime || "N/A"}
                  </span>
                  <br />
                  <span>
                    <strong>Price:</strong> ₹{selectedBooking.booking_price.toFixed(2)}
                  </span>
                  <br />
                  <span>
                    <strong>Status:</strong> {selectedBooking.booking_status}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
            {selectedBooking &&
              selectedBooking.booking_status &&
              selectedBooking.booking_status.toLowerCase() === "pending" && (
                <Button
                  onClick={() => handleConfirmTicket(selectedBooking.id)}
                  className="ml-2"
                >
                  Confirm Ticket
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog to show refund amount after cancellation */}
<Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Refund Amount</DialogTitle>
      <DialogDescription>
        {selectedBooking?.booking_price !== undefined
          ? `Your refund amount is ₹${selectedBooking.booking_price.toFixed(2)}.`
          : "No refund amount available."}
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button onClick={() => setIsRefundDialogOpen(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
  
      </div>
    );
  }