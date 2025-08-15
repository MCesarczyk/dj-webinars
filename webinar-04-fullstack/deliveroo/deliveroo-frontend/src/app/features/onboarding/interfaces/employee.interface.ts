// TypeScript interfaces matching the database schema for type safety

export interface Employee {
  id?: number;
  name: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  email: string;
  hire_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  id?: number;
  type: VehicleType;
  licensePlate: string;
  status: VehicleStatus;
  lastMaintenance?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleAssignment {
  id?: number;
  employee_id: number;
  vehicle_id: number;
  since_date: string;
  planned_leave_date?: string;
  usage_notes?: string;
  is_primary: boolean;
  last_inspection_date?: string;
  created_at?: string;
  updated_at?: string;
}

// Enums matching database schema
export type EmployeeRole = 'driver' | 'dispatcher' | 'manager';
export type EmployeeStatus = 'active' | 'on leave' | 'inactive';
export type VehicleType = 'truck' | 'van' | 'car' | 'motorcycle';
export type VehicleStatus = 'available' | 'in use' | 'maintenance' | 'out of service';

// Form data interfaces
export interface EmployeeFormData {
  name: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  email: string;
  hire_date: string;
}

export interface VehicleAssignmentFormData {
  vehicle_id: number;
  since_date: string;
  planned_leave_date?: string;
  usage_notes?: string;
  is_primary: boolean;
  last_inspection_date?: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface OnboardingResponse {
  employee: Employee;
  vehicleAssignment?: VehicleAssignment;
}