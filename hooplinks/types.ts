
export enum SkillLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  ALL = 'All Levels'
}

export enum UserRole {
  PLAYER = 'PLAYER',
  ORGANIZER = 'ORGANIZER'
}

export interface Notification {
  id: string;
  userId: string;
  gameTitle: string;
  reason: string;
  timestamp: number;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface PlayerEntry {
  userId: string;
  name: string;
  phone?: string;
  joinedAt: number;
  status: 'confirmed' | 'waitlist';
}

export interface Game {
  id: string;
  title: string;
  organizerId: string;
  organizerName: string;
  date: string; // ISO string
  time: string;
  location: string;
  locationUrl?: string;
  maxPlayers: number;
  skillLevel: SkillLevel;
  notes: string;
  players: PlayerEntry[];
  isLocked: boolean;
  createdAt: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
