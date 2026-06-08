import { configureStore } from '@reduxjs/toolkit'

import '@/features/admin-audit-logs/adminAuditLogsApi'
import '@/features/admin-categories/adminCategoriesApi'
import '@/features/admin-coupons/adminCouponsApi'
import '@/features/admin-merchants/adminMerchantsApi'
import '@/features/admin-products/adminProductsApi'
import '@/features/admin-reports/adminReportsApi'
import '@/features/admin-users/adminUsersApi'
import '@/features/dashboard/dashboardApi'
import '@/features/inventory/inventoryApi'
import '@/features/merchant-orders/merchantOrdersApi'
import '@/features/merchant-products/merchantProductsApi'
import '@/features/merchant-reviews/merchantReviewsApi'
import '@/features/addresses/addressesApi'
import '@/features/auth/authApi'
import '@/features/cart/cartApi'
import '@/features/checkout/checkoutApi'
import '@/features/notifications/notificationsApi'
import '@/features/orders/ordersApi'
import '@/features/payments/paymentsApi'
import '@/features/products/productsApi'
import '@/features/profile/profileApi'
import '@/features/recently-viewed/recentlyViewedApi'
import '@/features/reviews/reviewsApi'
import '@/features/wishlist/wishlistApi'
import { baseApi } from '@/services/api'

import { authReducer } from './slices/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
