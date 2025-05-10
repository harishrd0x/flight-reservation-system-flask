
export interface Flight {
  id: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  price: number;
  airline: string;
  duration: string;
  status: 'scheduled' | 'delayed' | 'cancelled';
  capacity: number;
}
