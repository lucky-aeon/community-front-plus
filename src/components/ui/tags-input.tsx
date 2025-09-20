import React, { KeyboardEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export const TagsInput: React.FC<TagsInputProps> = ({ value, onChange, placeholder = '输入标签，回车或逗号添加', maxTags }) => {
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    if (maxTags && value.length >= maxTags) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
    setDraft('');
  };

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(draft);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
        />
        <Button variant="secondary" type="button" onClick={() => add(draft)}>添加</Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((t, i) => (
            <Badge key={`${t}-${i}`} variant="secondary" className="px-2 py-1">
              <span className="mr-2">{t}</span>
              <button type="button" aria-label="移除标签" onClick={() => remove(i)}>
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsInput;

