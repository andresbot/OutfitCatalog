export type UserRole = 'user' | 'vendor' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Garment {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description: string;
  size: string;
  color: string;
  stock: number;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  UserHome: undefined;
  VendorHome: undefined;
  AdminHome: undefined;
  GarmentGallery: undefined;
  GarmentDetail: { id: string };
};
