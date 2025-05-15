import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReviewCard from "@/components/reviews/ReviewCard";
import { Search, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface Review {
  id: number;
  userId: string;
  userName: string;
  flightId: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    if (!token) return;
    try {
      const response = await fetch("http://localhost:5000/reviews/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();

      // Optionally transform if backend structure differs
      const transformed = data.map((review: any) => ({
        id: review.id,
        userId: review.user_id,
        userName: `User-${review.user_id}`, // Replace if real name is available
        flightId: review.booking_id,
        rating: review.rating,
        comment: review.comment,
        date: review.created_at?.split("T")[0] ?? "N/A",
      }));

      setReviews(transformed);
    } catch (error: any) {
      toast({
        title: "Error loading reviews",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [token]);

  const filteredReviews = reviews.filter(
    (review) =>
      review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.flightId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) /
    (reviews.length || 1);

  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    ratingCounts[review.rating - 1]++;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Reviews</h1>
        <p className="text-gray-500">
          View and manage customer feedback for your flights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border h-full">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-airline-blue">
                {averageRating.toFixed(1)}
                <span className="text-xl text-gray-500">/5</span>
              </h2>
              <div className="flex justify-center my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(averageRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200 fill-gray-200"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-500">Based on {reviews.length} reviews</p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <div className="text-sm font-medium w-2">{rating}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-airline-blue h-2.5 rounded-full"
                      style={{
                        width: `${(ratingCounts[rating - 1] / reviews.length) * 100 || 0}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500 w-6">
                    {ratingCounts[rating - 1]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="relative w-full mb-6">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search reviews by customer, flight ID, or content..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <ReviewCard key={review.id} {...review} />
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-medium">No reviews found</h3>
                <p className="mt-1 text-gray-500">
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
