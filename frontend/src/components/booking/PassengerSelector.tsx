
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { PassengerInfo } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface PassengerSelectorProps {
  selectedPassengers: PassengerInfo[];
  onChange: (selected: PassengerInfo[]) => void;
}

export default function PassengerSelector({ 
  selectedPassengers, 
  onChange 
}: PassengerSelectorProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    if (user?.email) {
      try {
        const savedPassengers = JSON.parse(localStorage.getItem(`passengers_${user.email}`) || "[]");
        setPassengers(savedPassengers);
      } catch (error) {
        console.error("Error loading passengers:", error);
        setPassengers([]);
      }
    }
  }, [user?.email, isDialogOpen]);

  const handlePassengerToggle = (passenger: PassengerInfo) => {
    const isSelected = selectedPassengers.some(p => p.id === passenger.id);
    
    if (isSelected) {
      onChange(selectedPassengers.filter(p => p.id !== passenger.id));
    } else {
      onChange([...selectedPassengers, passenger]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Select Passengers</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Manage Passengers
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Passengers</DialogTitle>
              <DialogDescription>
                Add or edit passengers for your booking
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Button 
                onClick={() => {
                  setIsDialogOpen(false);
                  navigate("/dashboard/passengers");
                }}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Go to Passenger Management
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {passengers.length > 0 ? (
        <div className="border rounded-md">
          <div className="p-4 space-y-3">
            {passengers.map((passenger) => (
              <div key={passenger.id} className="flex items-center space-x-3">
                <Checkbox 
                  id={`passenger-${passenger.id}`} 
                  checked={selectedPassengers.some(p => p.id === passenger.id)} 
                  onCheckedChange={() => handlePassengerToggle(passenger)}
                />
                <label 
                  htmlFor={`passenger-${passenger.id}`} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                >
                  {passenger.name} - {passenger.gender}, {passenger.age} years
                </label>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-dashed rounded-md p-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            No passengers added yet. Add passengers to your account for easier booking.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/passengers")}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Passengers
          </Button>
        </div>
      )}
      
      {selectedPassengers.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">Selected Passengers ({selectedPassengers.length})</h4>
          <ul className="list-disc pl-5 space-y-1">
            {selectedPassengers.map(passenger => (
              <li key={passenger.id} className="text-sm">
                {passenger.name} ({passenger.age} years)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
