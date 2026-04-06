import type {
  IndependentServiceDTO,
  IndependentServicesConfigData
} from '@shared/types';

export const MOCK_INTERVIEW_SERVICE_CODE = 'MOCK_INTERVIEW';

export const DEFAULT_INDEPENDENT_SERVICE: IndependentServiceDTO = {
  serviceCode: MOCK_INTERVIEW_SERVICE_CODE,
  enabled: true,
  visibleInHome: true,
  sortOrder: 0,
  title: '模拟面试',
  price: '150',
  priceUnit: '/h',
  summary: '一对一模拟面试，先微信沟通后安排具体时间',
  description: '围绕目标岗位做真实模拟，先微信沟通需求，再按双方确认的时间安排一对一模拟面试。',
  highlights: [
    '一对一模拟面试',
    '微信沟通后安排时间',
    '按目标岗位定制追问'
  ],
  ctaText: '加微信咨询',
  wechatNumber: '微信号待配置',
  wechatTip: '先微信沟通，具体安排以实际确认结果为准',
  serviceProcess: [
    '先微信沟通需求',
    '确认岗位方向与模拟范围',
    '安排模拟面试并给出反馈'
  ],
  targetUsers: [
    '准备跳槽的开发者',
    '希望提前演练面试的人'
  ],
  topics: [
    '项目经历追问',
    '技术栈深挖',
    '简历与表达节奏'
  ],
  notes: [
    '人工沟通服务',
    '先微信沟通',
    '具体安排以沟通结果为准',
    '不承诺固定成果或结果'
  ]
};

export const DEFAULT_INDEPENDENT_SERVICES: IndependentServiceDTO[] = [DEFAULT_INDEPENDENT_SERVICE];

export const DEFAULT_INDEPENDENT_SERVICES_CONFIG: IndependentServicesConfigData = {
  services: DEFAULT_INDEPENDENT_SERVICES
};
