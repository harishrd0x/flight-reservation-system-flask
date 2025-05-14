import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import BookingCard from "@/components/bookings/BookingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { generateBookingPDF } from "@/utils/pdfUtils";
import { PassengerInfo } from "@/models/types/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Interface matching the booking DTO from your backend.
interface BookingDetails {
  id: string | number;
  flightId: string | number;
  userId: string | number;
  userName: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  price: number;
  status: "confirmed" | "pending" | "cancelled";
  bookingDate?: string;
  passengers?: PassengerInfo[];
}

export default function BookingsPage() {
  const { user, token } = useAuth();
  const isAdmin = user?.userType === "admin";

  // State variables.
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingDetails[]>([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);

  // Set your API base URL; the GET, cancel, and confirm endpoints are under /bookings.
  const API_BASE_URL = "http://localhost:5000/bookings";

  // Fetch bookings (GET /bookings).
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(API_BASE_URL, {
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
  }, [isAdmin, token]);

  // Filter bookings based on search term and role.
  useEffect(() => {
    let filtered = bookings;
    if (!isAdmin && user?.email) {
      // Only include bookings for the current user.
      filtered = bookings.filter((booking) => booking.userId === user.email);
    }
    filtered = filtered.filter((booking) =>
      booking.flightId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (isAdmin && booking.userName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredBookings(filtered);
  }, [searchTerm, bookings, isAdmin, user?.email]);

  // Handler for cancelling a booking. Calls PUT /bookings/cancel/<id> with payload { "status": "CANCELLED" }.
  const handleCancelBooking = async (id: string | number) => {
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
      const updatedBooking = await response.json();
      setBookings((prev) =>
        prev.map((booking) => (booking.id === id ? updatedBooking : booking))
      );
      toast({
        title: "Booking Cancelled",
        description: `Booking ${id} has been cancelled.`,
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

  // Handler for downloading a PDF.
  const handleDownloadPDF = (booking: BookingDetails) => {
    generateBookingPDF(booking);
  };

  // Handler for viewing booking details.
  const handleViewDetails = (id: string | number) => {
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      setSelectedBooking(booking);
      setIsDetailsDialogOpen(true);
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
              id={booking.id.toString()}
              flightId={booking.flightId.toString()}
              from={booking.from}
              fromCode={booking.fromCode}
              to={booking.to}
              toCode={booking.toCode}
              departureDate={booking.departureDate}
              departureTime={booking.departureTime}
              arrivalDate={booking.arrivalDate}
              arrivalTime={booking.arrivalTime}
              price={booking.price}
              status={booking.status}
              onCancel={() => handleCancelBooking(booking.id)}
              onViewDetails={() => handleViewDetails(booking.id)}
              onDownloadPdf={() => handleDownloadPDF(booking)}
              passengers={booking.passengers}
            />
          ))}
        </div>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              {selectedBooking && (
                <div className="space-y-2">
                  <p>
                    <strong>Booking ID:</strong> {selectedBooking.id}
                  </p>
                  <p>
                    <strong>Flight ID:</strong> {selectedBooking.flightId}
                  </p>
                  <p>
                    <strong>Route:</strong> {selectedBooking.from} (
                    {selectedBooking.fromCode}) to {selectedBooking.to} (
                    {selectedBooking.toCode})
                  </p>
                  <p>
                    <strong>Departure:</strong>{" "}
                    {selectedBooking.departureDate} at{" "}
                    {selectedBooking.departureTime}
                  </p>
                  <p>
                    <strong>Arrival:</strong> {selectedBooking.arrivalDate} at{" "}
                    {selectedBooking.arrivalTime}
                  </p>
                  <p>
                    <strong>Price:</strong> ₹{selectedBooking.price}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedBooking.status}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
