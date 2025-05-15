export interface BookingDetails {
  id: string;
  flight_id: number;
  user_id: string;
  booking_price: number;
  booking_status: 'confirmed' | 'pending' | 'cancelled';
  bookingDate?: string;
  // Add any additional fields if necessary.
}
