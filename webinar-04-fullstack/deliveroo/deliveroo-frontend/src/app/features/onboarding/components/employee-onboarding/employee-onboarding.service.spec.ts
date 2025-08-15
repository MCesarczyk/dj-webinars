import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { delay, of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { EmployeeOnboardingService } from './employee-onboarding.service';
import { EmployeeService } from '../../services/employee.service';
import { LoggerService } from '../../services/logger.service';
import { VehicleService } from '../../services/vehicle.service';

describe('EmployeeOnboardingService', () => {
  let service: EmployeeOnboardingService;
  let mockEmployeeService: jest.Mocked<EmployeeService>;
  let mockVehicleService: jest.Mocked<VehicleService>;
  let loggerService: LoggerService;

  const loggerSpy = {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockVehicles = [
    {
      id: 1,
      type: 'truck' as const,
      licensePlate: 'ABC-123',
      status: 'available' as const,
      lastMaintenanceDate: '2024-01-10',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 2,
      type: 'van' as const,
      licensePlate: 'DEF-456',
      status: 'available' as const,
      lastMaintenanceDate: '2024-01-05',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z'
    }
  ];

  const mockEmployeeFormData = {
    name: 'John Doe',
    role: 'driver' as const,
    status: 'active' as const,
    email: 'john.doe@test.com',
    hire_date: '2024-01-15'
  };

  const mockVehicleAssignmentData = {
    vehicle_id: 1,
    since_date: '2024-01-15',
    is_primary: true
  };

  beforeEach(() => {
    const employeeServiceMock = {
      createEmployee: jest.fn(),
      completeOnboarding: jest.fn(),
      checkEmailUniqueness: jest.fn(),
      isSubmitting: signal(false),
    } as Partial<jest.Mocked<EmployeeService>>;

    const vehicleServiceMock = {
      getAvailableVehicles: jest.fn(),
    } as Partial<jest.Mocked<VehicleService>>;

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        EmployeeOnboardingService,
        FormBuilder,
        { provide: EmployeeService, useValue: employeeServiceMock },
        { provide: VehicleService, useValue: vehicleServiceMock },
        { provide: LoggerService, useValue: loggerSpy }
      ]
    });

    service = TestBed.inject(EmployeeOnboardingService);
    mockEmployeeService = TestBed.inject(EmployeeService) as jest.Mocked<EmployeeService>;
    mockVehicleService = TestBed.inject(VehicleService) as jest.Mocked<VehicleService>;
    loggerService = TestBed.inject(LoggerService);
    mockVehicleService.getAvailableVehicles.mockReturnValue(
      of({ success: true, data: mockVehicles, message: 'Success' })
    );
    mockEmployeeService.checkEmailUniqueness.mockReturnValue(of(true));
    mockEmployeeService.completeOnboarding.mockReturnValue(
      of({
        success: true,
        data: {
          employee: { ...mockEmployeeFormData, id: 1 },
          vehicleAssignment: { ...mockVehicleAssignmentData, id: 1, employee_id: 1 }
        },
        message: 'Success'
      })
    );

    jest.clearAllMocks();
  });

  afterEach(() => {
    service.destroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize employee form with correct validators', () => {
      expect(service.employeeForm).toBeDefined();
      expect(service.employeeForm.controls['name']).toBeDefined();
      expect(service.employeeForm.controls['role']).toBeDefined();
      expect(service.employeeForm.controls['status']).toBeDefined();
      expect(service.employeeForm.controls['email']).toBeDefined();
      expect(service.employeeForm.controls['hire_date']).toBeDefined();
    });

    it('should initialize vehicle assignment form with correct validators', () => {
      expect(service.vehicleAssignmentForm).toBeDefined();
      expect(service.vehicleAssignmentForm.controls['vehicle_id']).toBeDefined();
      expect(service.vehicleAssignmentForm.controls['since_date']).toBeDefined();
      expect(service.vehicleAssignmentForm.controls['is_primary']).toBeDefined();
    });

    it('should set default values', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(service.employeeForm.controls['status'].value).toBe('active');
      expect(service.employeeForm.controls['hire_date'].value).toBe(today);
      expect(service.vehicleAssignmentForm.controls['is_primary'].value).toBe(true);
      expect(service.vehicleAssignmentForm.controls['since_date'].value).toBe(today);
    });
  });

  describe('Signals', () => {
    it('should initialize signals with correct default values', () => {
      expect(service.isLoading()).toBe(false);
      expect(service.isSubmitting()).toBe(false);
      expect(service.showSuccessMessage()).toBe(false);
      expect(service.errorMessage()).toBe('');
      expect(service.successMessage()).toBe('');
      expect(service.selectedVehicle()).toBe(null);
      expect(service.isEmailChecking()).toBe(false);
      expect(service.emailValidationMessage()).toBe('');
      expect(service.isDriverRole()).toBe(false);
      expect(service.isEmployeeFormValid()).toBe(false);
      expect(service.isVehicleAssignmentValid()).toBe(true);
    });

    it('should update isDriverRole when role changes', () => {
      service.employeeForm.patchValue({ role: 'driver' });
      expect(service.isDriverRole()).toBe(true);

      service.employeeForm.patchValue({ role: 'dispatcher' });
      expect(service.isDriverRole()).toBe(false);
    });

    it('should update form validity signals', fakeAsync(() => {
      // Given
      expect(service.isEmployeeFormValid()).toBe(false);

      // When
      service.employeeForm.patchValue({
        name: 'John Doe',
        role: 'driver' as const,
        status: 'active' as const,
        email: 'john@test.com',
        hire_date: '2024-01-15'
      });

      tick();

      // Then
      expect(service.isEmployeeFormValid()).toBe(true);
    }));
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      const nameControl = service.employeeForm.controls['name'];
      nameControl.markAsTouched();

      expect(service.getFieldError(service.employeeForm, 'name')).toBe('name is required');
    });

    it('should validate email format', () => {
      const emailControl = service.employeeForm.controls['email'];
      emailControl.setValue('invalid-email');
      emailControl.markAsTouched();

      expect(service.getFieldError(service.employeeForm, 'email')).toBe('Please enter a valid email address');
    });

    it('should validate name pattern', () => {
      const nameControl = service.employeeForm.controls['name'];
      nameControl.setValue('John123');
      nameControl.markAsTouched();

      expect(service.getFieldError(service.employeeForm, 'name')).toBe('name contains invalid characters');
    });

    it('should validate maximum length', () => {
      const nameControl = service.employeeForm.controls['name'];
      nameControl.setValue('a'.repeat(101));
      nameControl.markAsTouched();

      expect(service.getFieldError(service.employeeForm, 'name')).toBe('name is too long (max 100 characters)');
    });
  });

  describe('Role Change Handling', () => {
    it('should enable vehicle assignment for driver role', () => {
      service.employeeForm.patchValue({ role: 'driver' });

      expect(service.vehicleAssignmentForm.enabled).toBe(true);
      expect(service.isDriverRole()).toBe(true);
    });

    it('should disable vehicle assignment for non-driver roles', () => {
      service.employeeForm.patchValue({ role: 'dispatcher' });

      expect(service.vehicleAssignmentForm.disabled).toBe(true);
      expect(service.isDriverRole()).toBe(false);
      expect(service.selectedVehicle()).toBe(null);
    });
  });

  describe('Email Validation', () => {
    it('should check email uniqueness', async () => {
      const emailControl = service.employeeForm.controls['email'];
      emailControl.setValue('test@example.com');

      await new Promise(resolve => setTimeout(resolve, 600));

      expect(mockEmployeeService.checkEmailUniqueness).toHaveBeenCalledWith('test@example.com');
      expect(service.emailValidationMessage()).toBe('Email is available');
    });

    it('should handle taken email', async () => {
      mockEmployeeService.checkEmailUniqueness.mockReturnValue(of(false));

      const emailControl = service.employeeForm.controls['email'];
      emailControl.setValue('taken@example.com');

      await new Promise(resolve => setTimeout(resolve, 600));

      expect(service.emailValidationMessage()).toBe('Email is already taken');
      expect(emailControl.hasError('emailTaken')).toBe(true);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      service.employeeForm.patchValue({
        name: 'John Doe',
        role: 'driver',
        status: 'active',
        email: 'john@test.com',
        hire_date: '2024-01-15'
      });
      service.vehicleAssignmentForm.patchValue({
        vehicle_id: 1,
        since_date: '2024-01-15',
        is_primary: true
      });
    });

    it('should submit onboarding successfully', () => {
      service.submitOnboarding();

      expect(service.isSubmitting()).toBe(false);
      expect(mockEmployeeService.completeOnboarding).toHaveBeenCalled();
      expect(loggerSpy.info).toHaveBeenCalledWith(
        '🚀 EmployeeOnboardingService: Form submission started'
      );
    });

    it('should not submit invalid form', () => {
      service.employeeForm.patchValue({ name: '' });

      service.submitOnboarding();

      expect(loggerSpy.warn).toHaveBeenCalledWith(
        '⚠️ Form is invalid, marking all fields as touched'
      );
      expect(mockEmployeeService.completeOnboarding).not.toHaveBeenCalled();
    });

    it('should handle submission error', fakeAsync(() => {
      mockEmployeeService.completeOnboarding.mockReturnValue(
        throwError(() => new Error('An error occurred during onboarding. Please try again.')).pipe(delay(0))
      );

      tick(1);
      const showErrorSpy = jest.spyOn(service, 'showError');
      service.submitOnboarding();

      expect(service.isSubmitting()).toBe(false);
      expect(showErrorSpy).toHaveBeenCalledWith(
        'An error occurred during onboarding. Please try again.'
      );
    }));

    it('should reset forms after successful submission', (done) => {
      service.submitOnboarding();

      setTimeout(() => {
        expect(service.employeeForm.pristine).toBe(true);
        expect(service.vehicleAssignmentForm.pristine).toBe(true);
        done();
      }, 3100);
    });
  });

  describe('Message Handling', () => {
    it('should show success message', () => {
      const message = 'Success!';
      service['showSuccess'](message);

      expect(service.successMessage()).toBe(message);
      expect(service.showSuccessMessage()).toBe(true);
      expect(service.errorMessage()).toBe('');
    });

    it('should show error message', () => {
      const message = 'Error!';
      service.showError(message);

      expect(service.errorMessage()).toBe(message);
      expect(service.showSuccessMessage()).toBe(false);
      expect(service.successMessage()).toBe('');
    });

    it('should clear messages', () => {
      service.showError('Error');
      service.clearMessages();

      expect(service.errorMessage()).toBe('');
      expect(service.successMessage()).toBe('');
      expect(service.showSuccessMessage()).toBe(false);
    });
  });

  describe('Form Reset', () => {
    it('should reset forms to initial state', () => {
      service.employeeForm.patchValue({
        name: 'John Doe',
        role: 'driver',
        email: 'john@test.com'
      });

      service.resetForms();

      expect(service.employeeForm.controls['name'].value).toBe(null);
      expect(service.employeeForm.controls['status'].value).toBe('active');
      expect(service.selectedVehicle()).toBe(null);
    });

    it('should clear messages when resetting', () => {
      service.showError('Test error');
      service.resetForms();

      expect(service.errorMessage()).toBe('');
      expect(service.successMessage()).toBe('');
    });
  });

  describe('Cancel Onboarding', () => {
    it('should reset forms when cancelled', () => {
      const resetFormsSpy = jest.spyOn(service, 'resetForms');
      service.cancelOnboarding();

      expect(resetFormsSpy).toHaveBeenCalled();
    });
  });

  describe('Constants', () => {
    it('should have correct employee roles', () => {
      expect(service.employeeRoles).toEqual(['driver', 'dispatcher', 'manager']);
    });

    it('should have correct employee statuses', () => {
      expect(service.employeeStatuses).toEqual(['active', 'on leave', 'inactive']);
    });
  });
});
