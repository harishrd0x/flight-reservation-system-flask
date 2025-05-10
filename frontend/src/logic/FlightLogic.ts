
import { Flight } from '@/models/types/flight';
import { LocalStorageRepository } from '@/models/repository/LocalStorageRepository';

/**
 * Business logic for flight operations
 */
export class FlightLogic {
  private flightRepository: LocalStorageRepository<Flight>;

  constructor() {
    this.flightRepository = new LocalStorageRepository<Flight>('flights');
  }

  /**
   * Get all flights with optional filtering
   */
  getAllFlights(from?: string, to?: string, date?: string): Flight[] {
    let flights = this.flightRepository.getAll();
    
    // Apply filters if provided
    if (from) {
      flights = flights.filter(flight => 
        flight.from.toLowerCase().includes(from.toLowerCase()) || 
        flight.fromCode.toLowerCase().includes(from.toLowerCase())
      );
    }
    
    if (to) {
      flights = flights.filter(flight => 
        flight.to.toLowerCase().includes(to.toLowerCase()) || 
        flight.toCode.toLowerCase().includes(to.toLowerCase())
      );
    }
    
    if (date) {
      flights = flights.filter(flight => flight.departureDate === date);
    }
    
    return flights;
  }

  /**
   * Get a flight by ID
   */
  getFlightById(id: string): Flight | null {
    return this.flightRepository.getById(id);
  }

  /**
   * Create a new flight (admin only)
   */
  createFlight(flightData: Flight): Flight | null {
    try {
      this.flightRepository.add(flightData);
      return flightData;
    } catch (error) {
      console.error("Error creating flight:", error);
      return null;
    }
  }

  /**
   * Update a flight (admin only)
   */
  updateFlight(flightData: Flight): Flight | null {
    try {
      this.flightRepository.update(flightData);
      return flightData;
    } catch (error) {
      console.error("Error updating flight:", error);
      return null;
    }
  }

  /**
   * Delete a flight (admin only)
   */
  deleteFlight(id: string): boolean {
    try {
      this.flightRepository.delete(id);
      return true;
    } catch (error) {
      console.error("Error deleting flight:", error);
      return false;
    }
  }
}

export const useFlightLogic = () => {
  return new FlightLogic();
};
