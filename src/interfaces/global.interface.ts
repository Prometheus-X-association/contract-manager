import { DataRegistryDocument, DataRegistry } from './schemas.interface';

export interface IJSON {
  [key: string]: any;
}

export type IDataRegistryDB = DataRegistryDocument;
export type IDataRegistry = DataRegistry;
