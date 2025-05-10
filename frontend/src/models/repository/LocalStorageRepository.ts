
/**
 * Repository for interacting with localStorage
 * Useful for offline support and storing temporary data
 */
export class LocalStorageRepository<T> {
  private storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  getAll(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error retrieving ${this.storageKey} from localStorage:`, error);
      return [];
    }
  }

  getById(id: string, idField: string = 'id'): T | null {
    try {
      const items = this.getAll();
      return items.find((item: any) => item[idField] === id) || null;
    } catch (error) {
      console.error(`Error retrieving item from ${this.storageKey}:`, error);
      return null;
    }
  }

  save(items: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error(`Error saving to ${this.storageKey}:`, error);
    }
  }

  add(item: T): void {
    try {
      const items = this.getAll();
      items.push(item);
      this.save(items);
    } catch (error) {
      console.error(`Error adding item to ${this.storageKey}:`, error);
    }
  }

  update(updatedItem: T, idField: string = 'id'): void {
    try {
      const items = this.getAll();
      const index = items.findIndex((item: any) => item[idField] === (updatedItem as any)[idField]);
      
      if (index !== -1) {
        items[index] = updatedItem;
        this.save(items);
      }
    } catch (error) {
      console.error(`Error updating item in ${this.storageKey}:`, error);
    }
  }

  delete(id: string, idField: string = 'id'): void {
    try {
      const items = this.getAll();
      const filteredItems = items.filter((item: any) => item[idField] !== id);
      this.save(filteredItems);
    } catch (error) {
      console.error(`Error deleting item from ${this.storageKey}:`, error);
    }
  }
}

/**
 * Factory to create repositories for different entity types in localStorage
 */
export const useLocalStorageRepositoryFactory = () => {
  return {
    createFlightRepository: () => new LocalStorageRepository<any>('flights'),
    createBookingRepository: () => new LocalStorageRepository<any>('bookings'),
    createWalletRepository: () => new LocalStorageRepository<any>('wallet'),
    createReviewRepository: () => new LocalStorageRepository<any>('reviews'),
    createAirportRepository: () => new LocalStorageRepository<any>('airports'),
    createAirplaneRepository: () => new LocalStorageRepository<any>('airplanes'),
  };
};
