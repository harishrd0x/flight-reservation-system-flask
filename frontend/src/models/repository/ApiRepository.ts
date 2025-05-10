
import { useApiClient } from '@/utils/apiClient';
import { BOOKING_ENDPOINTS, FLIGHT_ENDPOINTS, WALLET_ENDPOINTS, REVIEW_ENDPOINTS, AIRPORT_ENDPOINTS, AIRPLANE_ENDPOINTS } from '@/utils/apiEndpoints';

/**
 * Base repository class for API interactions
 * Provides common CRUD operations for different entity types
 */
export class ApiRepository<T> {
  private endpoint: string;
  private apiClient: ReturnType<typeof useApiClient>;

  constructor(endpoint: string, apiClient: ReturnType<typeof useApiClient>) {
    this.endpoint = endpoint;
    this.apiClient = apiClient;
  }

  async getAll(params?: Record<string, string>): Promise<T[]> {
    return this.apiClient.get(this.endpoint, params);
  }

  async getById(id: string): Promise<T> {
    return this.apiClient.get(`${this.endpoint}/${id}`);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.apiClient.post(this.endpoint, data);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.apiClient.put(`${this.endpoint}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return this.apiClient.delete(`${this.endpoint}/${id}`);
  }
}

/**
 * Repository factory to create repositories for different entity types
 */
export const useRepositoryFactory = () => {
  const apiClient = useApiClient();

  return {
    createFlightRepository: () => new ApiRepository<any>(FLIGHT_ENDPOINTS.ALL, apiClient),
    createBookingRepository: () => new ApiRepository<any>(BOOKING_ENDPOINTS.ALL, apiClient),
    createWalletRepository: () => new ApiRepository<any>(WALLET_ENDPOINTS.USER_WALLET, apiClient),
    createReviewRepository: () => new ApiRepository<any>(REVIEW_ENDPOINTS.ALL, apiClient),
    createAirportRepository: () => new ApiRepository<any>(AIRPORT_ENDPOINTS.ALL, apiClient),
    createAirplaneRepository: () => new ApiRepository<any>(AIRPLANE_ENDPOINTS.ALL, apiClient),
  };
};
