export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  shopLogo: string | null;
  shopName: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
