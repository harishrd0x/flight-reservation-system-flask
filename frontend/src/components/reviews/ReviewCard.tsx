import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, Calendar, Plane } from "lucide-react";

interface ReviewCardProps {
  id: number;             // review id
  user_id: number;        // user id
  flightId: number;       // booking_id from backend renamed for clarity
  rating: number;
  comment: string;
  created_at: string;     // date string from backend
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  id,
  user_id,
  flightId,
  rating,
  comment,
  created_at,
}) => {
  // Format the created_at date nicely, e.g. "May 15, 2025"
  const formattedDate = new Date(created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="overflow-hidden hover:shadow-sm transition">
      <CardHeader className="bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* User icon, but no username available */}
            <div className="bg-airline-blue text-white p-2 rounded-full">
              {/* Consider adding user initials or something here if you have the username */}
              <span>{user_id}</span>
            </div>
            <span className="font-medium">User ID: {user_id}</span>
          </div>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Plane className="h-4 w-4 mr-1" />
          <span>Flight: {flightId}</span>
          <span className="mx-2">•</span>
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formattedDate}</span>
        </div>
        <p className="text-gray-700">{comment}</p>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
