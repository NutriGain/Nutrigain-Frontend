import { DayOfWeek } from './models';

export const WEEK_DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export const DAY_SHORT: Record<DayOfWeek, string> = {
  MONDAY: 'Lun', TUESDAY: 'Mar', WEDNESDAY: 'Mié', THURSDAY: 'Jue', FRIDAY: 'Vie', SATURDAY: 'Sáb', SUNDAY: 'Dom'
};

/** Parses YYYY-MM-DD as a local date (new Date('2026-01-05') would be read as UTC and can shift a day). */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function shortDate(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString('es', { day: '2-digit', month: 'short' }).replace('.', '');
}

export function todayDayOfWeek(now: Date = new Date()): DayOfWeek {
  const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[now.getDay()];
}

export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

export function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');
}

export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) { return 'ahora'; }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) { return `hace ${minutes} min`; }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) { return `hace ${hours} h`; }
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}
