
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
  password?: string; // In real app, never store plain password on client
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
  staffInCharge: string; // Name or ID
  status: 'ok' | 'issue' | 'check';
  notes: string;
}

export interface Person {
  id: string;
  name: string;
  type: 'student' | 'staff';
  role?: string; // For staff (e.g. Guide, Logistics)
  email?: string;
  phone?: string; // For staff
  roomNumber?: number; // For students
  busId?: number; // 1, 2, etc.
  isOnBus?: boolean; // Legacy field, mostly replaced by AttendanceRecord
}

export interface ResponsibilityGroup {
  id: string;
  name: string; // "Group 1", "Team A"
  staffId: string; // ID of the staff member in charge
  studentIds: string[]; // IDs of students in this group
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
  assignedTo: string; // Staff ID or Name
  status: TaskStatus;
  dueDate: string;
  category: string;
  createdBy: string;
  completedAt?: number; // Timestamp when marked done
}

// --- NEW ATTENDANCE TYPES ---

export type AttendanceStatus = 'present' | 'absent' | 'none';

export interface AttendanceSession {
  id: string;
  title: string;
  day: string; // For grouping
  order: number;
}

export interface AttendanceRecord {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  note: string;
  timestamp: number;
}
