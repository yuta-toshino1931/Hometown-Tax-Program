import type { KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';

const ALLOWED_CONTROL_KEYS = new Set([
  'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Home', 'End',
]);

export function handleNumericKeyDown(e: KeyboardEvent<HTMLInputElement>) {
  if (ALLOWED_CONTROL_KEYS.has(e.key)) return;
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key)) return;
  if (!/^\d$/.test(e.key)) {
    e.preventDefault();
  }
}

export function handleNumericPaste(e: ClipboardEvent<HTMLInputElement>) {
  const pasted = e.clipboardData.getData('text');
  if (!/^\d+$/.test(pasted)) {
    e.preventDefault();
  }
}

export function parseNumericValue(e: ChangeEvent<HTMLInputElement>): number {
  const raw = e.target.value.replace(/\D/g, '');
  return raw === '' ? 0 : Number(raw);
}
