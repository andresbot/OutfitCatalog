export type UserRole = 'user' | 'vendor' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export type GooglePendingUser = {
  uid: string;
  name: string;
  email: string;
};

export type GoogleSignInResult =
  | { isNew: false; user: AuthUser }
  | { isNew: true; pending: GooglePendingUser };

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  GoogleRoleSelect: GooglePendingUser;
  UserHome: undefined;
  VendorHome: undefined;
  AdminHome: undefined;
  GarmentGallery: { selectionMode?: boolean } | undefined;
  GarmentDetail: { id: string };
  Looks: undefined;
  LookDetail: { lookId: string };
  CreateLookPreview: { garmentIds: string[] };
  PurchaseRequests: { mode?: 'buyer' | 'vendor' } | undefined;
  Favorites: undefined;
  InventoryManagement: undefined;
  AddEditGarment: { garmentId?: string } | undefined;
  UserManagement: undefined;
  AdminReports: undefined;
  LookModeration: undefined;
  VendorProfile: undefined;
  TryOnResult: {
    resultImageUrl: string;
    garmentName: string;
    garmentPrice: number;
    vendorId: string;
    vendorName: string;
    garmentImageUrl: string;
    garmentCategory: string;
    garmentSize: string;
    garmentColor: string;
    garmentStock: number;
  };
};
