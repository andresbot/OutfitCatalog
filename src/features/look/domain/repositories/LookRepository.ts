import { Look } from '../entities/Look';
import { LookItem } from '../entities/LookItem';

export interface CreateLookInput {
  userId: string;
  name: string;
  description: string;
  garmentIds: string[];
  coverImageUrl?: string | null;
}

export interface UpdateLookInput {
  id: string;
  name: string;
  description: string;
  garmentIds: string[];
  coverImageUrl?: string | null;
}

export interface LookRepository {
  create(input: CreateLookInput): Promise<Look>;
  update(input: UpdateLookInput): Promise<void>;
  list(): Promise<Look[]>;
  listByUserId(userId: string): Promise<Look[]>;
  getById(id: string): Promise<Look | null>;
  getItemsByLookId(lookId: string): Promise<LookItem[]>;
  delete(id: string): Promise<void>;
}
