import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AppNotification, Avatar, Badge, BodyWeight, Challenge, ChallengeAssignment, ChallengeCategory, Competitor,
  HealthSummary, ManualPlan, Meal, MealType, MotivationalMessage, NutritionPlan, RoutineDay, Streak,
  UpdateProfileRequest, WeeklyProgress
} from './models';

/** Typed access to the NutriGain backend. The user is always the authenticated one (JWT), never a parameter. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Fitness
  getRoutines(): Observable<RoutineDay[]> {
    return this.http.get<RoutineDay[]>(`${this.base}/me/routines`);
  }

  completeWorkout(routineDayId: number): Observable<WeeklyProgress> {
    return this.http.post<WeeklyProgress>(`${this.base}/me/routines/${routineDayId}/completions`, {});
  }

  getProgressHistory(): Observable<WeeklyProgress[]> {
    return this.http.get<WeeklyProgress[]>(`${this.base}/me/progress`);
  }

  getCurrentProgress(): Observable<WeeklyProgress> {
    return this.http.get<WeeklyProgress>(`${this.base}/me/progress/current`);
  }

  getBodyWeights(): Observable<BodyWeight[]> {
    return this.http.get<BodyWeight[]>(`${this.base}/me/body-weights`);
  }

  registerBodyWeight(weightKg: number): Observable<BodyWeight> {
    return this.http.post<BodyWeight>(`${this.base}/me/body-weights`, { weightKg });
  }

  // Nutrition
  getMeals(type?: MealType): Observable<Meal[]> {
    const params = type ? new HttpParams().set('type', type) : undefined;
    return this.http.get<Meal[]>(`${this.base}/meals`, { params });
  }

  getMeal(id: number): Observable<Meal> {
    return this.http.get<Meal>(`${this.base}/meals/${id}`);
  }

  getNutritionPlan(): Observable<NutritionPlan> {
    return this.http.get<NutritionPlan>(`${this.base}/me/nutrition-plan`);
  }

  getManualPlan(): Observable<ManualPlan> {
    return this.http.get<ManualPlan>(`${this.base}/me/manual-plan`);
  }

  addManualMeal(mealId: number): Observable<ManualPlan> {
    return this.http.put<ManualPlan>(`${this.base}/me/manual-plan/meals/${mealId}`, {});
  }

  removeManualMeal(mealId: number): Observable<ManualPlan> {
    return this.http.delete<ManualPlan>(`${this.base}/me/manual-plan/meals/${mealId}`);
  }

  // Gamification
  getAvatar(): Observable<Avatar> {
    return this.http.get<Avatar>(`${this.base}/me/avatar`);
  }

  getStreak(): Observable<Streak> {
    return this.http.get<Streak>(`${this.base}/me/streak`);
  }

  getRandomMessage(): Observable<MotivationalMessage> {
    return this.http.get<MotivationalMessage>(`${this.base}/motivational-messages/random`);
  }

  getChallengeCatalog(category?: ChallengeCategory): Observable<Challenge[]> {
    const params = category ? new HttpParams().set('category', category) : undefined;
    return this.http.get<Challenge[]>(`${this.base}/challenges`, { params });
  }

  getMyChallenges(): Observable<ChallengeAssignment[]> {
    return this.http.get<ChallengeAssignment[]>(`${this.base}/me/challenges`);
  }

  drawChallenge(category: ChallengeCategory | null): Observable<ChallengeAssignment> {
    const params = category ? new HttpParams().set('category', category) : undefined;
    return this.http.post<ChallengeAssignment>(`${this.base}/me/challenges/draw`, {}, { params });
  }

  requestDailyExtreme(): Observable<ChallengeAssignment> {
    return this.http.post<ChallengeAssignment>(`${this.base}/me/challenges/daily-extreme`, {});
  }

  completeChallenge(assignmentId: number): Observable<ChallengeAssignment> {
    return this.http.post<ChallengeAssignment>(`${this.base}/me/challenges/${assignmentId}/complete`, {});
  }

  // Profile
  getProfile(): Observable<HealthSummary> {
    return this.http.get<HealthSummary>(`${this.base}/me/profile`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<HealthSummary> {
    return this.http.put<HealthSummary>(`${this.base}/me/profile`, request);
  }

  // Achievements
  getBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${this.base}/me/badges`);
  }

  // Notifications
  getNotifications(unseenOnly = false): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.base}/me/notifications`, {
      params: new HttpParams().set('unseenOnly', unseenOnly)
    });
  }

  getUnseenCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/me/notifications/unseen-count`);
  }

  markAllNotificationsSeen(): Observable<void> {
    return this.http.post<void>(`${this.base}/me/notifications/seen-all`, {});
  }

  // Social
  getGlobalLeaderboard(limit = 20): Observable<Competitor[]> {
    return this.http.get<Competitor[]>(`${this.base}/social/leaderboard`, {
      params: new HttpParams().set('limit', limit)
    });
  }

  getFriendsLeaderboard(): Observable<Competitor[]> {
    return this.http.get<Competitor[]>(`${this.base}/me/social/leaderboard`);
  }

  searchUsers(name: string): Observable<Competitor[]> {
    return this.http.get<Competitor[]>(`${this.base}/social/users`, { params: new HttpParams().set('name', name) });
  }

  follow(userId: number): Observable<void> {
    return this.http.put<void>(`${this.base}/me/following/${userId}`, {});
  }

  unfollow(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/me/following/${userId}`);
  }
}
