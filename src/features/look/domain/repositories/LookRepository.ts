import { Look } from '../entities/Look';
import { LookItem } from '../entities/LookItem';

export interface CreateLookInput {
  name: string;
  description: string;
  garmentIds: string[];
}

export interface LookRepository {
  create(input: CreateLookInput): Promise<Look>;
  list(): Promise<Look[]>;
  getById(id: string): Promise<Look | null>;
  getItemsByLookId(lookId: string): Promise<LookItem[]>;
  delete(id: string): Promise<void>;
}
