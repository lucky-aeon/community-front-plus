import { useEffect } from 'react';

export const APP_NAME = '敲鸭';

export function formatTitle(title?: string) {
  if (!title || title.trim() === '') return APP_NAME;
  return `${title}-${APP_NAME}`;
}

export function setDocumentTitle(title?: string) {
  if (typeof document !== 'undefined') {
    document.title = formatTitle(title);
  }
}

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    setDocumentTitle(title);
  }, [title]);
}
