
import { useBookingLogic } from '@/logic/BookingLogic';
import { BookingDetails } from '@/models/types';
import { useAuth } from '@/context/AuthContext';

/**
 * Service for handling booking operations
 * Connects UI components with business logic
 */
export const useBookingService = () => {
  const bookingLogic = useBookingLogic();
  const { user } = useAuth();
  
  /**
   * Get bookings for the current user or all bookings for admin
   */
  const getBookings = () => {
    const isAdmin = user?.userType === 'admin';
    return bookingLogic.getAllBookings(isAdmin ? undefined : user?.email);
  };
  
  /**
   * Create a new booking
   */
  const createBooking = (bookingData: Partial<BookingDetails>) => {
    return bookingLogic.createBooking({
      ...bookingData,
      userId: user?.email || '',
      userName: user?.displayName || user?.email || 'Guest'
    });
  };
  
  /**
   * Cancel a booking
   */
  const cancelBooking = (bookingId: string) => {
    return bookingLogic.cancelBooking(bookingId);
  };
  
  /**
   * Generate booking PDF
   */
  const generatePDF = (bookingId: string) => {
    return bookingLogic.generatePDF(bookingId);
  };
  
  return {
    getBookings,
    createBooking,
    cancelBooking,
    generatePDF
  };
};
