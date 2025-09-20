import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Input } from '@/components/ui/input';

export interface DateTimeRangePickerProps {
  value: [Date | null, Date | null];
  onChange: (value: [Date | null, Date | null]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showTimeSelect?: boolean;
}

/**
 * 统一的日期时间范围选择器（单控件完成起止选择）
 * - 基于 react-datepicker 的 selectsRange
 * - 默认启用时间选择（可关闭）
 */
export const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = ({
  value,
  onChange,
  placeholder = '选择时间范围',
  disabled,
  className,
  showTimeSelect = true,
}) => {
  const [start, end] = value;

  return (
    <ReactDatePicker
      selectsRange
      startDate={start}
      endDate={end}
      onChange={(dates) => onChange(dates as [Date | null, Date | null])}
      disabled={disabled}
      placeholderText={placeholder}
      customInput={<Input readOnly className={className} />}
      showTimeSelect={showTimeSelect}
      timeIntervals={15}
      dateFormat={showTimeSelect ? 'yyyy/MM/dd HH:mm' : 'yyyy/MM/dd'}
      isClearable
    />
  );
};

export default DateTimeRangePicker;

