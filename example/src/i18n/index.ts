// DevLingo i18n helper
import { TEXT } from './constants';

export function t(key: keyof typeof TEXT): string {
  // In a real app, you would use the current locale
  // For now, return English text
  return TEXT[key] as string;
}

export function setLocale(locale: string): void {
  // TODO: Implement locale switching
  console.log(`Locale set to: ${locale}`);
}
