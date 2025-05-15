import React, { useEffect, useState } from "react";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewCard from "@/components/reviews/ReviewCard";
import { CalendarClock } from "lucide-react";

export default function ReviewPage() {
  const [userReviews, setUserReviews] = useState([]);
  const [userFlights, setUserFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  const authToken = localStorage.getItem("access_token") || "";

  // Dummy userId - replace with your own logic to get user id
  const userId = 48;

  useEffect(() => {
    if (!authToken) {
      // If no token, do not fetch
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const reviewsRes = await fetch(`http://localhost:5000/reviews/?user_id=${userId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        });
        if (!reviewsRes.ok) throw new Error("Failed to fetch reviews");
        const reviewsData = await reviewsRes.json();

        const flightsRes = await fetch(`http://localhost:5000/flights/?user_id=${userId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        });
        if (!flightsRes.ok) throw new Error("Failed to fetch flights");
        const flightsData = await flightsRes.json();

        const flightsWithReview = flightsData.map((flight) => ({
          ...flight,
          hasReview: reviewsData.some((review) => review.booking_id === flight.id),
        }));

        setUserReviews(reviewsData);
        setUserFlights(flightsWithReview);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken, userId]);

  const handleSubmitReview = async ({ flightId, rating, comment }) => {
    if (!authToken) {
      toast({
        title: "Unauthorized",
        description: "Please login to submit a review.",
        variant: "destructive",
      });
      return;
    }

    if (!userFlights.some((f) => f.id === flightId)) {
      toast({
        title: "Error",
        description: "You can only review flights you have taken.",
        variant: "destructive",
      });
      return;
    }

    if (userReviews.some((r) => r.booking_id === flightId)) {
      toast({
        title: "Error",
        description: "You have already reviewed this flight.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          booking_id: flightId,
          rating,
          comment,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit review");
      }
      const result = await res.json();

      setUserReviews([result.review, ...userReviews]);

      setUserFlights(
        userFlights.map((flight) =>
          flight.id === flightId ? { ...flight, hasReview: true } : flight
        )
      );

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Submission failed",
        variant: "destructive",
      });
    }
  };

  if (!authToken) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-4">Please log in to submit and view reviews.</h2>
        <Button
          onClick={() => {
            // Redirect to login page or open login modal
            window.location.href = "/login"; // adjust your login path here
          }}
          className="bg-airline-blue hover:bg-airline-navy"
        >
          Log In
        </Button>
      </div>
    );
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Review Your Flights</h1>
      <p className="text-gray-500">Share your experience with other travelers</p>

      <Tabs defaultValue="submit">
        <TabsList>
          <TabsTrigger value="submit">Submit a Review</TabsTrigger>
          <TabsTrigger value="history">Your Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReviewForm onSubmit={handleSubmitReview} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <CalendarClock className="mr-2 h-6 w-6 text-airline-blue" />
                  Recent Flights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Select a flight from the list below to review:
                </p>
                <div className="space-y-2">
                  {userFlights.map((flight) => (
                    <div
                      key={flight.id}
                      className={`p-3 rounded-md cursor-pointer transition ${
                        flight.hasReview
                          ? "bg-gray-100 opacity-60"
                          : "border hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{flight.id}</span>
                        <span className="text-sm text-gray-500">{flight.date}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {flight.from} to {flight.to}
                      </p>
                      {flight.hasReview && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mt-1 inline-block">
                          Reviewed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          {userReviews.length > 0 ? (
            userReviews.map((review) => (
              <ReviewCard key={review.id} {...review} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">You haven't submitted any reviews yet.</p>
              <Button
                className="mt-4 bg-airline-blue hover:bg-airline-navy"
                onClick={() => {
                  const el = document.querySelector('[data-value="submit"]');
                  if (el instanceof HTMLElement) el.click();
                }}
              >
                Submit a Review
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
