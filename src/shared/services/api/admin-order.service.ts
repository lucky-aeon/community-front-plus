import { apiClient, ApiResponse } from './config';
import {
  OrderQueryRequest,
  OrderDTO,
  OrderStatisticsRequest,
  OrderStatisticsDTO,
  PageResponse
} from '../../types';

/**
 * 管理员订单管理服务类
 * 提供订单查询、详情查看、统计等功能
 */
export class AdminOrderService {

  /**
   * 分页查询订单列表
   * GET /api/admin/orders
   *
   * @description 支持用户ID、订单类型、产品类型、时间范围等条件查询的分页订单列表
   * @param params 查询参数，包含分页信息和筛选条件
   * @returns Promise<PageResponse<OrderDTO>> 分页的订单列表数据
   */
  static async getOrders(params: OrderQueryRequest = {}): Promise<PageResponse<OrderDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<OrderDTO>>>('/admin/orders', {
      params: {
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10,
        ...params.userId && { userId: params.userId },
        ...params.orderType && { orderType: params.orderType },
        ...params.productType && { productType: params.productType },
        ...params.productName && { productName: params.productName },
        ...params.cdkCode && { cdkCode: params.cdkCode },
        ...params.startTime && { startTime: params.startTime },
        ...params.endTime && { endTime: params.endTime }
      }
    });
    return response.data.data;
  }

  /**
   * 获取订单详情
   * GET /api/admin/orders/{id}
   *
   * @description 根据订单ID获取订单的详细信息
   * @param id 订单ID
   * @returns Promise<OrderDTO> 订单详情数据
   */
  static async getOrderById(id: string): Promise<OrderDTO> {
    const response = await apiClient.get<ApiResponse<OrderDTO>>(`/admin/orders/${id}`);
    return response.data.data;
  }

  /**
   * 获取订单统计信息
   * GET /api/admin/orders/statistics
   *
   * @description 统计指定时间范围内的订单数量和金额
   * @param params 统计查询请求参数
   * @returns Promise<OrderStatisticsDTO> 订单统计信息
   */
  static async getOrderStatistics(params: OrderStatisticsRequest = {}): Promise<OrderStatisticsDTO> {
    const response = await apiClient.get<ApiResponse<OrderStatisticsDTO>>('/admin/orders/statistics', {
      params: {
        ...params.startTime && { startTime: params.startTime },
        ...params.endTime && { endTime: params.endTime }
      }
    });
    return response.data.data;
  }
}