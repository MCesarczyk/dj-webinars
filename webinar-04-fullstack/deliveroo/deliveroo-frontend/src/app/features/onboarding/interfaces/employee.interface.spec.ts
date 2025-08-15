import {
  Employee,
  Vehicle,
  VehicleAssignment,
  EmployeeFormData,
  VehicleAssignmentFormData,
  ApiResponse,
  OnboardingResponse
} from './employee.interface';

describe('Employee Interfaces', () => {
  describe('Employee Interface', () => {
    it('should create a valid employee object', () => {
      const employee: Employee = {
        id: 1,
        name: 'John Doe',
        role: 'driver',
        status: 'active',
        email: 'john.doe@test.com',
        hire_date: '2024-01-15',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      };

      expect(employee.id).toBe(1);
      expect(employee.name).toBe('John Doe');
      expect(employee.role).toBe('driver');
      expect(employee.status).toBe('active');
      expect(employee.email).toBe('john.doe@test.com');
    });

    it('should allow optional id field', () => {
      const employee: Employee = {
        name: 'Jane Smith',
        role: 'dispatcher',
        status: 'active',
        email: 'jane.smith@test.com',
        hire_date: '2024-01-15'
      };

      expect(employee.id).toBeUndefined();
      expect(employee.name).toBe('Jane Smith');
    });
  });

  describe('Vehicle Interface', () => {
    it('should create a valid vehicle object', () => {
      const vehicle: Vehicle = {
        id: 1,
        type: 'truck',
        licensePlate: 'ABC-123',
        status: 'available',
        lastMaintenance: '2024-01-10',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z'
      };

      expect(vehicle.type).toBe('truck');
      expect(vehicle.licensePlate).toBe('ABC-123');
      expect(vehicle.status).toBe('available');
    });
  });

  describe('VehicleAssignment Interface', () => {
    it('should create a valid vehicle assignment object', () => {
      const assignment: VehicleAssignment = {
        id: 1,
        employee_id: 1,
        vehicle_id: 1,
        since_date: '2024-01-15',
        is_primary: true,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      };

      expect(assignment.employee_id).toBe(1);
      expect(assignment.vehicle_id).toBe(1);
      expect(assignment.is_primary).toBe(true);
    });
  });

  describe('Form Data Interfaces', () => {
    it('should create valid employee form data', () => {
      const formData: EmployeeFormData = {
        name: 'John Doe',
        role: 'driver',
        status: 'active',
        email: 'john.doe@test.com',
        hire_date: '2024-01-15'
      };

      expect(formData.name).toBe('John Doe');
      expect(formData.role).toBe('driver');
    });

    it('should create valid vehicle assignment form data', () => {
      const formData: VehicleAssignmentFormData = {
        vehicle_id: 1,
        since_date: '2024-01-15',
        is_primary: true
      };

      expect(formData.vehicle_id).toBe(1);
      expect(formData.is_primary).toBe(true);
    });
  });

  describe('API Response Interface', () => {
    it('should create valid success response', () => {
      const response: ApiResponse<Employee> = {
        success: true,
        data: {
          id: 1,
          name: 'John Doe',
          role: 'driver',
          status: 'active',
          email: 'john.doe@test.com',
          hire_date: '2024-01-15'
        },
        message: 'Success'
      };

      expect(response.success).toBe(true);
      expect(response.data?.name).toBe('John Doe');
    });

    it('should create valid error response', () => {
      const response: ApiResponse<Employee> = {
        success: false,
        error: 'Something went wrong'
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe('Something went wrong');
    });
  });

  describe('OnboardingResponse Interface', () => {
    it('should create valid onboarding response', () => {
      const response: OnboardingResponse = {
        employee: {
          id: 1,
          name: 'John Doe',
          role: 'driver',
          status: 'active',
          email: 'john.doe@test.com',
          hire_date: '2024-01-15'
        },
        vehicleAssignment: {
          id: 1,
          employee_id: 1,
          vehicle_id: 1,
          since_date: '2024-01-15',
          is_primary: true
        }
      };

      expect(response.employee.name).toBe('John Doe');
      expect(response.vehicleAssignment?.vehicle_id).toBe(1);
    });
  });
});