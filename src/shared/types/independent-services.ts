/**
 * 独立服务与服务订单相关类型定义
 */

/**
 * 单个独立服务配置
 */
export interface IndependentServiceConfig {
  serviceCode: string;
  enabled: boolean;
  visibleInHome: boolean;
  sortOrder: number;
  title: string;
  price: string;
  priceUnit: string;
  summary: string;
  description: string;
  highlights: string[];
  ctaText: string;
  wechatNumber: string;
  wechatTip: string;
  serviceProcess: string[];
  targetUsers: string[];
  topics: string[];
  notes: string[];
}

/**
 * 独立服务配置集合
 */
export interface IndependentServicesConfigData {
  services: IndependentServiceConfig[];
}

/**
 * 独立服务公开展示 DTO
 */
export type IndependentServiceDTO = IndependentServiceConfig;

/**
 * 独立服务订单类型
 */
export type ServiceOrderType = 'SERVICE';

/**
 * 独立服务订单类型
 */
export type IndependentServiceOrderType = ServiceOrderType;

/**
 * 独立服务订单产品类型
 */
export type ServiceOrderProductType = 'SERVICE';

/**
 * 独立服务订单产品类型
 */
export type IndependentServiceOrderProductType = ServiceOrderProductType;

/**
 * 独立服务订单来源渠道
 */
export type ServiceOrderSourceChannel = 'WECHAT' | 'MANUAL' | 'OTHER';

/**
 * 独立服务订单来源渠道
 */
export type IndependentServiceOrderSourceChannel = ServiceOrderSourceChannel;

/**
 * 独立服务订单状态
 */
export type ServiceOrderStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELED';

/**
 * 独立服务订单状态
 */
export type IndependentServiceOrderStatus = ServiceOrderStatus;

/**
 * 创建独立服务订单请求
 */
export interface CreateServiceOrderRequest {
  serviceCode: string;
  amount: number;
  remark?: string;
}

/**
 * 创建独立服务订单请求
 */
export type CreateIndependentServiceOrderRequest = CreateServiceOrderRequest;

/**
 * 独立服务订单 DTO
 */
export interface IndependentServiceOrderDTO {
  id: string;
  orderNo: string;
  userId?: string | null;
  userName?: string | null;
  cdkCode?: string | null;
  orderType: IndependentServiceOrderType;
  productType: IndependentServiceOrderProductType;
  productId: string;
  productName: string;
  amount: number;
  activatedTime?: string | null;
  remark?: string | null;
  contactId: string;
  sourceChannel: IndependentServiceOrderSourceChannel | string;
  unitPrice: number;
  quantity: number;
  quantityUnit: string;
  totalAmount: number;
  status: IndependentServiceOrderStatus | string;
  createdBy: string;
  confirmedAt?: string | null;
  completedAt?: string | null;
  canceledAt?: string | null;
  createTime: string;
}
