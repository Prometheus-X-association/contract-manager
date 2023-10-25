import { logger } from 'utils/logger';

// Definition of the interface for the Store
interface Store {
  user: Record<string, Record<string, unknown>>;
  default: Record<string, unknown>;
  [store: string]: Record<string, unknown>;
}

// DataRepository class acting as a singleton for data management
export class DataRepository {
  private static instance: DataRepository;
  private store: Store;

  // Constructor initializing the Store with "user" and "default" sections
  constructor() {
    this.store = {
      // Section to store user-specific data by session ID
      user: {},
      // Default section for storing data that has no store context
      default: {},
    };
  }

  // Static method to get the unique instance of DataRepository
  public static getInstance(): DataRepository {
    if (!DataRepository.instance) {
      DataRepository.instance = new DataRepository();
    }
    return DataRepository.instance;
  }

  public addData(data: Record<string, unknown>): void {
    if (data) {
      const store = this.store.default || {};
      this.store.default = { ...store, ...data };
    } else {
      logger.error(
        '[DataRepository:addData] Invalid sessionId or data provided',
      );
    }
  }
  // Method to add user data to the user-specific Store for a given session
  public addUserData(sessionId: string, data: Record<string, unknown>): void {
    // Ensure sessionId and data are defined
    if (sessionId && data) {
      // Ensure user section is initialized
      if (!this.store.user) {
        this.store.user = {};
      }
      // Get the existing data for the session or initialize an empty object
      const store = this.store.user[sessionId] || {};
      // Update the user-specific Store with the merged data
      this.store.user[sessionId] = { ...store, ...data };
    } else {
      // Handle undefined sessionId or data
      logger.error(
        '[DataRepository:addUserData] Invalid sessionId or data provided',
      );
    }
  }

  // Method to get the value of a key from the default Store section
  public getValue(name: string): unknown {
    const store = this.store.default;
    return store?.[name] ?? null;
  }

  // Method to get the value of a key from the user-specific Store for a given session
  public getUserValue(sessionId: string, name: string): unknown {
    if (sessionId) {
      const store = this.store.user?.[sessionId];
      return store?.[name] ?? null;
    }
    // Handle undefined sessionId
    logger.error('[DataRepository:getUserValue] Invalid sessionId');
    return null;
  }

  // Method to get the value of a key from the specified Store section
  public getStoreValue(target: string, name: string): unknown {
    const store = this.store[target];
    return store?.[name] ?? null;
  }
}

// Exporting the unique instance of DataRepository for easy use
export default DataRepository.getInstance();
