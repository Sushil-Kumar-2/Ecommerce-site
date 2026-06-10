import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { OrderStatus, PaymentStatus } from 'src/orders/order.enums';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  Category,
  CategoryDocument,
} from '../categories/schemas/category.schema';
import { isValidObjectId, Model } from 'mongoose';
import {
  AdminDashboardResponse,
  AdminMonthlyRevenueItem,
  AdminTopCategoryItem,
  AdminTopMerchantItem,
  AdminTopProductItem,
} from './interfaces/admin-dashboard.interface';

interface MerchantMonthlySalesResult {
  _id: { year: number; month: number };
  totalRevenue: number;
  totalOrders: number;
}

interface AdminMonthlyRevenueAggregate {
  _id: { year: number; month: number };
  revenue: number;
  orders: number;
}

interface TopProductAggregate {
  _id: string;
  title: string;
  totalSold: number;
  revenue: number;
}

interface TopMerchantAggregate {
  _id: string;
  totalSold: number;
  revenue: number;
  orderIds: string[];
}

interface TopCategoryAggregate {
  _id: string;
  totalSold: number;
  revenue: number;
}
@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    const [
      totalUsers,
      totalMerchants,
      totalProducts,
      totalOrders,
      pendingOrders,
      refundedOrders,
      totalRevenue,
      monthlyRevenue,
      topProducts,
      topMerchantsRaw,
      topCategoriesRaw,
    ] = await Promise.all([
      this.userModel.countDocuments({ role: 'user' }),
      this.userModel.countDocuments({ role: 'merchant' }),
      this.productModel.countDocuments(),
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ orderStatus: OrderStatus.PENDING }),
      this.orderModel.countDocuments({ paymentStatus: PaymentStatus.REFUNDED }),
      this.calculateTotalRevenue(),
      this.getAdminMonthlyRevenue(),
      this.getTopProducts(),
      this.getTopMerchantsRaw(),
      this.getTopCategoriesRaw(),
    ]);

    const topMerchants = await this.enrichTopMerchants(topMerchantsRaw);
    const topCategories = await this.enrichTopCategories(topCategoriesRaw);

    return {
      overview: {
        totalUsers,
        totalMerchants,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        refundedOrders,
      },
      monthlyRevenue,
      topProducts,
      topMerchants,
      topCategories,
    };
  }

  async getAdminMonthlyRevenue(): Promise<AdminMonthlyRevenueItem[]> {
    const results =
      await this.orderModel.aggregate<AdminMonthlyRevenueAggregate>([
        {
          $match: {
            paymentStatus: PaymentStatus.PAID,
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]);

    return results.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      monthLabel: `${item._id.month}/${item._id.year}`,
      revenue: item.revenue,
      orders: item.orders,
    }));
  }

  private async calculateTotalRevenue(): Promise<number> {
    const result = await this.orderModel.aggregate<{ total: number }>([
      {
        $match: {
          paymentStatus: PaymentStatus.PAID,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    return result[0]?.total ?? 0;
  }

  private async getTopProducts(): Promise<AdminTopProductItem[]> {
    const paidOrderMatch = {
      paymentStatus: PaymentStatus.PAID,
    };

    const rows = await this.orderModel.aggregate<TopProductAggregate>([
      { $match: paidOrderMatch },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          title: { $first: '$items.title' },
          totalSold: { $sum: '$items.quantity' },
          revenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    return rows.map((row) => ({
      productId: row._id,
      title: row.title,
      totalSold: row.totalSold,
      revenue: row.revenue,
    }));
  }

  private async getTopMerchantsRaw(): Promise<TopMerchantAggregate[]> {
    return this.orderModel.aggregate<TopMerchantAggregate>([
      { $match: { paymentStatus: PaymentStatus.PAID } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.merchantId',
          totalSold: { $sum: '$items.quantity' },
          revenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
          orderIds: { $addToSet: { $toString: '$_id' } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);
  }

  private async enrichTopMerchants(
    rows: TopMerchantAggregate[],
  ): Promise<AdminTopMerchantItem[]> {
    const merchantIds = rows.map((row) => row._id);
    const merchants = await this.userModel
      .find({ _id: { $in: merchantIds } })
      .select('name shopName')
      .lean();

    const merchantMap = new Map(
      merchants.map((merchant) => [merchant._id.toString(), merchant]),
    );

    return rows.map((row) => {
      const merchant = merchantMap.get(row._id);

      return {
        merchantId: row._id,
        merchantName: merchant?.name ?? 'Unknown',
        shopName: merchant?.shopName ?? null,
        totalOrders: row.orderIds.length,
        totalSold: row.totalSold,
        revenue: row.revenue,
      };
    });
  }

  private async getTopCategoriesRaw(): Promise<TopCategoryAggregate[]> {
    return this.orderModel.aggregate<TopCategoryAggregate>([
      { $match: { paymentStatus: PaymentStatus.PAID } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          let: { productId: '$items.productId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: '$_id' }, '$$productId'],
                },
              },
            },
            { $project: { categoryId: 1 } },
          ],
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: { $toString: '$product.categoryId' },
          totalSold: { $sum: '$items.quantity' },
          revenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);
  }

  private async enrichTopCategories(
    rows: TopCategoryAggregate[],
  ): Promise<AdminTopCategoryItem[]> {
    const categoryIds = rows
      .map((row) => row._id)
      .filter((id) => isValidObjectId(id));
    const categories = await this.categoryModel
      .find({ _id: { $in: categoryIds } })
      .select('name')
      .lean();

    const categoryMap = new Map(
      categories.map((category) => [category._id.toString(), category.name]),
    );

    return rows.map((row) => ({
      categoryId: row._id,
      categoryName: categoryMap.get(row._id) ?? 'Unknown',
      totalSold: row.totalSold,
      revenue: row.revenue,
    }));
  }

  async getMerchantDashboard(merchantId: string) {
    const totalProducts = await this.productModel.countDocuments({
      merchantId,
    });
    const totalOrders = await this.orderModel.countDocuments({
      merchantIds: merchantId,
    });
    const pendingOrders = await this.orderModel.countDocuments({
      merchantIds: merchantId,
      orderStatus: OrderStatus.PENDING,
    });
    const deliveredOrders = await this.orderModel.countDocuments({
      merchantIds: merchantId,
      orderStatus: OrderStatus.DELIVERED,
    });
    const cancelledOrders = await this.orderModel.countDocuments({
      merchantIds: merchantId,
      orderStatus: OrderStatus.CANCELLED,
    });
    const revenueOrders = await this.orderModel.find({
      merchantIds: merchantId,
      orderStatus: {
        $in: [
          OrderStatus.CONFIRMED,
          OrderStatus.PROCESSING,
          OrderStatus.SHIPPED,
          OrderStatus.DELIVERED,
        ],
      },
    });
    const totalRevenue = revenueOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    const topProducts = await this.orderModel.aggregate([
      {
        $match: {
          orderStatus: 'delivered',
        },
      },
      {
        $unwind: '$items',
      },
      {
        $match: {
          'items.merchantId': merchantId,
        },
      },
      {
        $group: {
          _id: '$items.productId',
          title: { $first: '$items.title' },
          totalSold: { $sum: '$items.quantity' },
          revenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return {
      totalProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      topProducts,
    };
  }

  async getMonthlySalesAnalytics(merchantId: string) {
    const sales = await this.orderModel.aggregate<MerchantMonthlySalesResult>([
      {
        $match: {
          orderStatus: 'delivered',
        },
      },

      {
        $unwind: '$items',
      },

      {
        $match: {
          'items.merchantId': merchantId,
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: '$createdAt',
            },
            month: {
              $month: '$createdAt',
            },
          },

          totalRevenue: {
            $sum: {
              $multiply: ['$items.price', '$items.quantity'],
            },
          },

          totalOrders: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    return sales.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      monthLabel: `${item._id.month}/${item._id.year}`,
      revenue: item.totalRevenue,
      orders: item.totalOrders,
    }));
  }

  async getLowStockProducts(merchantId: string) {
    return this.productModel
      .find({
        merchantId,
        stock: { $lte: 5 },
      })
      .select('_id title stock')
      .lean();
  }

  create(createDashboardDto: CreateDashboardDto) {
    return this.orderModel.create(createDashboardDto);
  }
  findAll() {
    return `This action returns all dashboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dashboard`;
  }

  update(id: string, updateDashboardDto: UpdateDashboardDto) {
    return this.orderModel.findByIdAndUpdate(id, updateDashboardDto, {
      new: true,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} dashboard`;
  }
}
