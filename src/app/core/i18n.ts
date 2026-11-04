import { ChallengeCategory, DayOfWeek, Difficulty, MealType, Mood } from './models';

/** Spanish labels for the enums the backend returns. */

const DAYS: Record<DayOfWeek, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo'
};

export const MEAL_TYPES: { code: MealType; label: string; icon: string }[] = [
  { code: 'BREAKFAST', label: 'Desayuno', icon: '🌅' },
  { code: 'LUNCH', label: 'Almuerzo', icon: '☀️' },
  { code: 'DINNER', label: 'Cena', icon: '🌙' },
  { code: 'SNACK', label: 'Snack', icon: '🍎' }
];

const DIFFICULTIES: Record<Difficulty, string> = {
  EASY: 'Fácil',
  MEDIUM: 'Medio',
  HARD: 'Difícil',
  EXTREME: 'Extremo'
};

export const CATEGORIES: { code: ChallengeCategory | null; label: string }[] = [
  { code: null, label: 'Todos' },
  { code: 'EXERCISE', label: 'Ejercicio' },
  { code: 'NUTRITION', label: 'Nutrición' },
  { code: 'MINDFULNESS', label: 'Mindfulness' },
  { code: 'PRODUCTIVITY', label: 'Productividad' }
];

const MOODS: Record<Mood, string> = {
  MOTIVATED: 'Motivado',
  ENERGETIC: 'Enérgico'
};

export const dayEs = (day: DayOfWeek): string => DAYS[day] ?? day;
export const mealTypeEs = (type: MealType): string => MEAL_TYPES.find(t => t.code === type)?.label ?? type;
export const mealTypeIcon = (type: MealType): string => MEAL_TYPES.find(t => t.code === type)?.icon ?? '🍽️';
export const difficultyEs = (d: Difficulty): string => DIFFICULTIES[d] ?? d;
export const categoryEs = (c: ChallengeCategory): string => CATEGORIES.find(x => x.code === c)?.label ?? c;
export const moodEs = (m: Mood): string => MOODS[m] ?? m;

/** Today as YYYY-MM-DD in the browser's local time zone. */
export const todayIso = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
