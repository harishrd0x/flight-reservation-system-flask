// src/components/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/models/types/user';
import { Mail, Phone, Edit, UploadCloud } from 'lucide-react';

export default function Profile() {
  const { userProfile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  // Initialize formData with empty defaults for missing fields.
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    mobile_number: "",
    dob: "",
    address: "",
    zip_code: "",
    gender: "",
  });

  // Fetch profile details once upon mount.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/auth/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch profile details");
          return res.json();
        })
        .then((data: UserProfile) => {
          console.log("Fetched profile details:", data);
          // Ensure fallback values for missing fields:
          const fullData: UserProfile = {
            ...data,
            mobile_number: data.mobile_number || "",
            dob: data.dob || "",
            address: data.address || "",
            zip_code: data.zip_code || "",
            gender: data.gender || "",
          };
          updateUserProfile(fullData);
          setFormData(fullData);
        })
        .catch((error) => {
          console.error("Error fetching profile details:", error);
        });
    }
  }, []); // Empty dependency array so this fires only once.

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please log in to view your profile</p>
      </div>
    );
  }

  // Handle input changes for text and select fields.
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle avatar upload changes.
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatarUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Reset formData to current userProfile values when canceling edit.
      setFormData({
        ...userProfile,
        mobile_number: userProfile.mobile_number || "",
        dob: userProfile.dob || "",
        address: userProfile.address || "",
        zip_code: userProfile.zip_code || "",
        gender: userProfile.gender || "",
      });
    }
    setIsEditing(!isEditing);
  };

  // Create a fallback for the avatar based on the user's name or email.
  const getAvatarFallback = () => {
    if (userProfile.name) {
      return userProfile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return userProfile.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="container py-10 mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userProfile.avatarUrl} />
                <AvatarFallback className="text-xl">
                  {getAvatarFallback()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{userProfile.name || userProfile.email}</CardTitle>
            <CardDescription className="capitalize">
              {userProfile.role} Account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{userProfile.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{userProfile.mobile_number || "Not set"}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={toggleEdit}
              variant={isEditing ? "outline" : "default"}
              className="w-full"
            >
              {isEditing ? "Cancel Editing" : (<><Edit className="mr-2 h-4 w-4" /> Edit Profile</>)}
            </Button>
          </CardFooter>
        </Card>
        {/* Edit Profile Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {isEditing ? "Edit Your Profile" : "Profile Information"}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? "Update your personal details below"
                : "Your personal details are displayed below"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing && (
              <div className="space-y-4 mb-6">
                <Label htmlFor="avatar" className="block">
                  Profile Picture
                </Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={formData.avatarUrl} />
                    <AvatarFallback>
                      {getAvatarFallback()}
                    </AvatarFallback>
                  </Avatar>
                  <Label
                    htmlFor="avatar-upload"
                    className="cursor-pointer flex items-center px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium"
                  >
                    <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Row 1: Name and Mobile Number */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-700 py-2">
                    {userProfile.name || "Not set"}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile_number">Mobile Number</Label>
                {isEditing ? (
                  <Input
                    id="mobile_number"
                    name="mobile_number"
                    value={formData.mobile_number || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your mobile number"
                  />
                ) : (
                  <p className="text-gray-700 py-2">
                    {userProfile.mobile_number || "Not set"}
                  </p>
                )}
              </div>
              {/* Row 2: Date of Birth and Zip Code */}
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                {isEditing ? (
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob ? formData.dob.split("T")[0] : ""}
                    onChange={handleInputChange}
                    placeholder="YYYY-MM-DD"
                  />
                ) : (
                  <p className="text-gray-700 py-2">
                    {userProfile.dob ? new Date(userProfile.dob).toLocaleDateString() : "Not set"}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">Zip Code</Label>
                {isEditing ? (
                  <Input
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your zip code"
                  />
                ) : (
                  <p className="text-gray-700 py-2">
                    {userProfile.zip_code || "Not set"}
                  </p>
                )}
              </div>
              {/* Row 3: Address (spanning full width) */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-gray-700 py-2">
                    {userProfile.address || "Not set"}
                  </p>
                )}
              </div>
              {/* Row 4: Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                {isEditing ? (
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="">Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-700 py-2">
                    {userProfile.gender || "Not set"}
                  </p>
                )}
              </div>
              {/* Row 5: Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <p className="text-gray-700 py-2">{userProfile.email}</p>
              </div>
              {/* Row 6: Submit button (displayed only in edit mode) */}
              {isEditing && (
                <div className="col-span-1 md:col-span-2">
                  <Button type="submit" className="w-full bg-airline-blue hover:bg-airline-navy">
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
