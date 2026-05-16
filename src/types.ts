export type UserRole = 'user' | 'vendor' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  UserHome: undefined;
  VendorHome: undefined;
  AdminHome: undefined;
  GarmentGallery: { selectionMode?: boolean } | undefined;
  GarmentDetail: { id: string };
  Looks: undefined;
  LookDetail: { lookId: string };
  CreateLookPreview: { garmentIds: string[] };
  Favorites: undefined;
  DatabaseInspector: undefined;
};