import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

import { env } from '@/lib/env'
import type { RootState } from '@/store'
import { clearCredentials, setCredentials } from '@/store/slices/authSlice'
import { decodeJwtPayload, mapJwtPayloadToAuthUser } from '@/utils/jwt'

const baseQuery = fetchBaseQuery({
  baseUrl: env.apiUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const request = typeof args === 'string' ? { url: args } : args
    const isAuthEndpoint =
      request.url === '/auth/login' ||
      request.url === '/auth/refresh' ||
      request.url === '/auth/logout'

    if (!isAuthEndpoint) {
      const refreshResult = await baseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions,
      )

      if (refreshResult.data) {
        const { accessToken } = refreshResult.data as { accessToken: string }
        const payload = decodeJwtPayload(accessToken)

        if (payload) {
          api.dispatch(
            setCredentials({
              token: accessToken,
              user: mapJwtPayloadToAuthUser(payload),
            }),
          )
          result = await baseQuery(args, api, extraOptions)
        } else {
          api.dispatch(clearCredentials())
        }
      } else {
        api.dispatch(clearCredentials())
      }
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
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
