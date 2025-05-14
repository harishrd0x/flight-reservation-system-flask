import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Plane } from "lucide-react";

interface AirplaneFormProps {
  onSubmit: (data: {
    model: string;
    airline: string;
    capacity: number;
    manufacture: string;
  }) => void;
}

const AirplaneForm: React.FC<AirplaneFormProps> = ({ onSubmit }) => {
  const [model, setModel] = useState("");
  const [airline, setAirline] = useState("");
  const [capacity, setCapacity] = useState("");
  const [manufacture, setManufacture] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure all fields are provided
    if (!model || !airline || !capacity || !manufacture) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Validate capacity as a positive number
    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      toast({
        title: "Error",
        description: "Capacity must be a positive number",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit({
      model,
      airline,
      capacity: capacityNum,
      manufacture,
    });

    // Reset the form
    setModel("");
    setAirline("");
    setCapacity("");
    setManufacture("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Plane className="mr-2 h-6 w-6 text-airline-blue" />
          Add New Airplane
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Airplane Model</Label>
            <Input
              id="model"
              placeholder="e.g. Boeing 737"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="airline">Airline</Label>
            <Input
              id="airline"
              placeholder="e.g. American Airlines"
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="capacity">Passenger Capacity</Label>
            <Input
              id="capacity"
              type="number"
              placeholder="e.g. 160"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="manufacture">Manufacture</Label>
            <Input
              id="manufacture"
              placeholder="e.g. Boeing"
              value={manufacture}
              onChange={(e) => setManufacture(e.target.value)}
            />
          </div>
          
          <Button 
            type="submit"
            className="w-full bg-airline-blue hover:bg-airline-navy"
          >
            Add Airplane
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AirplaneForm;
