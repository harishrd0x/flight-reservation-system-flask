import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Search, Calendar, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Define a FlightPrice interface.
interface FlightPrice {
  id: number;
  flight_id: number;
  flight_class: string;
  price: number;
}

// Define the FlightData interface including a prices array.
interface FlightData {
  id: number;
  flight_name: string;
  airplane_id: number;
  source_airport_id: number;
  destination_airport_id: number;
  departure_time: string;
  arrival_time: string;
  status: string; // mapped from flight_status returned by backend.
  prices: FlightPrice[];
}

// Define a Passenger interface for the booking form.
interface Passenger {
  name: string;
  age: string;
}

export default function FlightsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.userType === "admin";
  const [searchTerm, setSearchTerm] = useState("");
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<FlightData[]>([]);

  // State for booking dialog and multi-passenger form.
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null);
  // Initialize with one empty passenger
  const [passengers, setPassengers] = useState<Passenger[]>([{ name: "", age: "" }]);

  // Fetch flights from the backend.
  useEffect(() => {
    fetch("http://127.0.0.1:5000/flights/")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched flights from backend:", data);
        // Map backend's flight_status to local status & include prices.
        const mappedFlights: FlightData[] = data.map((flight: any) => ({
          id: flight.id,
          flight_name: flight.flight_name,
          airplane_id: flight.airplane_id,
          source_airport_id: flight.source_airport_id,
          destination_airport_id: flight.destination_airport_id,
          departure_time: flight.departure_time,
          arrival_time: flight.arrival_time,
          status: flight.flight_status || flight.status,
          prices: flight.prices || [],
        }));
        setFlights(mappedFlights);
      })
      .catch((error) => {
        console.error("Error fetching flights:", error);
        toast({
          title: "Error",
          description: "Failed to fetch flights from the server.",
          variant: "destructive",
        });
      });
  }, []);

  // Filter flights based on the search term.
  useEffect(() => {
    const filtered = flights.filter(
      (flight) =>
        flight.flight_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(flight.id).includes(searchTerm)
    );
    setFilteredFlights(filtered);
  }, [searchTerm, flights]);

  // Simple function to format date/time strings.
  const formatDateTime = (dateTimeStr: string) => {
    const dt = new Date(dateTimeStr);
    return dt.toLocaleString();
  };

  // Opens the booking dialog and sets the selected flight.
  const handleBooking = (flightId: number) => {
    setSelectedFlightId(flightId);
    setIsBookingDialogOpen(true);
    // Clear previous passengers (start fresh with one empty entry)
    setPassengers([{ name: "", age: "" }]);
  };

  // Add a new blank passenger to the list.
  const handleAddPassenger = () => {
    setPassengers([...passengers, { name: "", age: "" }]);
  };

  // Handle changes in the passenger fields.
  const handlePassengerChange = (index: number, field: "name" | "age", value: string) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
    setPassengers(updatedPassengers);
  };

  // Submit the booking with all passenger details.
  const handleBookingSubmit = async () => {
    // Validate that all passenger fields are filled.
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].name || !passengers[i].age) {
        toast({
          title: "Error",
          description: `Please fill out all details for passenger ${i + 1}.`,
          variant: "destructive",
        });
        return;
      }
    }
    if (!selectedFlightId) {
      toast({
        title: "Error",
        description: "No flight selected for booking.",
        variant: "destructive",
      });
      return;
    }

    // Build the payload. Backend is expected to accept an array of passengers.
    const bookingPayload = {
      flight_id: selectedFlightId,
      passengers: passengers.map((p) => ({
        passenger_name: p.name,
        passenger_age: parseInt(p.age, 10),
      })),
    };

    try {
      const bookingResponse = await fetch("http://localhost:5000/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      toast({
        title: "Booking Successful",
        description: "Booking created successfully!",
      });

      // Clear the form fields and close the dialog.
      setPassengers([{ name: "", age: "" }]);
      setSelectedFlightId(null);
      setIsBookingDialogOpen(false);

      // Redirect to the booking page.
      navigate("/bookings");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
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
      <div className="grid grid-cols-1 gap-4">
        {filteredFlights.map((flight) => (
          <Card key={flight.id} className="p-4">
            <CardHeader>
              <CardTitle>{flight.flight_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Departure: {formatDateTime(flight.departure_time)}
                <br />
                Arrival: {formatDateTime(flight.arrival_time)}
              </p>
              <Button onClick={() => handleBooking(flight.id)} className="mt-2">
                Book Flight
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Flight</DialogTitle>
            <DialogDescription>
              Enter passenger details for the booking.
            </DialogDescription>
          </DialogHeader>
          {passengers.map((passenger, index) => (
            <div key={index} className="mb-4">
              <Label>Passenger {index + 1} Name</Label>
              <Input
                placeholder="Name"
                value={passenger.name}
                onChange={(e) =>
                  handlePassengerChange(index, "name", e.target.value)
                }
                className="mb-2"
              />
              <Label>Passenger {index + 1} Age</Label>
              <Input
                placeholder="Age"
                value={passenger.age}
                onChange={(e) =>
                  handlePassengerChange(index, "age", e.target.value)
                }
              />
            </div>
          ))}
          <Button onClick={handleAddPassenger} variant="outline" className="mb-4">
            Add Another Passenger
          </Button>
          <DialogFooter>
            <Button onClick={handleBookingSubmit}>Submit Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
