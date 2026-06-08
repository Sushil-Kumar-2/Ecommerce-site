export type DemoUserKey =
  | 'admin'
  | 'merchant1'
  | 'merchant2'
  | 'customer'
  | 'customer2';

export interface SeedUserDef {
  key: DemoUserKey;
  name: string;
  email: string;
  role: 'admin' | 'merchant' | 'user';
  phone: string;
  shopName?: string;
  shopDescription?: string;
}

export const SEED_USERS: SeedUserDef[] = [
  {
    key: 'admin',
    name: 'Demo Admin',
    email: 'demo+admin@shopkart.demo',
    role: 'admin',
    phone: '9876543210',
  },
  {
    key: 'merchant1',
    name: 'TechZone Owner',
    email: 'demo+merchant1@shopkart.demo',
    role: 'merchant',
    phone: '9876543211',
    shopName: 'TechZone',
    shopDescription: 'Electronics, mobiles, and laptops at best prices.',
  },
  {
    key: 'merchant2',
    name: 'HomeStyle Owner',
    email: 'demo+merchant2@shopkart.demo',
    role: 'merchant',
    phone: '9876543212',
    shopName: 'HomeStyle',
    shopDescription: 'Fashion, home, beauty, and lifestyle products.',
  },
  {
    key: 'customer',
    name: 'Rahul Sharma',
    email: 'demo+customer@shopkart.demo',
    role: 'user',
    phone: '9876543213',
  },
  {
    key: 'customer2',
    name: 'Priya Patel',
    email: 'demo+customer2@shopkart.demo',
    role: 'user',
    phone: '9876543214',
  },
];
