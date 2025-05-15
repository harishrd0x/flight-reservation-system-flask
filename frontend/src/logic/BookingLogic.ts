import { BookingDetails } from '../models/types';
import { LocalStorageRepository } from '@/models/repository/LocalStorageRepository';
import { useToast } from '@/hooks/use-toast';
import { generateBookingPDF } from '@/utils/pdfUtils';

/**
 * Business logic for booking operations.
 */
export class BookingLogic {
  private bookingRepository: LocalStorageRepository<BookingDetails>;
  private walletRepository: LocalStorageRepository<any>;
  private toast = useToast();

  constructor() {
    this.bookingRepository = new LocalStorageRepository<BookingDetails>('bookings');
    this.walletRepository = new LocalStorageRepository<any>('wallet');
  }

  /**
   * Get all bookings, optionally filtering by the user's email.
   */
  getAllBookings(userEmail?: string): BookingDetails[] {
    const bookings = this.bookingRepository.getAll();
    const typedBookings = bookings.map(booking => ({
      ...booking,
      booking_status: this.validateStatus(booking.booking_status)
    })) as BookingDetails[];
    
    return userEmail 
      ? typedBookings.filter(booking => booking.user_id === userEmail)
      : typedBookings;
  }

  /**
   * Create a new booking and process the payment.
   */
  createBooking(bookingData: Partial<BookingDetails>): BookingDetails | null {
    try {
      if (!bookingData.flight_id || !bookingData.user_id || !bookingData.booking_price) {
        this.toast.toast({
          title: "Booking Failed",
          description: "Missing required booking information",
          variant: "destructive"
        });
        return null;
      }

      const wallet = this.walletRepository.getAll()[0] || { balance: 0 };
      if (wallet.balance < bookingData.booking_price) {
        this.toast.toast({
          title: "Insufficient Funds",
          description: "Please add money to your wallet to complete this booking",
          variant: "destructive"
        });
        return null;
      }

      const newBooking: BookingDetails = {
        id: `booking-${Date.now()}`,
        booking_status: 'confirmed',
        bookingDate: new Date().toLocaleDateString(),
        ...bookingData
      } as BookingDetails;

      this.bookingRepository.add(newBooking);
      this.processPayment(newBooking.booking_price, newBooking.id);

      this.toast.toast({
        title: "Booking Confirmed",
        description: "Your booking has been successfully created",
      });

      return newBooking;
    } catch (error) {
      console.error("Error creating booking:", error);
      this.toast.toast({
        title: "Booking Failed",
        description: "An error occurred while processing your booking",
        variant: "destructive"
      });
      return null;
    }
  }

  /**
   * Cancel a booking and process a refund.
   */
  cancelBooking(bookingId: string): boolean {
    try {
      const booking = this.bookingRepository.getById(bookingId);
      if (!booking) {
        this.toast.toast({
          title: "Cancel Failed",
          description: "Booking not found",
          variant: "destructive"
        });
        return false;
      }

      const updatedBooking = { 
        ...booking, 
        booking_status: 'cancelled' as 'confirmed' | 'pending' | 'cancelled'
      };
      this.bookingRepository.update(updatedBooking);
      this.processRefund(booking);

      this.toast.toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled and refunded",
      });

      return true;
    } catch (error) {
      console.error("Error cancelling booking:", error);
      this.toast.toast({
        title: "Cancel Failed",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }

  /**
   * Generate a PDF for a booking.
   */
  generatePDF(bookingId: string): void {
    try {
      const booking = this.bookingRepository.getById(bookingId);
      if (booking) {
        generateBookingPDF(booking);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      this.toast.toast({
        title: "PDF Generation Failed",
        description: "Failed to generate booking PDF",
        variant: "destructive"
      });
    }
  }

  /**
   * Process payment by deducting the booking price from the wallet.
   */
  private processPayment(amount: number, bookingId: string): void {
    try {
      const walletData = this.walletRepository.getAll()[0] || { balance: 2500, transactions: [] };
      
      const updatedWallet = {
        balance: walletData.balance - amount,
        transactions: [
          {
            id: `payment-${Date.now()}`,
            amount: amount,
            type: "withdrawal" as const,
            description: `Payment for booking ${bookingId}`,
            date: new Date().toLocaleString('en-US', {
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }),
          },
          ...(walletData.transactions || [])
        ]
      };
      
      this.walletRepository.save([updatedWallet]);
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  }

  /**
   * Process a refund by adding the booking price back to the wallet.
   */
  private processRefund(booking: BookingDetails): void {
    try {
      const walletData = this.walletRepository.getAll()[0] || { balance: 0, transactions: [] };
      
      const updatedWallet = {
        balance: walletData.balance + booking.booking_price,
        transactions: [
          {
            id: `refund-${Date.now()}`,
            amount: booking.booking_price,
            type: "deposit" as const,
            description: `Refund for booking ${booking.id} (flight ${booking.flight_id})`,
            date: new Date().toLocaleString('en-US', {
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }),
          },
          ...(walletData.transactions || [])
        ]
      };
      
      this.walletRepository.save([updatedWallet]);
    } catch (error) {
      console.error("Error processing refund:", error);
    }
  }

  /**
   * Validate the booking status.
   */
  private validateStatus(status: any): 'confirmed' | 'pending' | 'cancelled' {
    if (status === 'confirmed' || status === 'pending' || status === 'cancelled') {
      return status;
    }
    return 'pending';
  }
}

export const useBookingLogic = () => {
  return new BookingLogic();
};
