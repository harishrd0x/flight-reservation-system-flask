// src/components/RegisterForm.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Plane } from "lucide-react";

export default function RegisterForm() {
  // Basic fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Additional fields:
  const [dob, setDob] = useState(""); // YYYY-MM-DD format
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [gender, setGender] = useState("");

  // Errors for all fields.
  const [errors, setErrors] = useState<{ 
    name?: string;
    email?: string; 
    mobileNumber?: string;
    password?: string;
    confirmPassword?: string;
    dob?: string;
    address?: string;
    zipCode?: string;
    gender?: string;
  }>({});

  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Destructure the register function from the auth context.
  // Make sure your AuthContext.register is updated accordingly.
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { 
      name?: string;
      email?: string; 
      mobileNumber?: string;
      password?: string;
      confirmPassword?: string;
      dob?: string;
      address?: string;
      zipCode?: string;
      gender?: string;
    } = {};
    
    if (!name) {
      newErrors.name = "Name is required";
    }
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    }
    if (!dob) {
      newErrors.dob = "Date of birth is required";
    }
    if (!address) {
      newErrors.address = "Address is required";
    }
    if (!zipCode) {
      newErrors.zipCode = "Zip code is required";
    }
    if (!gender) {
      newErrors.gender = "Gender is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const success = await register(
        name,
        email,
        mobileNumber,
        password,
        dob,
        address,
        zipCode,
        gender
      );
      if (success) {
        setRegisterSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-8">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-airline-blue p-3 rounded-full">
              <Plane className="h-8 w-8 text-white animate-float" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Create an Account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to register with Cloud Jet Services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registerSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Registration successful! Redirecting to login...
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {/* Row 1: Name and Email */}
            <div className="flex flex-col">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            {/* Row 2: Mobile Number and Date of Birth */}
            <div className="flex flex-col">
              <label htmlFor="mobileNumber" className="text-sm font-medium">Mobile Number</label>
              <Input
                id="mobileNumber"
                type="text"
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className={errors.mobileNumber ? "border-red-500" : ""}
              />
              {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="dob" className="text-sm font-medium">Date of Birth</label>
              <Input
                id="dob"
                type="date"
                placeholder="Select your date of birth"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={errors.dob ? "border-red-500" : ""}
              />
              {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
            </div>
            {/* Row 3: Address (spans 2 columns) */}
            <div className="flex flex-col col-span-2">
              <label htmlFor="address" className="text-sm font-medium">Address</label>
              <Input
                id="address"
                type="text"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
            {/* Row 4: Zip Code and Gender */}
            <div className="flex flex-col">
              <label htmlFor="zipCode" className="text-sm font-medium">Zip Code</label>
              <Input
                id="zipCode"
                type="text"
                placeholder="Enter your zip code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className={errors.zipCode ? "border-red-500" : ""}
              />
              {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="gender" className="text-sm font-medium">Gender</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={`block w-full px-3 py-2 text-sm border rounded-md ${
                  errors.gender ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>
            {/* Row 5: Password and Confirm Password */}
            <div className="flex flex-col">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            {/* Submit Button spanning 2 columns */}
            <div className="col-span-2">
              <Button type="submit" className="w-full bg-airline-blue hover:bg-airline-navy">
                Register
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-gray-600 mt-2 w-full">
            Already have an account?{" "}
            <Link to="/login" className="text-airline-blue hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
