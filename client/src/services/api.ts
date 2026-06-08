import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { env } from '@/lib/env'
import type { RootState } from '@/store'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: env.apiUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      return headers
    },
  }),
  tagTypes: [
    'Auth',
    'User',
    'Product',
    'Category',
    'Cart',
    'Order',
    'Payment',
    'Wishlist',
    'Review',
    'Notification',
    'Return',
    'Profile',
    'Address',
    'Dashboard',
    'Inventory',
    'Merchant',
    'Coupon',
    'AuditLog',
    'ProductReport',
    'RecentlyViewed',
  ],
  endpoints: () => ({}),
})
