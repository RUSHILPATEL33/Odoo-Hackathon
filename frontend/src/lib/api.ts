// Centralized API client for Traveloop backend

const API_BASE = "http://localhost:5000/api";

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }

  return res.json();
}

// --- Auth ---
export interface AuthResponse {
  token: string;
  user: { id: string; email: string; name: string | null };
}

export async function apiLogin(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(
  email: string,
  password: string,
  name: string
) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

// --- Trips ---
export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  activities: Activity[];
  expenses: Expense[];
}

export interface CreateTripPayload {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
}

export async function apiGetTrips() {
  return request<Trip[]>("/trips");
}

export async function apiCreateTrip(data: CreateTripPayload) {
  return request<Trip>("/trips", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiGetTrip(tripId: string) {
  return request<Trip>(`/trips/${tripId}`);
}

export async function apiTogglePublic(tripId: string, isPublic: boolean) {
  return request<Trip>(`/trips/${tripId}/public`, {
    method: "PATCH",
    body: JSON.stringify({ isPublic }),
  });
}

export async function apiGetPublicTrip(tripId: string) {
  return request<Trip>(`/trips/public/${tripId}`);
}

// --- Activities ---
export interface CreateActivityPayload {
  dayIndex: number;
  orderIndex: number;
  title: string;
  description?: string;
  cost?: number;
  type: string;
  time?: string;
}

export async function apiGetActivities(tripId: string) {
  return request<Activity[]>(`/trips/${tripId}/activities`);
}

export async function apiCreateActivity(tripId: string, data: CreateActivityPayload) {
  return request<Activity>(`/trips/${tripId}/activities`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiReorderActivities(
  tripId: string,
  items: { id: string; dayIndex: number; orderIndex: number }[]
) {
  return request<{ success: boolean }>(`/trips/${tripId}/activities/reorder`, {
    method: "PATCH",
    body: JSON.stringify(items),
  });
}

export async function apiDeleteActivity(activityId: string) {
  return request<{ success: boolean }>(`/activities/${activityId}`, {
    method: "DELETE",
  });
}

// --- Shared types ---
export interface Activity {
  id: string;
  tripId: string;
  dayIndex: number;
  orderIndex: number;
  title: string;
  description?: string;
  cost: number;
  type: string;
  time?: string;
}

export interface Expense {
  id: string;
  tripId: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
}

export interface CreateExpensePayload {
  category: string;
  amount: number;
  date: string;
  description?: string;
}

export async function apiGetExpenses(tripId: string) {
  return request<Expense[]>(`/trips/${tripId}/expenses`);
}

export async function apiCreateExpense(tripId: string, data: CreateExpensePayload) {
  return request<Expense>(`/trips/${tripId}/expenses`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiDeleteExpense(expenseId: string) {
  return request<{ success: boolean }>(`/expenses/${expenseId}`, {
    method: "DELETE",
  });
}
