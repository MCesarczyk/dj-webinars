import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';
import { LoggerService } from './logger.service';
import {
  EmployeeFormData,
  VehicleAssignmentFormData,
} from '../interfaces/employee.interface';
import { provideHttpClient } from '@angular/common/http';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;
  let loggerService: LoggerService;

  const loggerSpy = {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockEmployeeData: EmployeeFormData = {
    name: 'John Doe',
    role: 'driver',
    status: 'active',
    email: 'john.doe@test.com',
    hire_date: '2024-01-15'
  };

  const mockVehicleAssignmentData: VehicleAssignmentFormData = {
    vehicle_id: 1,
    since_date: '2024-01-15',
    is_primary: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        EmployeeService,
        { provide: LoggerService, useValue: loggerSpy }]
    });
    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
    loggerService = TestBed.inject(LoggerService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('completeOnboarding', () => {
    it('should complete onboarding with employee and vehicle assignment', (done) => {
      service.completeOnboarding(mockEmployeeData, mockVehicleAssignmentData).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data?.employee).toBeDefined();
        expect(response.data?.vehicleAssignment).toBeDefined();
        expect(response.data?.employee.name).toBe(mockEmployeeData.name);
        expect(response.data?.vehicleAssignment?.vehicle_id).toBe(mockVehicleAssignmentData.vehicle_id);
        expect(response.message).toBe('Employee onboarding completed successfully');
        done();
      });
    });

    it('should complete onboarding with employee only (no vehicle)', (done) => {
      service.completeOnboarding(mockEmployeeData).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data?.employee).toBeDefined();
        expect(response.data?.vehicleAssignment).toBeUndefined();
        expect(response.data?.employee.name).toBe(mockEmployeeData.name);
        done();
      });
    });

    it('should log the onboarding process', (done) => {
      service.completeOnboarding(mockEmployeeData, mockVehicleAssignmentData).subscribe(() => {
        expect(loggerService.info).toHaveBeenCalledWith(
          '🚀 EmployeeService: Starting complete onboarding process...'
        );
        expect(loggerService.info).toHaveBeenCalledWith(
          '📋 Employee Data:',
          mockEmployeeData
        );
        expect(loggerService.info).toHaveBeenCalledWith(
          '🚗 Vehicle Assignment Data:',
          mockVehicleAssignmentData
        );
        done();
      });
    });
  });

  describe('checkEmailUniqueness', () => {
    it('should return true for unique email', (done) => {
      const uniqueEmail = 'unique@test.com';

      service.checkEmailUniqueness(uniqueEmail).subscribe(isUnique => {
        expect(isUnique).toBe(true);
        done();
      });
    });

    it('should return false for taken email', (done) => {
      const takenEmail = 'john.doe@company.com';

      service.checkEmailUniqueness(takenEmail).subscribe(isUnique => {
        expect(isUnique).toBe(false);
        done();
      });
    });

    it('should be case insensitive', (done) => {
      const takenEmail = 'JOHN.DOE@COMPANY.COM';

      service.checkEmailUniqueness(takenEmail).subscribe(isUnique => {
        expect(isUnique).toBe(false);
        done();
      });
    });

    it('should log the email checking process', (done) => {
      const email = 'test@example.com';

      service.checkEmailUniqueness(email).subscribe(() => {
        expect(loggerService.info).toHaveBeenCalledWith(
          '🔄 EmployeeService: Checking email uniqueness for:',
          email
        );
        expect(loggerService.info).toHaveBeenCalledWith(
          expect.stringMatching('✅ EmployeeService: Email uniqueness check result:'),
          expect.any(Object)
        );
        done();
      });
    });
  });
});
