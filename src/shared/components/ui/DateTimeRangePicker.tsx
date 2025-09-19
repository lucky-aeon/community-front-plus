import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, X } from 'lucide-react';
import { format, startOfDay, endOfDay, subDays, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import './DateTimeRangePicker.css';

export interface DateTimeRange {
  startTime?: string;
  endTime?: string;
}

interface PresetOption {
  label: string;
  value: () => DateTimeRange;
}

interface DateTimeRangePickerProps {
  value?: DateTimeRange;
  onChange: (range: DateTimeRange) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = ({
  value = {},
  onChange,
  label,
  placeholder = "选择时间范围",
  error,
  disabled = false,
  className = ''
}) => {
  // 将字符串转换为 Date 对象
  const parseDate = (dateString?: string): Date | null => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  // 将 Date 对象转换为 API 需要的字符串格式
  const formatToString = (date: Date): string => {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss");
  };

  const [startDate, setStartDate] = useState<Date | null>(parseDate(value.startTime));
  const [endDate, setEndDate] = useState<Date | null>(parseDate(value.endTime));
  const [isPresetOpen, setIsPresetOpen] = useState(false);

  // 预设选项
  const presetOptions: PresetOption[] = [
    {
      label: '今天',
      value: () => {
        const today = new Date();
        return {
          startTime: formatToString(startOfDay(today)),
          endTime: formatToString(endOfDay(today))
        };
      }
    },
    {
      label: '昨天',
      value: () => {
        const yesterday = subDays(new Date(), 1);
        return {
          startTime: formatToString(startOfDay(yesterday)),
          endTime: formatToString(endOfDay(yesterday))
        };
      }
    },
    {
      label: '最近7天',
      value: () => {
        const today = new Date();
        const sevenDaysAgo = subDays(today, 6);
        return {
          startTime: formatToString(startOfDay(sevenDaysAgo)),
          endTime: formatToString(endOfDay(today))
        };
      }
    },
    {
      label: '最近30天',
      value: () => {
        const today = new Date();
        const thirtyDaysAgo = subDays(today, 29);
        return {
          startTime: formatToString(startOfDay(thirtyDaysAgo)),
          endTime: formatToString(endOfDay(today))
        };
      }
    },
    {
      label: '最近3个月',
      value: () => {
        const today = new Date();
        const threeMonthsAgo = subMonths(today, 3);
        return {
          startTime: formatToString(startOfDay(threeMonthsAgo)),
          endTime: formatToString(endOfDay(today))
        };
      }
    }
  ];

  // 处理日期范围变化
  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    // 只有当两个日期都选择了才触发onChange
    if (start && end) {
      onChange({
        startTime: formatToString(start),
        endTime: formatToString(end)
      });
    }
  };

  // 处理预设选项点击
  const handlePresetClick = (preset: PresetOption) => {
    const range = preset.value();
    const start = parseDate(range.startTime);
    const end = parseDate(range.endTime);
    
    setStartDate(start);
    setEndDate(end);
    onChange(range);
    setIsPresetOpen(false);
  };

  // 清空选择
  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onChange({ startTime: undefined, endTime: undefined });
  };

  // 格式化显示文本
  const getDisplayText = () => {
    if (startDate && endDate) {
      const start = format(startDate, 'yyyy-MM-dd HH:mm', { locale: zhCN });
      const end = format(endDate, 'yyyy-MM-dd HH:mm', { locale: zhCN });
      return `${start} 至 ${end}`;
    } else if (startDate) {
      return `${format(startDate, 'yyyy-MM-dd HH:mm', { locale: zhCN })} 至 ...`;
    }
    return placeholder;
  };

  return (
    <div className={`date-time-range-picker ${className}`}>
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {/* 主输入区域 */}
        <div className="flex items-center space-x-2">
          {/* 日期范围选择器 */}
          <div className="flex-1 relative">
            <DatePicker
              selected={startDate}
              onChange={handleDateRangeChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText={placeholder}
              disabled={disabled}
              locale={zhCN}
              className={`
                w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-xl 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                transition-all duration-200 text-sm
                ${error ? 'border-red-500 focus:ring-red-500' : ''}
                ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
              `}
              wrapperClassName="w-full"
              popperClassName="date-picker-popper"
            />
            
            {/* 日历图标 */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Calendar className="h-5 w-5" />
            </div>

            {/* 清除按钮 */}
            {(startDate || endDate) && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* 快捷选项按钮 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPresetOpen(!isPresetOpen)}
              disabled={disabled}
              className={`
                px-3 py-3 border border-gray-300 rounded-xl text-sm font-medium
                transition-colors duration-200 whitespace-nowrap
                ${disabled 
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500'
                }
              `}
            >
              快捷选择
            </button>

            {/* 快捷选项下拉菜单 */}
            {isPresetOpen && !disabled && (
              <div className="absolute z-20 mt-1 right-0 w-32 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="py-1">
                  {presetOptions.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 点击外部关闭快捷选项 */}
        {isPresetOpen && (
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsPresetOpen(false)}
          />
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 选择提示文本 */}
      {startDate && endDate && (
        <div className="mt-2 text-sm text-gray-600">
          已选择: {getDisplayText()}
        </div>
      )}
    </div>
  );
};