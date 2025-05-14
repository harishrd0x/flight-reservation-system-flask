import { useState, useEffect } from "react";
import AirplaneForm from "@/components/forms/AirplaneForm";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Trash2 } from "lucide-react";
import { Airplane } from "@/models/types/airplane"; // Ensure your Airplane interface now reflects the field "manufacture"

// Backend endpoint URL (ensure it ends with a trailing slash)
const API_URL = "http://127.0.0.1:5000/airplanes/";

export default function AddAirplanePage() {
  const [airplanes, setAirplanes] = useState<Airplane[]>([]);

  // Fetch airplanes from the Flask backend
  const fetchAirplanes = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch airplanes");
      }
      const data = await response.json();
      // Map backend data into our Airplane interface structure
      const mappedAirplanes: Airplane[] = data.map((airplane: any) => ({
        id: String(airplane.id),
        model: airplane.model,
        airline: airplane.airline,
        capacity: airplane.capacity,
        manufacture: airplane.manufacture,
      }));
      setAirplanes(mappedAirplanes);
    } catch (error: any) {
      console.error("Error fetching airplanes:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAirplanes();
  }, []);

  // Add a new airplane via a POST request.
  // The payload is expected to have the following keys: model, airline, capacity, manufacture.
  const handleAddAirplane = async (data: {
    model: string;
    capacity: number;
    airline: string;
    manufacture: string;
  }) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add airplane");
      }
      // Re-fetch the fleet to display updated data
      await fetchAirplanes();
      toast({
        title: "Airplane Added",
        description: `${data.airline} ${data.model} has been added to the fleet.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Delete an airplane via a DELETE request
  const handleDeleteAirplane = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Airplane not found");
      }
      // After successful deletion, re-fetch the airplane list
      await fetchAirplanes();
      toast({
        title: "Airplane Removed",
        description: "The airplane has been removed from the fleet.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Airplanes</h1>
        <p className="text-gray-500">
          Add new airplanes to your fleet or manage existing ones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Airplane Form Section */}
        <div>
          <AirplaneForm onSubmit={handleAddAirplane} />
        </div>

        {/* Airplane List Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Plane className="mr-2 h-6 w-6 text-airline-blue" />
                Current Fleet ({airplanes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {airplanes.length > 0 ? (
                <div className="space-y-4">
                  {airplanes.map((airplane) => (
                    <div
                      key={airplane.id}
                      className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <h3 className="font-medium">
                          {airplane.airline} {airplane.model}
                        </h3>
                        <div className="text-sm text-gray-500">
                          <p>Capacity: {airplane.capacity} passengers</p>
                          <p>Manufacture: {airplane.manufacture}</p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteAirplane(airplane.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No airplanes added yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
