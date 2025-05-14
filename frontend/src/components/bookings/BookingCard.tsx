import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PassengerInfo } from "@/types/user";

// Define the props for a booking card.
interface BookingCardProps {
  id: string;
  flightId: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  price: number;
  status: "confirmed" | "pending" | "cancelled";
  onCancel?: () => void;
  onViewDetails?: () => void;
  onDownloadPdf?: () => void;
  passengers?: PassengerInfo[];
}

// Helper to capitalize status strings.
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const BookingCard = ({
  id,
  flightId,
  from,
  fromCode,
  to,
  toCode,
  departureDate,
  departureTime,
  arrivalDate,
  arrivalTime,
  price,
  status,
  onCancel,
  onViewDetails,
  onDownloadPdf,
  passengers,
}: BookingCardProps) => {
  // Compute the converted price.
  const convertedPrice = (price * 83).toFixed(2);

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onViewDetails}
    >
      <CardContent className="p-0">
        <div className="p-6">
          {/* Header: Flight and booking info */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg">{flightId}</h3>
              <p className="text-sm text-gray-500">Booking ID: {id}</p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                status === "confirmed"
                  ? "bg-green-50 text-green-600"
                  : status === "pending"
                  ? "bg-yellow-50 text-yellow-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {capitalize(status)}
            </div>
          </div>

          {/* Route Information */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-sm text-gray-500">From</p>
              <p className="font-medium">
                {from} ({fromCode})
              </p>
              <p className="text-sm">
                {departureDate} • {departureTime}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">To</p>
              <p className="font-medium">
                {to} ({toCode})
              </p>
              <p className="text-sm">
                {arrivalDate} • {arrivalTime}
              </p>
            </div>
          </div>

          {/* Passenger information (if any) */}
          {passengers && passengers.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Passengers ({passengers.length})
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {passengers.slice(0, 3).map((passenger) => (
                  <span
                    key={passenger.id}
                    className="text-xs bg-gray-100 px-2 py-1 rounded"
                  >
                    {passenger.name}
                  </span>
                ))}
                {passengers.length > 3 && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    +{passengers.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer: Price and action buttons */}
          <div className="mt-4 flex justify-between items-center">
            <p className="font-bold text-lg">₹{convertedPrice}</p>
            <div className="flex space-x-2">
              {/* Show Cancel button if booking is not cancelled */}
              {status !== "cancelled" && onCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel();
                  }}
                >
                  Cancel
                </Button>
              )}
              {/* Show Download PDF button */}
              {onDownloadPdf && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadPdf();
                  }}
                >
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
