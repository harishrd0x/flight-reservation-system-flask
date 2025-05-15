import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Plane } from "lucide-react";

export default function AddFlightPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const isAdmin = user?.userType === "admin"; // Verify admin status

  // Flight details state
  const [flightName, setFlightName] = useState("");
  const [airplaneId, setAirplaneId] = useState("");
  const [sourceAirportId, setSourceAirportId] = useState("");
  const [destinationAirportId, setDestinationAirportId] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [economyPrice, setEconomyPrice] = useState("");
  const [businessPrice, setBusinessPrice] = useState("");

  const handleFlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ❌ **Prevent Non-Admins from Submitting**
    if (!isAdmin) {
      toast({ title: "Unauthorized", description: "Only admins can add flights.", variant: "destructive" });
      return;
    }

    // Validation
    if (!flightName || !airplaneId || !sourceAirportId || !destinationAirportId || !departureDate || !departureTime || !arrivalDate || !arrivalTime) {
      toast({ title: "Error", description: "Please fill out all flight details.", variant: "destructive" });
      return;
    }

    const departureDateTime = `${departureDate}T${departureTime}`;
    const arrivalDateTime = `${arrivalDate}T${arrivalTime}`;

    const flightPayload = {
      flight_name: flightName,
      airplane_id: parseInt(airplaneId),
      source_airport_id: parseInt(sourceAirportId),
      destination_airport_id: parseInt(destinationAirportId),
      departure_time: departureDateTime,
      arrival_time: arrivalDateTime,
      status: status,
    };

    try {
      // ✅ **Include Token in Request Headers**
      const flightResponse = await fetch("http://localhost:5000/flights/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(flightPayload),
      });

      if (!flightResponse.ok) {
        const errData = await flightResponse.json();
        throw new Error(errData.error || "Failed to create flight");
      }

      const flightResult = await flightResponse.json();
      toast({ title: "Flight Created", description: "Flight created successfully." });

      // Add flight pricing (optional)
      const flightId = flightResult.flight.id;
      if (economyPrice) {
        await fetch("http://localhost:5000/flights/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ flight_id: flightId, flight_class: "ECONOMY", price: parseFloat(economyPrice) }),
        });
      }
      if (businessPrice) {
        await fetch("http://localhost:5000/flights/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ flight_id: flightId, flight_class: "BUSINESS", price: parseFloat(businessPrice) }),
        });
      }

      // Redirect to flights dashboard
      navigate("/dashboard/flights");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-x-2">
            <Plane className="h-6 w-6 text-airline-blue" />
            Add New Flight
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* ❌ **Prevent Non-Admins from Seeing Form** */}
          {!isAdmin ? (
            <p className="text-red-500 text-center">You do not have permission to add flights.</p>
          ) : (
            <form onSubmit={handleFlightSubmit} className="space-y-4">
              <Label>Flight Name</Label>
              <Input value={flightName} onChange={(e) => setFlightName(e.target.value)} placeholder="Flight 101" />
              <Label>Airplane ID</Label>
              <Input type="number" value={airplaneId} onChange={(e) => setAirplaneId(e.target.value)} placeholder="1" />
              <Label>Source Airport ID</Label>
              <Input type="number" value={sourceAirportId} onChange={(e) => setSourceAirportId(e.target.value)} placeholder="4" />
              <Label>Destination Airport ID</Label>
              <Input type="number" value={destinationAirportId} onChange={(e) => setDestinationAirportId(e.target.value)} placeholder="42" />
              <Label>Departure Date</Label>
              <Input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
              <Label>Departure Time</Label>
              <Input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
              <Label>Arrival Date</Label>
              <Input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} />
              <Label>Arrival Time</Label>
              <Input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
              <Label>Status</Label>
              <Input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="ACTIVE" />
              <Label>Economy Price (optional)</Label>
              <Input type="number" value={economyPrice} onChange={(e) => setEconomyPrice(e.target.value)} placeholder="₹ 1200" />
              <Label>Business Price (optional)</Label>
              <Input type="number" value={businessPrice} onChange={(e) => setBusinessPrice(e.target.value)} placeholder="₹ 2200" />
              <Button type="submit" className="w-full bg-airline-blue hover:bg-airline-navy">
                Add Flight
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
