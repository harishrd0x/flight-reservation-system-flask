import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_URL = "http://127.0.0.1:5000/flights/";
const BOOKING_API_URL = "http://127.0.0.1:5000/bookings/book_flight";
const CONFIRM_API_URL = "http://127.0.0.1:5000/bookings/confirm";

interface PriceData {
  flight_class: string;
  flight_id: number;
  id: number;
  price: number;
}

interface FlightData {
  id: number;
  flight_name: string;
  airplane_id: number;
  source_airport_id: number;
  destination_airport_id: number;
  departure_time: string;
  arrival_time: string;
  status: string;
  prices?: PriceData[];
}

export default function FlightsPage() {
  const { user, token } = useAuth();
  const isAdmin = user?.userType === "admin"; // Verify admin status

  const [searchTerm, setSearchTerm] = useState("");
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<FlightData[]>([]);
  const [isAddingFlight, setIsAddingFlight] = useState(false);
  const [newFlight, setNewFlight] = useState({
    flight_name: "",
    airplane_id: "",
    source_airport_id: "",
    destination_airport_id: "",
    departure_time: "",
    arrival_time: "",
    status: "ACTIVE",
  });

  // Mapping of airport id to airport name.
  const [airports, setAirports] = useState<Record<number, string>>({});

  // Booking dialog state.
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);
  const [seatClass, setSeatClass] = useState("ECONOMY");
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Fetch airport details and build mapping.
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/airports/");
        if (!response.ok) {
          throw new Error("Failed to fetch airports");
        }
        const data = await response.json();
        const airportMapping: Record<number, string> = {};
        data.forEach((airport: any) => {
          airportMapping[airport.id] = airport.name;
        });
        setAirports(airportMapping);
      } catch (error) {
        console.error("Error fetching airports:", error);
        toast({
          title: "Error",
          description: "Failed to fetch airport details",
          variant: "destructive",
        });
      }
    };

    fetchAirports();
  }, []);

  // Fetch flights.
  const fetchFlights = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch flights");
      const data = await response.json();
      console.log("Fetched flights:", data);
      setFlights(data);
      setFilteredFlights(data);
    } catch (error) {
      console.error("Error fetching flights:", error);
      toast({
        title: "Error",
        description: "Failed to fetch flights",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  // Filter flights based on the search term.
  useEffect(() => {
    if (!searchTerm) {
      setFilteredFlights(flights);
      return;
    }
    const filtered = flights.filter(
      (flight) =>
        flight.flight_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(flight.id).includes(searchTerm)
    );
    console.log("Filtered flights:", filtered);
    setFilteredFlights(filtered);
  }, [searchTerm, flights]);

  // Admin: Add Flight.
  const handleAddFlight = async () => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "Only admins can add flights.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newFlight),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add flight");
      }
      await fetchFlights();
      toast({
        title: "Flight Added",
        description: `${newFlight.flight_name} has been added.`,
      });
      setIsAddingFlight(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Open booking dialog.
  const openBookingDialog = (flight: FlightData) => {
    setSelectedFlight(flight);
    setSeatClass("ECONOMY"); // default seat class
    setCreatedBooking(null); // Reset previous booking state.
    setIsBookingDialogOpen(true);
  };

  // Step 1: Create booking.
  const handleConfirmBooking = async () => {
    if (!selectedFlight) {
      toast({
        title: "Error",
        description: "No flight selected",
        variant: "destructive",
      });
      return;
    }
    if (!token) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch(BOOKING_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          flight_id: selectedFlight.id,
          seat_class: seatClass,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }
      const resData = await response.json();
      console.log("Booking created:", resData);
      toast({
        title: "Booking Created",
        description: resData.message || "Flight booking created!",
      });
      const bookingData = resData.booking || resData;
      setCreatedBooking(bookingData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Step 2: Confirm ticket/payment.
  const handleConfirmTicket = async () => {
    if (!createdBooking || !createdBooking.id) {
      toast({
        title: "Error",
        description: "No booking available to confirm",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch(
        `${CONFIRM_API_URL}/${createdBooking.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ payment_status: "PAID" }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to confirm ticket/payment"
        );
      }
      const resData = await response.json();
      console.log("Ticket confirmed:", resData);
      toast({
        title: "Ticket Confirmed",
        description:
          resData.message || "Payment successful and ticket confirmed!",
      });
      setCreatedBooking(null);
      setSelectedFlight(null);
      setIsBookingDialogOpen(false);
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
      <h1 className="text-3xl font-bold mb-4">Flights</h1>

      <div className="relative mb-4">
        <Input
          placeholder="Search flights..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
      </div>

      {isAdmin && (
        <Button onClick={() => setIsAddingFlight(true)} className="mb-4">
          Add Flight
        </Button>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredFlights.map((flight) => (
          <Card key={flight.id} className="p-4">
            <CardHeader>
              <CardTitle>{flight.flight_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                From: {airports[flight.source_airport_id] || flight.source_airport_id}
                <br />
                To: {airports[flight.destination_airport_id] || flight.destination_airport_id}
              </p>
              <p>
                Departure: {new Date(flight.departure_time).toLocaleString()}
                <br />
                Arrival: {new Date(flight.arrival_time).toLocaleString()}
              </p>
              {flight.prices && flight.prices.length > 0 && (
                <div className="mt-2">
                  {flight.prices.map((price) => (
                    <p key={price.id}>
                      {price.flight_class}: ₹{price.price}
                    </p>
                  ))}
                </div>
              )}
              {/* Removed delete button */}
              {!isAdmin && (
                <Button
                  onClick={() => openBookingDialog(flight)}
                  className="mt-2 float-right"
                >
                  Book Flight
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Flight Dialog for admin */}
      {isAdmin && (
        <Dialog open={isAddingFlight} onOpenChange={setIsAddingFlight}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Flight</DialogTitle>
            </DialogHeader>
            <Label>Flight Name</Label>
            <Input
              name="flight_name"
              value={newFlight.flight_name}
              onChange={(e) =>
                setNewFlight({ ...newFlight, flight_name: e.target.value })
              }
            />
            <Label>Airplane ID</Label>
            <Input
              name="airplane_id"
              value={newFlight.airplane_id}
              onChange={(e) =>
                setNewFlight({ ...newFlight, airplane_id: e.target.value })
              }
            />
            <Label>Source Airport ID</Label>
            <Input
              name="source_airport_id"
              value={newFlight.source_airport_id}
              onChange={(e) =>
                setNewFlight({ ...newFlight, source_airport_id: e.target.value })
              }
            />
            <Label>Destination Airport ID</Label>
            <Input
              name="destination_airport_id"
              value={newFlight.destination_airport_id}
              onChange={(e) =>
                setNewFlight({
                  ...newFlight,
                  destination_airport_id: e.target.value,
                })
              }
            />
            <Label>Departure Time</Label>
            <Input
              name="departure_time"
              type="datetime-local"
              value={newFlight.departure_time}
              onChange={(e) =>
                setNewFlight({ ...newFlight, departure_time: e.target.value })
              }
            />
            <Label>Arrival Time</Label>
            <Input
              name="arrival_time"
              type="datetime-local"
              value={newFlight.arrival_time}
              onChange={(e) =>
                setNewFlight({ ...newFlight, arrival_time: e.target.value })
              }
            />
            <DialogFooter>
              <Button onClick={handleAddFlight}>Submit Flight</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Booking Dialog for non-admin users */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Flight</DialogTitle>
          </DialogHeader>
          {selectedFlight && (
            <div className="space-y-4 pt-4">
              <p>
                <strong>Flight:</strong> {selectedFlight.flight_name}
              </p>
              <Label htmlFor="seat_class">Seat Class</Label>
              <select
                id="seat_class"
                className="border rounded p-2 w-full"
                value={seatClass}
                onChange={(e) => setSeatClass(e.target.value)}
              >
                <option value="ECONOMY">Economy</option>
                <option value="BUSINESS">Business</option>
              </select>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsBookingDialogOpen(false);
                setCreatedBooking(null);
                setSelectedFlight(null);
              }}
            >
              Cancel
            </Button>
            {createdBooking ? (
              <Button onClick={handleConfirmTicket}>Confirm Ticket</Button>
            ) : (
              <Button onClick={handleConfirmBooking}>Confirm Booking</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
