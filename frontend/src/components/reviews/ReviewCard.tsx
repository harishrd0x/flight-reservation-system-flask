import React from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewCardProps {
  id: number;
  userName: string;  // Changed from userId to userName
  flightId: number;
  rating: number;
  comment: string;
  date: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  id,
  userName,
  flightId,
  rating,
  comment,
  date,
}) => {
  // Format the date nicely, e.g. "May 15, 2025"
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card key={id} className="mb-4 shadow-sm">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {/* Show userName instead of userId */}
          <span>{userName}</span>
          <span className="flex items-center text-yellow-500">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400" />
            ))}
            <span className="ml-2 text-sm text-gray-600">{formattedDate}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700">
          <strong>Booking ID:</strong> {flightId}
        </p>
        <p className="mt-2 text-gray-800">{comment}</p>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
