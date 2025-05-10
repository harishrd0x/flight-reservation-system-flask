
import { PassengerInfo } from './user';

export interface BookingDetails {
  id: string;
  flightId: string;
  userId: string;
  userName: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  price: number;
  bookingDate?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  passengers?: PassengerInfo[];
}
