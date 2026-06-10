import { Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { RouteFallback } from '@/components/common/RouteFallback'
import { AccountLayout } from '@/components/storefront'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { MerchantLayout } from '@/layouts/MerchantLayout'
import { UserRole } from '@/types/auth.types'

import { GuestRoute } from './guest-route'
import {
  AccountDashboardPage,
  AddressesPage,
  AdminAuditLogsPage,
  AdminCategoriesPage,
  AdminCouponsPage,
  AdminHomePage,
  AdminMerchantDetailPage,
  AdminMerchantsPage,
  AdminProductDetailPage,
  AdminProductsPage,
  AdminReportsPage,
  AdminUserDetailPage,
  AdminUsersPage,
  CartPage,
  ChangePasswordPage,
  CheckoutPage,
  CreateAddressPage,
  CreateProductPage,
  EditAddressPage,
  EditProductPage,
  HomePage,
  GoogleCallbackPage,
  LoginPage,
  MerchantHomePage,
  MerchantInventoryPage,
  MerchantOrderDetailPage,
  MerchantOrdersPage,
  MerchantProductsPage,
  MerchantReviewsPage,
  OrderDetailPage,
  OrdersPage,
  PaymentFailedPage,
  PaymentSuccessPage,
  ProductDetailPage,
  ProductsPage,
  ProfilePage,
  RegisterPage,
  BecomeASellerPage,
  WishlistPage,
} from './lazy-pages'
import { ProtectedRoute } from './protected-route'

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: 'products', element: withSuspense(<ProductsPage />) },
      { path: 'products/:id', element: withSuspense(<ProductDetailPage />) },
      {
        path: 'cart',
        element: <ProtectedRoute />,
        children: [{ index: true, element: withSuspense(<CartPage />) }],
      },
      {
        path: 'checkout',
        element: <ProtectedRoute />,
        children: [{ index: true, element: withSuspense(<CheckoutPage />) }],
      },
      {
        path: 'payment/success',
        element: <ProtectedRoute />,
        children: [{ index: true, element: withSuspense(<PaymentSuccessPage />) }],
      },
      {
        path: 'payment/failed',
        element: <ProtectedRoute />,
        children: [{ index: true, element: withSuspense(<PaymentFailedPage />) }],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AccountLayout />,
            children: [
              { path: 'account', element: withSuspense(<AccountDashboardPage />) },
              { path: 'orders', element: withSuspense(<OrdersPage />) },
              { path: 'orders/:id', element: withSuspense(<OrderDetailPage />) },
              { path: 'wishlist', element: withSuspense(<WishlistPage />) },
              { path: 'account/addresses', element: withSuspense(<AddressesPage />) },
              { path: 'account/addresses/new', element: withSuspense(<CreateAddressPage />) },
              { path: 'account/addresses/edit/:id', element: withSuspense(<EditAddressPage />) },
              { path: 'profile', element: withSuspense(<ProfilePage />) },
              { path: 'profile/change-password', element: withSuspense(<ChangePasswordPage />) },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/become-a-seller',
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ index: true, element: withSuspense(<BecomeASellerPage />) }],
      },
    ],
  },
  {
    path: '/auth',
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: withSuspense(<LoginPage />) },
          { path: 'google/callback', element: withSuspense(<GoogleCallbackPage />) },
          { path: 'register', element: withSuspense(<RegisterPage />) },
        ],
      },
    ],
  },
  {
    path: '/merchant',
    element: <ProtectedRoute allowedRoles={[UserRole.MERCHANT]} />,
    children: [
      {
        element: <MerchantLayout />,
        children: [
          { index: true, element: withSuspense(<MerchantHomePage />) },
          { path: 'products', element: withSuspense(<MerchantProductsPage />) },
          { path: 'products/new', element: withSuspense(<CreateProductPage />) },
          { path: 'products/edit/:id', element: withSuspense(<EditProductPage />) },
          { path: 'orders', element: withSuspense(<MerchantOrdersPage />) },
          { path: 'orders/:id', element: withSuspense(<MerchantOrderDetailPage />) },
          { path: 'inventory', element: withSuspense(<MerchantInventoryPage />) },
          { path: 'reviews', element: withSuspense(<MerchantReviewsPage />) },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: withSuspense(<AdminHomePage />) },
          { path: 'merchants', element: withSuspense(<AdminMerchantsPage />) },
          { path: 'merchants/:id', element: withSuspense(<AdminMerchantDetailPage />) },
          { path: 'products', element: withSuspense(<AdminProductsPage />) },
          { path: 'products/:id', element: withSuspense(<AdminProductDetailPage />) },
          { path: 'categories', element: withSuspense(<AdminCategoriesPage />) },
          { path: 'coupons', element: withSuspense(<AdminCouponsPage />) },
          { path: 'users', element: withSuspense(<AdminUsersPage />) },
          { path: 'users/:id', element: withSuspense(<AdminUserDetailPage />) },
          { path: 'audit-logs', element: withSuspense(<AdminAuditLogsPage />) },
          { path: 'reports', element: withSuspense(<AdminReportsPage />) },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
