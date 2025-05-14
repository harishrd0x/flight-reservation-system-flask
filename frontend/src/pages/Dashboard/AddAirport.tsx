import { useState, useEffect } from "react";
import AirportForm from "@/components/forms/AirportForm";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Trash2 } from "lucide-react";

const API_URL = "http://127.0.0.1:5000/airports/"; // Note the trailing slash

// Reusable Confirm Dialog Component
function ConfirmDialog({ 
  title, 
  description, 
  onConfirm, 
  onCancel 
}: { 
  title: string; 
  description: string; 
  onConfirm: () => void; 
  onCancel: () => void; 
}) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black opacity-50 z-40" />
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white rounded shadow-lg p-6 w-96">
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          <p className="mb-6">{description}</p>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AddAirportPage() {
  const [airports, setAirports] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAirportId, setSelectedAirportId] = useState<number | null>(null);

  // Fetch airports from the Flask backend
  const fetchAirports = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch airports");
      }
      const data = await response.json();
      setAirports(data);
    } catch (error) {
      console.error("Error fetching airports:", error);
      // Optionally display error toast here
    }
  };

  useEffect(() => {
    fetchAirports();
  }, []);

  // Add a new airport via POST request
  const handleAddAirport = async (data: { name: string; code: string; city: string; country: string }) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        // Extract error from response body if available
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add airport");
      }
      // After successfully adding, re-fetch airport list
      await fetchAirports();
      toast({
        title: "Airport Added",
        description: `${data.name} (${data.code}) has been added.`,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Actual deletion logic (called after confirmation)
  const deleteAirport = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Airport not found");
      }
      // After deletion, re-fetch airport list
      await fetchAirports();
      toast({
        title: "Airport Removed",
        description: "The airport has been removed from the system.",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // When delete button is clicked, open the modal and store the ID.
  const confirmDelete = (id: number) => {
    setSelectedAirportId(id);
    setModalOpen(true);
  };

  // Called when user confirms deletion from the popup
  const handleConfirmDelete = () => {
    if (selectedAirportId !== null) {
      deleteAirport(selectedAirportId);
    }
    setModalOpen(false);
    setSelectedAirportId(null);
  };

  // Called when user cancels deletion from the popup
  const handleCancelDelete = () => {
    setModalOpen(false);
    setSelectedAirportId(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Airports</h1>
      <p className="text-gray-500">
        Add new airports to your system or manage existing ones.
      </p>

      <AirportForm onSubmit={handleAddAirport} />

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
                <div
                  key={airport.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-airline-blue" />
                    <div>
                      <h3 className="font-medium flex items-center">
                        <span className="mr-2">{airport.name}</span>
                        <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-xs font-bold">
                          {airport.code}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500">
                        {airport.city}, {airport.country}
                      </p>
                    </div>
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => confirmDelete(airport.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No airports added yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Render Confirm Dialog when modalOpen is true */}
      {modalOpen && (
        <ConfirmDialog
          title="Confirm Deletion"
          description="Are you sure you want to delete this airport? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
