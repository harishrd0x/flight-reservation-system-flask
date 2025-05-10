
import { BookingDetails } from '@/models/types';
import { LocalStorageRepository } from '@/models/repository/LocalStorageRepository';
import { useToast } from '@/hooks/use-toast';
import { generateBookingPDF } from '@/utils/pdfUtils';

/**
 * Business logic for booking operations
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
   * Get all bookings, filtered by user if needed
   */
  getAllBookings(userEmail?: string): BookingDetails[] {
    const bookings = this.bookingRepository.getAll();
    
    // Ensure all bookings have the correct status type
    const typedBookings = bookings.map(booking => ({
      ...booking,
      status: this.validateStatus(booking.status)
    })) as BookingDetails[];
    
    return userEmail 
      ? typedBookings.filter(booking => booking.userId === userEmail)
      : typedBookings;
  }

  /**
   * Create a new booking
   */
  createBooking(bookingData: Partial<BookingDetails>): BookingDetails | null {
    try {
      // Validate booking data
      if (!bookingData.flightId || !bookingData.userId || !bookingData.price) {
        this.toast.toast({
          title: "Booking Failed",
          description: "Missing required booking information",
          variant: "destructive"
        });
        return null;
      }

      // Check wallet balance
      const wallet = this.walletRepository.getAll()[0] || { balance: 0 };
      if (wallet.balance < bookingData.price) {
        this.toast.toast({
          title: "Insufficient Funds",
          description: "Please add money to your wallet to complete this booking",
          variant: "destructive"
        });
        return null;
      }

      // Create booking with proper status
      const newBooking: BookingDetails = {
        id: `booking-${Date.now()}`,
        status: 'confirmed' as const,
        bookingDate: new Date().toLocaleDateString(),
        ...bookingData
      } as BookingDetails;

      // Add to repository
      this.bookingRepository.add(newBooking);

      // Update wallet
      this.processPayment(newBooking.price, newBooking.id);

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
   * Cancel a booking and process refund
   */
  cancelBooking(bookingId: string): boolean {
    try {
      // Get the booking
      const booking = this.bookingRepository.getById(bookingId);
      if (!booking) {
        this.toast.toast({
          title: "Cancel Failed",
          description: "Booking not found",
          variant: "destructive"
        });
        return false;
      }

      // Update booking status
      const updatedBooking = { 
        ...booking, 
        status: 'cancelled' as const 
      };
      this.bookingRepository.update(updatedBooking);

      // Process the refund
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
   * Generate a PDF for a booking
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
   * Process payment for a booking
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
   * Process refund for a cancelled booking
   */
  private processRefund(booking: BookingDetails): void {
    try {
      const walletData = this.walletRepository.getAll()[0] || { balance: 0, transactions: [] };
      
      const updatedWallet = {
        balance: walletData.balance + booking.price,
        transactions: [
          {
            id: `refund-${Date.now()}`,
            amount: booking.price,
            type: "deposit" as const,
            description: `Refund for booking ${booking.id} (${booking.flightId})`,
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
   * Validate booking status and ensure it's one of the allowed values
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
