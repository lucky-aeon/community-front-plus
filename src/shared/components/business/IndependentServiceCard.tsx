import React from 'react';
import { Check, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { IndependentServiceDTO } from '@shared/types';
import { cn } from '@shared/utils/cn';

interface IndependentServiceCardProps {
  service: IndependentServiceDTO;
  onCtaClick: () => void;
  className?: string;
}

const formatServicePriceUnit = (priceUnit: string) => {
  const normalized = priceUnit.trim();
  if (normalized === '/h') {
    return '元 / 小时';
  }
  return normalized;
};

export const IndependentServiceCard: React.FC<IndependentServiceCardProps> = ({
  service,
  onCtaClick,
  className
}) => {
  const priceUnit = formatServicePriceUnit(service.priceUnit);

  return (
    <Card
      className={cn(
        'relative flex h-full flex-col overflow-hidden border-emerald-200/70 bg-gradient-to-br from-white via-white to-emerald-50/60 shadow-lg shadow-emerald-950/5',
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

      <div className="flex flex-1 flex-col p-8 pt-9">
        <div className="mb-6 inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <MessageSquare className="h-3.5 w-3.5" />
          独立服务
        </div>

        <div className="mb-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{service.summary}</p>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold tracking-tight text-gray-900">¥{service.price}</span>
            <span className="pb-1 text-sm font-medium text-gray-500">{priceUnit}</span>
          </div>
        </div>

        <ul className="mb-8 space-y-3 flex-1">
          {service.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-3 text-sm text-gray-700">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>

        <Button
          type="button"
          onClick={onCtaClick}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700"
        >
          {service.ctaText}
        </Button>
      </div>
    </Card>
  );
};
