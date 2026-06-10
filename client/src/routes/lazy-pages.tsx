import { lazy } from 'react'

export const HomePage = lazy(() =>
  import('@/pages/customer/HomePage').then((m) => ({ default: m.HomePage })),
)
export const ProductsPage = lazy(() =>
  import('@/pages/customer/ProductsPage').then((m) => ({ default: m.ProductsPage })),
)
export const ProductDetailPage = lazy(() =>
  import('@/pages/customer/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })),
)
export const CartPage = lazy(() =>
  import('@/pages/customer/CartPage').then((m) => ({ default: m.CartPage })),
)
export const CheckoutPage = lazy(() =>
  import('@/pages/customer/CheckoutPage').then((m) => ({ default: m.CheckoutPage })),
)
export const PaymentSuccessPage = lazy(() =>
  import('@/pages/customer/PaymentSuccessPage').then((m) => ({ default: m.PaymentSuccessPage })),
)
export const PaymentFailedPage = lazy(() =>
  import('@/pages/customer/PaymentFailedPage').then((m) => ({ default: m.PaymentFailedPage })),
)
export const OrdersPage = lazy(() =>
  import('@/pages/customer/OrdersPage').then((m) => ({ default: m.OrdersPage })),
)
export const OrderDetailPage = lazy(() =>
  import('@/pages/customer/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })),
)
export const WishlistPage = lazy(() =>
  import('@/pages/customer/WishlistPage').then((m) => ({ default: m.WishlistPage })),
)

export const AccountDashboardPage = lazy(() =>
  import('@/pages/account/AccountDashboardPage').then((m) => ({ default: m.AccountDashboardPage })),
)
export const AddressesPage = lazy(() =>
  import('@/pages/account/AddressesPage').then((m) => ({ default: m.AddressesPage })),
)
export const CreateAddressPage = lazy(() =>
  import('@/pages/account/CreateAddressPage').then((m) => ({ default: m.CreateAddressPage })),
)
export const EditAddressPage = lazy(() =>
  import('@/pages/account/EditAddressPage').then((m) => ({ default: m.EditAddressPage })),
)
export const ProfilePage = lazy(() =>
  import('@/pages/account/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
export const ChangePasswordPage = lazy(() =>
  import('@/pages/account/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })),
)

export const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
)
export const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
export const GoogleCallbackPage = lazy(() =>
  import('@/pages/auth/GoogleCallbackPage').then((m) => ({ default: m.GoogleCallbackPage })),
)
export const BecomeASellerPage = lazy(() =>
  import('@/pages/auth/BecomeASellerPage').then((m) => ({ default: m.BecomeASellerPage })),
)

export const MerchantHomePage = lazy(() =>
  import('@/pages/merchant/MerchantHomePage').then((m) => ({ default: m.MerchantHomePage })),
)
export const MerchantProductsPage = lazy(() =>
  import('@/pages/merchant/MerchantProductsPage').then((m) => ({ default: m.MerchantProductsPage })),
)
export const CreateProductPage = lazy(() =>
  import('@/pages/merchant/CreateProductPage').then((m) => ({ default: m.CreateProductPage })),
)
export const EditProductPage = lazy(() =>
  import('@/pages/merchant/EditProductPage').then((m) => ({ default: m.EditProductPage })),
)
export const MerchantOrdersPage = lazy(() =>
  import('@/pages/merchant/MerchantOrdersPage').then((m) => ({ default: m.MerchantOrdersPage })),
)
export const MerchantOrderDetailPage = lazy(() =>
  import('@/pages/merchant/MerchantOrderDetailPage').then((m) => ({ default: m.MerchantOrderDetailPage })),
)
export const MerchantInventoryPage = lazy(() =>
  import('@/pages/merchant/MerchantInventoryPage').then((m) => ({ default: m.MerchantInventoryPage })),
)
export const MerchantReviewsPage = lazy(() =>
  import('@/pages/merchant/MerchantReviewsPage').then((m) => ({ default: m.MerchantReviewsPage })),
)

export const AdminHomePage = lazy(() =>
  import('@/pages/admin/AdminHomePage').then((m) => ({ default: m.AdminHomePage })),
)
export const AdminMerchantsPage = lazy(() =>
  import('@/pages/admin/AdminMerchantsPage').then((m) => ({ default: m.AdminMerchantsPage })),
)
export const AdminMerchantDetailPage = lazy(() =>
  import('@/pages/admin/AdminMerchantDetailPage').then((m) => ({ default: m.AdminMerchantDetailPage })),
)
export const AdminProductsPage = lazy(() =>
  import('@/pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })),
)
export const AdminProductDetailPage = lazy(() =>
  import('@/pages/admin/AdminProductDetailPage').then((m) => ({ default: m.AdminProductDetailPage })),
)
export const AdminCategoriesPage = lazy(() =>
  import('@/pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })),
)
export const AdminCouponsPage = lazy(() =>
  import('@/pages/admin/AdminCouponsPage').then((m) => ({ default: m.AdminCouponsPage })),
)
export const AdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
)
export const AdminUserDetailPage = lazy(() =>
  import('@/pages/admin/AdminUserDetailPage').then((m) => ({ default: m.AdminUserDetailPage })),
)
export const AdminAuditLogsPage = lazy(() =>
  import('@/pages/admin/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage })),
)
export const AdminReportsPage = lazy(() =>
  import('@/pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })),
)
