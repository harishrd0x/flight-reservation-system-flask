import React, { useEffect, useState } from "react";
import ReviewForm from "@/components/forms/ReviewForm";
import ReviewCard from "@/components/reviews/ReviewCard";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext"; // ✅ Your AuthContext import

interface Review {
  id: number;
  booking_id: number;
  comment: string;
  created_at: string;
  rating: number;
  user_id: number;
}

const ReviewPage: React.FC = () => {
  const { token } = useAuth(); // ✅ token comes from context now
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      if (!token) {
        toast({
          title: "Unauthorized",
          description: "Please log in to view reviews.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/reviews/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Use token from context
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      }

      const data: Review[] = await response.json();
      setReviews(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch reviews.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData: {
    flightId: number;
    rating: number;
    comment: string;
  }) => {
    const payload = {
      booking_id: reviewData.flightId,
      rating: reviewData.rating,
      comment: reviewData.comment,
    };

    try {
      if (!token) {
        toast({
          title: "Unauthorized",
          description: "You must be logged in to submit a review.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("http://localhost:5000/reviews/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Use token from context
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit review");
      }

      toast({
        title: "Success",
        description: "Review submitted successfully!",
      });

      fetchReviews(); // ✅ Refresh list
    } catch (error: any) {
      toast({
        title: "Submission error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [token]); // ✅ Re-fetch when token changes

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Your Reviews</h1>
      {loading && <p>Loading reviews...</p>}
      {!loading && reviews.length === 0 && <p>No reviews found.</p>}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            id={review.id}
            userId={review.user_id}
            flightId={review.booking_id}
            rating={review.rating}
            comment={review.comment}
            date={review.created_at}
          />
        ))}
      </div>
      <div className="mt-10">
        <ReviewForm onSubmit={handleSubmitReview} />
      </div>
    </div>
  );
};

export default ReviewPage;
