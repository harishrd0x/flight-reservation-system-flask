import React, { useState } from "react";

interface ReviewFormProps {
  onSubmit: (data: {
    flightId: number;
    rating: number;
    comment: string;
  }) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [flightId, setFlightId] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const flightIdNum = Number(flightId);
    const ratingNum = Number(rating);

    if (!flightIdNum || ratingNum < 1 || ratingNum > 5 || comment.trim() === "") {
      alert("Please fill all fields correctly.");
      return;
    }

    onSubmit({
      flightId: flightIdNum,
      rating: ratingNum,
      comment: comment.trim(),
    });

    // Reset form
    setFlightId("");
    setRating("");
    setComment("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <input
        type="number"
        placeholder="Flight ID"
        value={flightId}
        onChange={(e) => setFlightId(e.target.value)}
        className="border p-2 w-full"
        min={1}
      />
      <input
        type="number"
        placeholder="Rating (1-5)"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        className="border p-2 w-full"
        min={1}
        max={5}
      />
      <textarea
        placeholder="Write your review"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="border p-2 w-full"
        rows={4}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit Review
      </button>
    </form>
  );
};

export default ReviewForm;
