import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AirportForm from "@/components/forms/AirportForm";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Trash2 } from "lucide-react";

const API_URL = "http://127.0.0.1:5000/airports/";

export default function AddAirportPage() {
  const { user, token } = useAuth();
  const isAdmin = user?.userType === "admin"; // Verify admin status

  const [airports, setAirports] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAirportId, setSelectedAirportId] = useState<number | null>(null);

  // Fetch airports with Authorization token
  const fetchAirports = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Send token with request
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch airports");
      }

      const data = await response.json();
      setAirports(data);
    } catch (error) {
      console.error("Error fetching airports:", error);
      toast({ title: "Error", description: "Failed to fetch airports", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchAirports();
  }, []);

  // Add a new airport (Admin-only)
  const handleAddAirport = async (data: { name: string; code: string; city: string; country: string }) => {
    if (!isAdmin) {
      toast({ title: "Unauthorized", description: "Only admins can add airports", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Send token
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add airport");
      }

      await fetchAirports();
      toast({ title: "Airport Added", description: `${data.name} (${data.code}) has been added.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Delete an airport (Admin-only)
  const deleteAirport = async (id: number) => {
    if (!isAdmin) {
      toast({ title: "Unauthorized", description: "Only admins can delete airports", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(`${API_URL}${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`, // Send token
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Airport not found");
      }

      await fetchAirports();
      toast({ title: "Airport Removed", description: "The airport has been removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Airports</h1>
      <p className="text-gray-500">Add new airports or manage existing ones.</p>

      {/* Show AirportForm only if the user is an admin */}
      {isAdmin && <AirportForm onSubmit={handleAddAirport} />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Building2 className="mr-2 h-6 w-6 text-airline-blue" />
            Available Airports ({airports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {airports.length > 0 ? (
            <div className="space-y-4">
              {airports.map((airport) => (
                <div key={airport.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-airline-blue" />
                    <div>
                      <h3 className="font-medium flex items-center">
                        <span className="mr-2">{airport.name}</span>
                        <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-xs font-bold">{airport.code}</span>
                      </h3>
                      <p className="text-sm text-gray-500">{airport.city}, {airport.country}</p>
                    </div>
                  </div>

                  {/* Show delete button only for admins */}
                  {isAdmin && (
                    <Button variant="destructive" size="icon" onClick={() => deleteAirport(airport.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No airports added yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
