export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  fitnessPathId: number;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  age: number;
  fitnessPathId: number;
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
}

export interface RoutineDay {
  id: number;
  dayOfWeek: DayOfWeek;
  exercises: Exercise[];
}

export interface WeeklyProgress {
  weekStart: string;
  plannedWorkouts: number;
  completedWorkouts: number;
  completionPercentage: number;
  targetWeightKg: number | null;
  completedRoutineDayIds: number[];
}

export interface BodyWeight {
  id: number;
  recordedOn: string;
  weightKg: number;
}

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface Meal {
  id: number;
  name: string;
  mealType: MealType;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  imageUrl: string;
}

export interface PlannedMeal {
  mealType: MealType;
  meal: Meal;
}

export interface PlanDay {
  dayOfWeek: DayOfWeek;
  meals: PlannedMeal[];
}

export interface NutritionPlan {
  focus: string;
  days: PlanDay[];
}

export interface Macros {
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
}

export interface ManualPlan {
  meals: Meal[];
  totals: Macros;
}

export type Mood = 'MOTIVATED' | 'ENERGETIC';

export interface Avatar {
  id: number;
  characterName: string;
  imageUrl: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  mood: Mood;
}

export interface Streak {
  currentDays: number;
  longestDays: number;
  lastActivityDate: string | null;
}

export type ChallengeCategory = 'EXERCISE' | 'NUTRITION' | 'MINDFULNESS' | 'PRODUCTIVITY';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME';

export interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: ChallengeCategory;
  xpReward: number;
}

export interface ChallengeAssignment {
  id: number;
  kind: 'RANDOM' | 'DAILY_EXTREME';
  status: 'PENDING' | 'COMPLETED';
  assignedOn: string;
  completedOn: string | null;
  xpReward: number;
  challenge: Challenge;
}

export interface MotivationalMessage {
  id: number;
  text: string;
}

export interface HealthSummary {
  heightCm: number | null;
  sex: 'MALE' | 'FEMALE' | null;
  activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | null;
  weightKg: number | null;
  bmi: number | null;
  bmiCategory: 'UNDERWEIGHT' | 'NORMAL' | 'OVERWEIGHT' | 'OBESE' | null;
  dailyCalorieTarget: number | null;
}

export interface UpdateProfileRequest {
  heightCm: number;
  sex: 'MALE' | 'FEMALE';
  activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE';
}

export interface Badge {
  code: string;
  title: string;
  description: string;
  unlocked: boolean;
  awardedOn: string | null;
}

export interface AppNotification {
  id: number;
  type: 'WELCOME' | 'BADGE_AWARDED' | 'CHALLENGE_COMPLETED' | 'LEVEL_UP';
  title: string;
  message: string;
  seen: boolean;
  createdAt: string;
}

export interface Competitor {
  rank: number | null;
  userId: number;
  displayName: string;
  level: number;
  experience: number;
  currentStreak: number;
  following: boolean;
  me: boolean;
}

export interface FitnessPath {
  id: number;
  code: string;
  name: string;
  description: string;
  imageUrl: string | null;
}
