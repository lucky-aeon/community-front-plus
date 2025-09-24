import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@shared/utils/cn';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export interface DateRangePickerProps {
  value?: { from?: Date; to?: Date } | undefined;
  onChange?: (value: { from?: Date; to?: Date } | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * 基于 shadcn 组件（Popover + Calendar）的日期范围选择器。
 * - 单控件选择起止日期，内部不包含时间选择；
 * - 如需时间粒度，可在外层叠加 Select/TimePicker（仍使用 shadcn 组件）。
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder = '选择时间范围',
  disabled,
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<{ from?: Date; to?: Date } | undefined>(value);

  React.useEffect(() => setRange(value), [value?.from?.getTime?.(), value?.to?.getTime?.()]);

  const displayText = React.useMemo(() => {
    if (range?.from && range?.to) {
      return `${format(range.from, 'yyyy年MM月dd日', { locale: zhCN })} - ${format(range.to, 'yyyy年MM月dd日', { locale: zhCN })}`;
    }
    if (range?.from) {
      return `${format(range.from, 'yyyy年MM月dd日', { locale: zhCN })} -`;
    }
    return placeholder;
  }, [range, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !range?.from && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={range?.from ?? new Date()}
          selected={range}
          onSelect={(r) => {
            setRange(r ?? undefined);
            onChange?.(r ?? undefined);
          }}
          numberOfMonths={2}
          locale={zhCN}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
