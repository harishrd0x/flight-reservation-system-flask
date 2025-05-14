export interface UserProfile {
  email: string;
  // Use a role property that maps directly to the backend's "role"
  role: 'CUSTOMER' | 'ADMIN';
  // Use "name" as returned from the backend instead of displayName
  name: string;
  // Use mobile_number for clarity since that's what the backend returns
  mobile_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface PassengerInfo {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number;
}
