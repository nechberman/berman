export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  password?: string;
}

export interface CampEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  locationName: string;
  wazeLink?: string;
}

export interface Room {
  id: string;
  roomNumber: number;
  students: string[];
  staffInCharge: string;
  status: 'ok' | 'issue' | 'check';
  notes: string;
}

export interface Person {
  id: string;
  name: string;
  type: 'student' | 'staff';
  role?: string;
  email?: string;
  phone?: string;
  roomNumber?: number;
  busId?: number;
  isOnBus?: boolean;
}

export interface ResponsibilityGroup {
  id: string;
  name: string;
  staffId: string;
  studentIds: string[];
}

export interface Place {
  id: string;
  name: string;
  contactName1: string;
  contactPhone1: string;
  contactName2?: string;
  contactPhone2?: string;
  paymentMethod: 'cash' | 'check' | 'transfer' | 'other';
  paymentStatus: 'paid' | 'unpaid';
  notes: string;
}

export enum TaskStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: TaskStatus;
  dueDate: string;
  category: string;
  createdBy: string;
  completedAt?: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'none';

export interface AttendanceSession {
  id: string;
  title: string;
  day: string;
  order: number;
}

export interface AttendanceRecord {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  note: string;
  timestamp: number;
}