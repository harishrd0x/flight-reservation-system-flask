import jsPDF from "jspdf";

/**
 * Generate a PDF for a booking.
 */
export function generateBookingPDF(booking: any) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Booking Details", 14, 22);

  doc.setFontSize(12);
  doc.text(`Booking ID: ${booking.id}`, 14, 32);
  doc.text(`Flight ID: ${booking.flight_id}`, 14, 40);
  doc.text(`Status: ${booking.booking_status}`, 14, 48);
  doc.text(`Price: ₹${booking.booking_price.toFixed(2)}`, 14, 56);

  doc.save(`booking_${booking.id}.pdf`);
}
