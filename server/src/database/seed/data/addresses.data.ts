import type { DemoUserKey } from './users.data';

export interface SeedAddressDef {
  key: string;
  customerKey: Extract<DemoUserKey, 'customer' | 'customer2'>;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

export const SEED_ADDRESSES: SeedAddressDef[] = [
  {
    key: 'customer-home',
    customerKey: 'customer',
    fullName: 'Rahul Sharma',
    phone: '9876543213',
    addressLine1: '42 MG Road',
    addressLine2: 'Near City Mall',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    pincode: '560001',
    landmark: 'Opposite Metro Station',
    isDefault: true,
  },
  {
    key: 'customer-office',
    customerKey: 'customer',
    fullName: 'Rahul Sharma',
    phone: '9876543213',
    addressLine1: 'Tech Park, Block B, Floor 5',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    pincode: '560103',
    isDefault: false,
  },
];
