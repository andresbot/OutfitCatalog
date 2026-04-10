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
  GarmentGallery: undefined;
  GarmentDetail: { id: string };
  Looks: undefined;
  Favorites: undefined;
  DatabaseInspector: undefined;
};