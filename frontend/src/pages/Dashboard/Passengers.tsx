
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { PassengerInfo } from '@/types/user';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Users, UserPlus, UserMinus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const passengerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender.",
  }),
  age: z.coerce
    .number()
    .min(1, "Age must be at least 1.")
    .max(120, "Age must not exceed 120."),
});

type PassengerFormValues = z.infer<typeof passengerFormSchema>;

export default function PassengersPage() {
  const { user } = useAuth();
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPassengerId, setEditPassengerId] = useState<string | null>(null);

  const form = useForm<PassengerFormValues>({
    resolver: zodResolver(passengerFormSchema),
    defaultValues: {
      name: "",
      gender: "male",
      age: 18,
    },
  });

  // Load passengers from localStorage
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
  }, [user?.email]);

  // Save passengers to localStorage
  const savePassengers = (updatedPassengers: PassengerInfo[]) => {
    if (user?.email) {
      localStorage.setItem(`passengers_${user.email}`, JSON.stringify(updatedPassengers));
      setPassengers(updatedPassengers);
    }
  };

  const handleAddPassenger = (values: PassengerFormValues) => {
    if (isEditMode && editPassengerId) {
      // Edit existing passenger
      const updatedPassengers = passengers.map(passenger => 
        passenger.id === editPassengerId 
          ? { ...passenger, ...values } 
          : passenger
      );
      savePassengers(updatedPassengers);
      toast({
        title: "Passenger Updated",
        description: `${values.name}'s information has been updated.`,
      });
    } else {
      // Add new passenger
      const newPassenger: PassengerInfo = {
        id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: values.name,
        gender: values.gender,
        age: values.age,
      };
      savePassengers([...passengers, newPassenger]);
      toast({
        title: "Passenger Added",
        description: `${values.name} has been added to your passengers.`,
      });
    }

    form.reset();
    setIsAddDialogOpen(false);
    setIsEditMode(false);
    setEditPassengerId(null);
  };

  const handleEditPassenger = (passenger: PassengerInfo) => {
    setIsEditMode(true);
    setEditPassengerId(passenger.id);
    form.reset({
      name: passenger.name,
      gender: passenger.gender,
      age: passenger.age,
    });
    setIsAddDialogOpen(true);
  };

  const handleDeletePassenger = (id: string) => {
    const passengerName = passengers.find(p => p.id === id)?.name;
    const updatedPassengers = passengers.filter(passenger => passenger.id !== id);
    savePassengers(updatedPassengers);
    toast({
      title: "Passenger Removed",
      description: `${passengerName} has been removed from your passengers.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Passengers</h1>
          <p className="text-gray-500">Add and manage your passengers for flight bookings.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsEditMode(false);
              form.reset({
                name: "",
                gender: "male",
                age: 18,
              });
            }}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Passenger
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Passenger' : 'Add New Passenger'}</DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? "Update the passenger's information below." 
                  : "Add details for a new passenger. You can add multiple passengers to your account."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddPassenger)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male">Male</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female">Female</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other">Other</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{isEditMode ? 'Update Passenger' : 'Add Passenger'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {passengers.length > 0 ? (
          passengers.map((passenger) => (
            <Card key={passenger.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{passenger.name}</CardTitle>
                <CardDescription>{passenger.gender}, {passenger.age} years old</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleEditPassenger(passenger)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeletePassenger(passenger.id)}>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed rounded-lg border-gray-300">
            <Users className="h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium">No passengers yet</h3>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Add passengers to your account to make booking flights faster.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => {
                setIsEditMode(false);
                form.reset();
                setIsAddDialogOpen(true);
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Your First Passenger
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
