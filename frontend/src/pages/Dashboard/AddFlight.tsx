import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Plane } from "lucide-react";

export default function AddFlightPage() {
  const navigate = useNavigate();

  // Flight details state
  const [flightName, setFlightName] = useState("");
  const [airplaneId, setAirplaneId] = useState("");
  const [sourceAirportId, setSourceAirportId] = useState("");
  const [destinationAirportId, setDestinationAirportId] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [status, setStatus] = useState("ACTIVE"); // default value

  // Optional flight price state (in rupees)
  const [economyPrice, setEconomyPrice] = useState("");
  const [businessPrice, setBusinessPrice] = useState("");

  const handleFlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: ensure required flight fields are present
    if (
      !flightName ||
      !airplaneId ||
      !sourceAirportId ||
      !destinationAirportId ||
      !departureDate ||
      !departureTime ||
      !arrivalDate ||
      !arrivalTime
    ) {
      toast({
        title: "Error",
        description: "Please fill out all flight details.",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time to ISO8601 format strings (assuming YYYY-MM-DD for dates)
    const departureDateTime = `${departureDate}T${departureTime}`;
    const arrivalDateTime = `${arrivalDate}T${arrivalTime}`;

    // Prepare the flight payload that matches the backend JSON:
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
      // Create the flight
      const flightResponse = await fetch("http://localhost:5000/flights/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flightPayload),
      });

      if (!flightResponse.ok) {
        const errData = await flightResponse.json();
        throw new Error(errData.error || "Failed to create flight");
      }

      const flightResult = await flightResponse.json();

      toast({
        title: "Flight Created",
        description: "Flight created successfully.",
      });

      // Obtain the new flight's ID from the response.
      const flightId = flightResult.flight.id;

      // If an economy price was provided, add the flight price for ECONOMY.
      if (economyPrice) {
        const econPricePayload = {
          flight_id: flightId,
          flight_class: "ECONOMY",
          price: parseFloat(economyPrice),
        };

        const econPriceResponse = await fetch("http://localhost:5000/flights/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(econPricePayload),
        });

        if (!econPriceResponse.ok) {
          const errData = await econPriceResponse.json();
          throw new Error(errData.error || "Failed to add ECONOMY price");
        }
      }

      // If a business price was provided, add flight price for BUSINESS.
      if (businessPrice) {
        const busPricePayload = {
          flight_id: flightId,
          flight_class: "BUSINESS",
          price: parseFloat(businessPrice),
        };

        const busPriceResponse = await fetch("http://localhost:5000/flights/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(busPricePayload),
        });

        if (!busPriceResponse.ok) {
          const errData = await busPriceResponse.json();
          throw new Error(errData.error || "Failed to add BUSINESS price");
        }
      }

      // Navigate to flights list page after success.
      navigate("/dashboard/flights");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
          <form onSubmit={handleFlightSubmit} className="space-y-4">
            <div>
              <Label htmlFor="flightName">Flight Name</Label>
              <Input
                id="flightName"
                value={flightName}
                onChange={(e) => setFlightName(e.target.value)}
                placeholder="Flight 101"
              />
            </div>
            <div>
              <Label htmlFor="airplaneId">Airplane ID</Label>
              <Input
                id="airplaneId"
                type="number"
                value={airplaneId}
                onChange={(e) => setAirplaneId(e.target.value)}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="sourceAirportId">Source Airport ID</Label>
              <Input
                id="sourceAirportId"
                type="number"
                value={sourceAirportId}
                onChange={(e) => setSourceAirportId(e.target.value)}
                placeholder="4"
              />
            </div>
            <div>
              <Label htmlFor="destinationAirportId">Destination Airport ID</Label>
              <Input
                id="destinationAirportId"
                type="number"
                value={destinationAirportId}
                onChange={(e) => setDestinationAirportId(e.target.value)}
                placeholder="42"
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="departureDate">Departure Date</Label>
                <Input id="departureDate" type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
              </div>
              <div className="flex-1">
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input id="departureTime" type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="arrivalDate">Arrival Date</Label>
                <Input id="arrivalDate" type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} />
              </div>
              <div className="flex-1">
                <Label htmlFor="arrivalTime">Arrival Time</Label>
                <Input id="arrivalTime" type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Input id="status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="ACTIVE" />
            </div>
            <div>
              <Label htmlFor="economyPrice">Economy Price (in Rupees, optional)</Label>
              <Input
                id="economyPrice"
                type="number"
                value={economyPrice}
                onChange={(e) => setEconomyPrice(e.target.value)}
                placeholder="₹ e.g. 1200"
              />
            </div>
            <div>
              <Label htmlFor="businessPrice">Business Price (in Rupees, optional)</Label>
              <Input
                id="businessPrice"
                type="number"
                value={businessPrice}
                onChange={(e) => setBusinessPrice(e.target.value)}
                placeholder="₹ e.g. 2200"
              />
            </div>
            <Button type="submit" className="w-full bg-airline-blue hover:bg-airline-navy">
              Add Flight
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
