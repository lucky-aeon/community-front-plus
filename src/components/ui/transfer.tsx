import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface TransferItem {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface TransferProps {
  dataSource: TransferItem[];
  targetKeys: string[];
  onChange: (next: string[]) => void;
  titles?: [string, string];
  height?: number;
  className?: string;
  searchable?: boolean;
}

export const Transfer: React.FC<TransferProps> = ({
  dataSource,
  targetKeys,
  onChange,
  titles = ['可选项', '已选项'],
  height = 360,
  className,
  searchable = true,
}) => {
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');
  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);

  const targetSet = useMemo(() => new Set(targetKeys), [targetKeys]);
  const sourceAll = useMemo(() => dataSource.filter(i => !targetSet.has(i.key)), [dataSource, targetSet]);
  const targetAll = useMemo(() => dataSource.filter(i => targetSet.has(i.key)), [dataSource, targetSet]);

  const left = useMemo(
    () => sourceAll.filter(i => i.label.toLowerCase().includes(leftSearch.toLowerCase())),
    [sourceAll, leftSearch]
  );
  const right = useMemo(
    () => targetAll.filter(i => i.label.toLowerCase().includes(rightSearch.toLowerCase())),
    [targetAll, rightSearch]
  );

  const moveRight = () => {
    const add = leftSelected.filter(k => !targetSet.has(k));
    onChange([...targetKeys, ...add]);
    setLeftSelected([]);
  };
  const moveLeft = () => {
    onChange(targetKeys.filter(k => !rightSelected.includes(k)));
    setRightSelected([]);
  };
  const moveAllRight = () => {
    const keys = left.filter(i => !i.disabled).map(i => i.key);
    onChange([...targetKeys, ...keys.filter(k => !targetSet.has(k))]);
    setLeftSelected([]);
  };
  const moveAllLeft = () => {
    const keys = right.filter(i => !i.disabled).map(i => i.key);
    onChange(targetKeys.filter(k => !keys.includes(k)));
    setRightSelected([]);
  };

  const renderList = (
    items: TransferItem[],
    selected: string[],
    setSelected: (v: string[]) => void,
    search: string,
    setSearch: (v: string) => void,
    title: string
  ) => (
    <Card className="w-full">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">{selected.length}/{items.length}</span>
        </div>
        {searchable && (
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索" />
        )}
      </div>
      <ScrollArea className="w-full" style={{ height }}>
        <div className="divide-y">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">暂无数据</div>
          ) : items.map(it => {
            const checked = selected.includes(it.key);
            const disabled = !!it.disabled;
            return (
              <div
                key={it.key}
                className={cn(
                  'flex items-center gap-3 p-3 cursor-pointer hover:bg-accent',
                  checked && 'bg-accent',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => {
                  if (disabled) return;
                  setSelected(checked ? selected.filter(k => k !== it.key) : [...selected, it.key]);
                }}
              >
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => {
                    if (disabled) return;
                    setSelected(checked ? selected.filter(k => k !== it.key) : [...selected, it.key]);
                  }}
                />
                <span className="truncate">{it.label}</span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );

  return (
    <div className={cn('flex items-start gap-4', className)}>
      <div className="flex-1">
        {renderList(left, leftSelected, setLeftSelected, leftSearch, setLeftSearch, titles[0])}
      </div>
      <div className="flex flex-col gap-2 pt-12">
        <Button variant="secondary" onClick={moveRight} disabled={leftSelected.length === 0}>右移所选</Button>
        <Button variant="secondary" onClick={moveAllRight} disabled={left.filter(i=>!i.disabled).length === 0}>全部右移</Button>
        <Separator className="my-1" />
        <Button variant="secondary" onClick={moveAllLeft} disabled={right.filter(i=>!i.disabled).length === 0}>全部左移</Button>
        <Button variant="secondary" onClick={moveLeft} disabled={rightSelected.length === 0}>左移所选</Button>
      </div>
      <div className="flex-1">
        {renderList(right, rightSelected, setRightSelected, rightSearch, setRightSearch, titles[1])}
      </div>
    </div>
  );
};

export default Transfer;

