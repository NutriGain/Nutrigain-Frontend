import { greeting, initials, parseIsoDate, shortDate, timeAgo, todayDayOfWeek } from './format';

describe('format helpers', () => {
  it('parses an ISO date as a local date without shifting the day', () => {
    const d = parseIsoDate('2026-01-05');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(5);
  });

  it('formats short dates in Spanish without a trailing dot', () => {
    expect(shortDate('2026-11-04')).toMatch(/^04 nov$/);
  });

  it('maps JavaScript weekdays to DayOfWeek', () => {
    expect(todayDayOfWeek(new Date(2026, 10, 2))).toBe('MONDAY');
    expect(todayDayOfWeek(new Date(2026, 10, 8))).toBe('SUNDAY');
  });

  it('greets according to the hour', () => {
    expect(greeting(new Date(2026, 0, 1, 8))).toBe('Buenos días');
    expect(greeting(new Date(2026, 0, 1, 15))).toBe('Buenas tardes');
    expect(greeting(new Date(2026, 0, 1, 22))).toBe('Buenas noches');
  });

  it('builds initials from the first two words', () => {
    expect(initials('Camila Rojas Pérez')).toBe('CR');
    expect(initials('nico')).toBe('N');
  });

  it('describes elapsed time', () => {
    const now = new Date('2026-11-04T12:00:00Z');
    expect(timeAgo('2026-11-04T11:59:40Z', now)).toBe('ahora');
    expect(timeAgo('2026-11-04T11:30:00Z', now)).toBe('hace 30 min');
    expect(timeAgo('2026-11-04T09:00:00Z', now)).toBe('hace 3 h');
    expect(timeAgo('2026-11-02T12:00:00Z', now)).toBe('hace 2 d');
  });
});
