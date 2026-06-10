export interface SeedCategoryDef {
  slug: string;
  name: string;
  description: string;
  image: string;
  parentSlug?: string;
  status?: 'active' | 'inactive';
}

export const SEED_CATEGORIES: SeedCategoryDef[] = [
  {
    slug: 'electronics',
    name: 'Electronics',
    description: 'Gadgets, accessories, and tech essentials.',
    image:
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop',
  },
  {
    slug: 'mobiles',
    name: 'Mobiles',
    description: 'Smartphones and mobile accessories.',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
    parentSlug: 'electronics',
    status: 'active',
  },
  {
    slug: 'laptops',
    name: 'Laptops',
    description: 'Laptops and computing gear.',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop',
    parentSlug: 'electronics',
    status: 'active',
  },
  {
    slug: 'fashion',
    name: 'Fashion',
    description: 'Clothing and footwear for every occasion.',
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop',
  },
  {
    slug: 'home-kitchen',
    name: 'Home & Kitchen',
    description: 'Appliances and home essentials.',
    image:
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&h=200&fit=crop',
  },
  {
    slug: 'beauty',
    name: 'Beauty',
    description: 'Skincare, makeup, and personal care.',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop',
  },
  {
    slug: 'sports',
    name: 'Sports',
    description: 'Fitness and outdoor gear.',
    image:
      'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  {
    slug: 'books',
    name: 'Books',
    description: 'Books for learning and leisure.',
    image:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=200&fit=crop',
  },
];
