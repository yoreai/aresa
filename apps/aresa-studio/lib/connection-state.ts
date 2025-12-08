// Shared connection state using localStorage
// This allows the selected connection to persist across pages

const STORAGE_KEY = 'aresa-selected-connection';

export function getSelectedConnection(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setSelectedConnection(connection: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, connection);
}

export function clearSelectedConnection(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

