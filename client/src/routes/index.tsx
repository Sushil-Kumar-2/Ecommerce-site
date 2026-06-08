import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AccountLayout } from '@/components/storefront'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { MerchantLayout } from '@/layouts/MerchantLayout'
import { AccountDashboardPage } from '@/pages/account/AccountDashboardPage'
import { AddressesPage } from '@/pages/account/AddressesPage'
import { ChangePasswordPage } from '@/pages/account/ChangePasswordPage'
import { CreateAddressPage } from '@/pages/account/CreateAddressPage'
import { EditAddressPage } from '@/pages/account/EditAddressPage'
import { ProfilePage } from '@/pages/account/ProfilePage'
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogsPage'
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage'
import { AdminCouponsPage } from '@/pages/admin/AdminCouponsPage'
import { AdminHomePage } from '@/pages/admin/AdminHomePage'
import { AdminMerchantDetailPage } from '@/pages/admin/AdminMerchantDetailPage'
import { AdminMerchantsPage } from '@/pages/admin/AdminMerchantsPage'
import { AdminProductDetailPage } from '@/pages/admin/AdminProductDetailPage'
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage'
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage'
import { AdminUserDetailPage } from '@/pages/admin/AdminUserDetailPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { CartPage } from '@/pages/customer/CartPage'
import { CheckoutPage } from '@/pages/customer/CheckoutPage'
import { HomePage } from '@/pages/customer/HomePage'
import { OrderDetailPage } from '@/pages/customer/OrderDetailPage'
import { OrdersPage } from '@/pages/customer/OrdersPage'
import { PaymentFailedPage } from '@/pages/customer/PaymentFailedPage'
import { PaymentSuccessPage } from '@/pages/customer/PaymentSuccessPage'
import { ProductDetailPage } from '@/pages/customer/ProductDetailPage'
import { ProductsPage } from '@/pages/customer/ProductsPage'
import { WishlistPage } from '@/pages/customer/WishlistPage'
import { MerchantHomePage } from '@/pages/merchant/MerchantHomePage'
import { CreateProductPage } from '@/pages/merchant/CreateProductPage'
import { EditProductPage } from '@/pages/merchant/EditProductPage'
import { MerchantInventoryPage } from '@/pages/merchant/MerchantInventoryPage'
import { MerchantOrderDetailPage } from '@/pages/merchant/MerchantOrderDetailPage'
import { MerchantOrdersPage } from '@/pages/merchant/MerchantOrdersPage'
import { MerchantProductsPage } from '@/pages/merchant/MerchantProductsPage'
import { MerchantReviewsPage } from '@/pages/merchant/MerchantReviewsPage'
import { UserRole } from '@/types/auth.types'

import { GuestRoute } from './guest-route'
import { ProtectedRoute } from './protected-route'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
      },
      {
        path: 'cart',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <CartPage /> }],
      },
      {
        path: 'checkout',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <CheckoutPage /> }],
      },
      {
        path: 'payment/success',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <PaymentSuccessPage /> }],
      },
      {
        path: 'payment/failed',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <PaymentFailedPage /> }],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AccountLayout />,
            children: [
              {
                path: 'account',
                element: <AccountDashboardPage />,
              },
              {
                path: 'orders',
                element: <OrdersPage />,
              },
              {
                path: 'orders/:id',
                element: <OrderDetailPage />,
              },
              {
                path: 'wishlist',
                element: <WishlistPage />,
              },
              {
                path: 'account/addresses',
                element: <AddressesPage />,
              },
              {
                path: 'account/addresses/new',
                element: <CreateAddressPage />,
              },
              {
                path: 'account/addresses/edit/:id',
                element: <EditAddressPage />,
              },
              {
                path: 'profile',
                element: <ProfilePage />,
              },
              {
                path: 'profile/change-password',
                element: <ChangePasswordPage />,
              },
            ],
          },
        ],
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
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
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
          {
            index: true,
            element: <MerchantHomePage />,
          },
          {
            path: 'products',
            element: <MerchantProductsPage />,
          },
          {
            path: 'products/new',
            element: <CreateProductPage />,
          },
          {
            path: 'products/edit/:id',
            element: <EditProductPage />,
          },
          {
            path: 'orders',
            element: <MerchantOrdersPage />,
          },
          {
            path: 'orders/:id',
            element: <MerchantOrderDetailPage />,
          },
          {
            path: 'inventory',
            element: <MerchantInventoryPage />,
          },
          {
            path: 'reviews',
            element: <MerchantReviewsPage />,
          },
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
          {
            index: true,
            element: <AdminHomePage />,
          },
          {
            path: 'merchants',
            element: <AdminMerchantsPage />,
          },
          {
            path: 'merchants/:id',
            element: <AdminMerchantDetailPage />,
          },
          {
            path: 'products',
            element: <AdminProductsPage />,
          },
          {
            path: 'products/:id',
            element: <AdminProductDetailPage />,
          },
          {
            path: 'categories',
            element: <AdminCategoriesPage />,
          },
          {
            path: 'coupons',
            element: <AdminCouponsPage />,
          },
          {
            path: 'users',
            element: <AdminUsersPage />,
          },
          {
            path: 'users/:id',
            element: <AdminUserDetailPage />,
          },
          {
            path: 'audit-logs',
            element: <AdminAuditLogsPage />,
          },
          {
            path: 'reports',
            element: <AdminReportsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
