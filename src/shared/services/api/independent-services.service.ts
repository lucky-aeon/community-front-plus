import { apiClient, type ApiResponse } from './config';
import { AdminOrderService } from './admin-order.service';
import { SystemConfigService } from './system-config.service';
import type {
  CreateServiceOrderRequest,
  IndependentServiceDTO,
  IndependentServicesConfigData,
  OrderDTO
} from '@shared/types';
import {
  DEFAULT_INDEPENDENT_SERVICE,
  DEFAULT_INDEPENDENT_SERVICES
} from '@shared/constants/independent-services';

const normalizeText = (value: unknown, fallback = ''): string => {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed !== '' ? trimmed : fallback;
};

const normalizeTextList = (value: unknown, fallback: string[] = []): string[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }
  const items = value
    .map((item) => normalizeText(item))
    .filter((item) => item !== '');
  return items.length > 0 ? items : fallback;
};

const GENERIC_SERVICE_SUMMARY = '围绕目标岗位提供一对一支持';
const GENERIC_SERVICE_CTA_TEXT = '立即咨询';
const GENERIC_SERVICE_HIGHLIGHTS = ['围绕目标需求提供个性化支持'];

const normalizePublicServiceSummary = (value: unknown): string => {
  const text = normalizeText(value, '');
  if (!text) {
    return GENERIC_SERVICE_SUMMARY;
  }
  if (/微信|咨询|人工支持|安排时间|沟通/.test(text)) {
    return GENERIC_SERVICE_SUMMARY;
  }
  return text;
};

const normalizePublicServiceCtaText = (value: unknown): string => {
  const text = normalizeText(value, '');
  if (!text) {
    return GENERIC_SERVICE_CTA_TEXT;
  }
  if (/微信|咨询/.test(text)) {
    return GENERIC_SERVICE_CTA_TEXT;
  }
  return text;
};

const normalizePublicServiceHighlights = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return GENERIC_SERVICE_HIGHLIGHTS;
  }

  const items = value
    .map((item) => normalizeText(item))
    .filter((item) => item !== '')
    .filter((item) => !/微信|咨询|人工支持|安排时间|沟通后安排时间|先微信/.test(item));

  return items.length > 0 ? items : GENERIC_SERVICE_HIGHLIGHTS;
};

const normalizeService = (service?: Partial<IndependentServiceDTO> | null): IndependentServiceDTO => ({
  serviceCode: normalizeText(service?.serviceCode, DEFAULT_INDEPENDENT_SERVICE.serviceCode),
  enabled: typeof service?.enabled === 'boolean' ? service.enabled : DEFAULT_INDEPENDENT_SERVICE.enabled,
  visibleInHome:
    typeof service?.visibleInHome === 'boolean' ? service.visibleInHome : DEFAULT_INDEPENDENT_SERVICE.visibleInHome,
  sortOrder: Number.isFinite(service?.sortOrder) ? Number(service?.sortOrder) : DEFAULT_INDEPENDENT_SERVICE.sortOrder,
  title: normalizeText(service?.title, DEFAULT_INDEPENDENT_SERVICE.title),
  price: normalizeText(service?.price, DEFAULT_INDEPENDENT_SERVICE.price),
  priceUnit: normalizeText(service?.priceUnit, DEFAULT_INDEPENDENT_SERVICE.priceUnit),
  summary: normalizePublicServiceSummary(service?.summary),
  description: normalizeText(service?.description, DEFAULT_INDEPENDENT_SERVICE.description),
  highlights: normalizePublicServiceHighlights(service?.highlights),
  ctaText: normalizePublicServiceCtaText(service?.ctaText),
  wechatNumber: normalizeText(service?.wechatNumber, DEFAULT_INDEPENDENT_SERVICE.wechatNumber),
  wechatTip: normalizeText(service?.wechatTip, DEFAULT_INDEPENDENT_SERVICE.wechatTip),
  serviceProcess: normalizeTextList(service?.serviceProcess, DEFAULT_INDEPENDENT_SERVICE.serviceProcess),
  targetUsers: normalizeTextList(service?.targetUsers, DEFAULT_INDEPENDENT_SERVICE.targetUsers),
  topics: normalizeTextList(service?.topics, DEFAULT_INDEPENDENT_SERVICE.topics),
  notes: normalizeTextList(service?.notes, DEFAULT_INDEPENDENT_SERVICE.notes)
});

const normalizeServiceList = (
  services: Array<Partial<IndependentServiceDTO> | null | undefined>
): IndependentServiceDTO[] => {
  return services
    .map((service) => normalizeService(service))
    .sort((left, right) => {
      const orderDiff = left.sortOrder - right.sortOrder;
      if (orderDiff !== 0) {
        return orderDiff;
      }
      return left.serviceCode.localeCompare(right.serviceCode);
    });
};

const normalizeConfigData = (
  data?: Partial<IndependentServicesConfigData> | null
): IndependentServicesConfigData => {
  if (!data || !Array.isArray(data.services)) {
    return {
      services: normalizeServiceList(DEFAULT_INDEPENDENT_SERVICES)
    };
  }

  const services = normalizeServiceList(data.services);
  return {
    services: services.length > 0 ? services : normalizeServiceList(DEFAULT_INDEPENDENT_SERVICES)
  };
};

/**
 * 独立服务领域 API 封装
 * 统一提供公开读、管理员配置读写和服务订单创建入口
 */
export class IndependentServicesService {
  private static readonly PUBLIC_BASE_PATH = '/public/independent-services';

  /**
   * 获取公开独立服务列表
   * GET /api/public/independent-services
   */
  static async getPublicServices(): Promise<IndependentServiceDTO[]> {
    try {
      const response = await apiClient.get<ApiResponse<IndependentServiceDTO[]>>(this.PUBLIC_BASE_PATH, {
        headers: { 'X-Skip-Auth-Logout': 'true' },
      } as unknown as { headers: Record<string, string> });

      const services = response.data.data;
      if (!Array.isArray(services)) {
        return normalizeServiceList(DEFAULT_INDEPENDENT_SERVICES).filter((service) => service.enabled !== false);
      }

      return normalizeServiceList(services).filter((service) => service.enabled !== false);
    } catch (error) {
      console.error('加载独立服务列表失败', error);
      return normalizeServiceList(DEFAULT_INDEPENDENT_SERVICES).filter((service) => service.enabled !== false);
    }
  }

  /**
   * 获取公开独立服务详情
   * GET /api/public/independent-services/{serviceCode}
   */
  static async getPublicServiceByCode(serviceCode: string): Promise<IndependentServiceDTO> {
    const normalizedCode = normalizeText(serviceCode, DEFAULT_INDEPENDENT_SERVICE.serviceCode).toUpperCase();
    try {
      const response = await apiClient.get<ApiResponse<IndependentServiceDTO>>(
        `${this.PUBLIC_BASE_PATH}/${normalizedCode}`,
        {
          headers: { 'X-Skip-Auth-Logout': 'true' },
        } as unknown as { headers: Record<string, string> }
      );
      return normalizeService(response.data.data);
    } catch (error) {
      console.error(`加载独立服务详情失败: ${normalizedCode}`, error);
      return normalizeService(DEFAULT_INDEPENDENT_SERVICE);
    }
  }

  /**
   * 获取管理员侧独立服务配置
   */
  static async getAdminIndependentServicesConfig(): Promise<IndependentServicesConfigData> {
    try {
      const config = await SystemConfigService.getIndependentServicesConfig();
      return normalizeConfigData(config.data as IndependentServicesConfigData | undefined);
    } catch (error) {
      console.error('加载独立服务系统配置失败', error);
      return normalizeConfigData(undefined);
    }
  }

  /**
   * 更新管理员侧独立服务配置
   */
  static async updateAdminIndependentServicesConfig(
    data: IndependentServicesConfigData
  ): Promise<IndependentServicesConfigData> {
    const config = await SystemConfigService.updateIndependentServicesConfig(data);
    return normalizeConfigData(config.data as IndependentServicesConfigData | undefined);
  }

  /**
   * 创建独立服务订单
   */
  static async createIndependentServiceOrder(
    request: CreateServiceOrderRequest
  ): Promise<OrderDTO> {
    return AdminOrderService.createServiceOrder(request);
  }
}
