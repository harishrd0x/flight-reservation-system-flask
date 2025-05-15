import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AirplaneForm from "@/components/forms/AirplaneForm";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Trash2 } from "lucide-react";
import { Airplane } from "@/models/types/airplane"; // Ensure the Airplane interface includes "manufacture"

// Backend endpoint URL
const API_URL = "http://127.0.0.1:5000/airplanes/";

export default function AddAirplanePage() {
  const { user, token } = useAuth();
  const isAdmin = user?.userType === "admin"; // Verify admin status
  const [airplanes, setAirplanes] = useState<Airplane[]>([]);

  // Fetch airplanes (Open to all users)
  const fetchAirplanes = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch airplanes");

      const data = await response.json();
      setAirplanes(data);
    } catch (error: any) {
      console.error("Error fetching airplanes:", error.message);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchAirplanes();
  }, []);

  // Admin Only: Add Airplane
  const handleAddAirplane = async (data: {
    model: string;
    capacity: number;
    airline: string;
    manufacture: string;
  }) => {
    if (!isAdmin) {
      toast({ title: "Unauthorized", description: "Only admins can add airplanes.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add airplane");
      }

      await fetchAirplanes();
      toast({ title: "Airplane Added", description: `${data.airline} ${data.model} has been added.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Admin Only: Delete Airplane
  const handleDeleteAirplane = async (id: string) => {
    if (!isAdmin) {
      toast({ title: "Unauthorized", description: "Only admins can delete airplanes.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(`${API_URL}${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete airplane");
      }

      await fetchAirplanes();
      toast({ title: "Airplane Removed", description: "The airplane has been removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Airplanes</h1>
        <p className="text-gray-500">Add new airplanes to your fleet or manage existing ones.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Only: Airplane Form */}
        {isAdmin && <AirplaneForm onSubmit={handleAddAirplane} />}

        {/* Airplane List */}
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
                  <div key={airplane.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <h3 className="font-medium">{airplane.airline} {airplane.model}</h3>
                      <div className="text-sm text-gray-500">
                        <p>Capacity: {airplane.capacity} passengers</p>
                        <p>Manufacture: {airplane.manufacture}</p>
                      </div>
                    </div>
                    
                    {/* Admin Only: Delete Button */}
                    {isAdmin && (
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteAirplane(airplane.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No airplanes added yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
