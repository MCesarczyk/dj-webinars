import { Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Subject, debounceTime, finalize, takeUntil } from 'rxjs';

import { EmployeeService } from '../../services/employee.service';
import {
  EmployeeRole,
  EmployeeStatus,
  Vehicle,
  EmployeeFormData,
  VehicleAssignmentFormData,
  OnboardingResponse
} from '../../interfaces/employee.interface';
import { LoggerService } from '../../services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeOnboardingService {
  private destroy$ = new Subject<void>();

  isLoading = signal(false);
  isSubmitting = signal(false);
  showSuccessMessage = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  selectedVehicle = signal<Vehicle | null>(null);
  isEmailChecking = signal(false);
  emailValidationMessage = signal('');
  isDriverRole = signal<boolean>(false);
  isEmployeeFormValid = signal<boolean>(false);
  isVehicleAssignmentValid = signal<boolean>(true);

  setIsDriverRole(value: boolean): void {
    this.isDriverRole.set(value);
  }

  setIsEmployeeFormValid(value: boolean): void {
    this.isEmployeeFormValid.set(value);
  }

  setIsVehicleAssignmentValid(value: boolean): void {
    this.isVehicleAssignmentValid.set(value);
  }

  setSelectedVehicle(vehicle: Vehicle | null): void {
    this.selectedVehicle.set(vehicle);
  }

  employeeForm!: FormGroup;
  vehicleAssignmentForm!: FormGroup;

  readonly employeeRoles: EmployeeRole[] = ['driver', 'dispatcher', 'manager'];
  readonly employeeStatuses: EmployeeStatus[] = ['active', 'on leave', 'inactive'];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private logger: LoggerService
  ) {
    this.initializeForms();
    this.employeeForm.statusChanges.subscribe(_ => {
      this.setIsDriverRole(this.employeeForm?.controls?.['role']?.value === 'driver');
      this.setIsEmployeeFormValid(this.employeeForm?.valid || false);
      this.setIsVehicleAssignmentValid(this.isDriverRole() ? this.vehicleAssignmentForm?.valid || false : true);
    })
    this.vehicleAssignmentForm.statusChanges.subscribe(_ => {
      this.setIsVehicleAssignmentValid(this.isDriverRole() ? this.vehicleAssignmentForm?.valid || false : true);
    });
  }

  private initializeForms(): void {
    this.logger.info('🔧 EmployeeOnboardingService: Initializing forms...');

    // Employee form with comprehensive validation
    this.employeeForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z\s\-'\.]+$/)
      ]],
      role: ['', Validators.required],
      status: ['active', Validators.required],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ], [this.emailUniqueValidator.bind(this)]],
      hire_date: ['', [Validators.required, this.dateValidator]]
    });

    // Vehicle assignment form
    this.vehicleAssignmentForm = this.fb.group({
      vehicle_id: ['', Validators.required],
      since_date: ['', Validators.required],
      planned_leave_date: [''],
      usage_notes: ['', Validators.maxLength(500)],
      is_primary: [true],
      last_inspection_date: ['']
    });

    this.setupFormValidation();
    this.logger.info('✅ EmployeeOnboardingService: Forms initialized successfully');
  }

  private setupFormValidation(): void {
    this.logger.info('🔧 EmployeeOnboardingService: Setting up form validation...');

    this.employeeForm.controls['role'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(role => {
        this.logger.info('📋 Role changed to:', role);
        this.handleRoleChange(role);
      });

    const today = new Date().toISOString().split('T')[0];
    this.employeeForm.patchValue({ hire_date: today });
    this.vehicleAssignmentForm.patchValue({ since_date: today });
  }

  private handleRoleChange(role: EmployeeRole): void {
    const isDriver = role === 'driver';
    this.logger.info('🔄 Handling role change:', { role, isDriver });

    if (isDriver) {
      this.vehicleAssignmentForm.enable();
      this.logger.info('✅ Vehicle assignment enabled for driver');
    } else {
      this.vehicleAssignmentForm.disable();
      this.vehicleAssignmentForm.reset();
      this.selectedVehicle.set(null);
      this.logger.info('✅ Vehicle assignment disabled for non-driver role');
    }
  }

  private dateValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) return null;

    const date = new Date(control.value);
    const today = new Date();

    if (date > today) {
      return { futureDate: true };
    }

    return null;
  }

  private emailUniqueValidator(control: AbstractControl): Promise<{ [key: string]: any } | null> {
    if (!control.value) {
      return Promise.resolve(null);
    }

    this.isEmailChecking.set(true);
    this.emailValidationMessage.set('Checking email availability...');

    return new Promise<{ [key: string]: any } | null>((resolve) => {
      this.employeeService.checkEmailUniqueness(control.value)
        .pipe(
          debounceTime(500),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (isUnique) => {
            this.isEmailChecking.set(false);
            if (isUnique) {
              this.emailValidationMessage.set('Email is available');
              resolve(null);
            } else {
              this.emailValidationMessage.set('Email is already taken');
              resolve({ emailTaken: true });
            }
          },
          error: () => {
            this.isEmailChecking.set(false);
            this.emailValidationMessage.set('Error checking email');
            resolve({ emailTaken: true });
          }
        });
    });
  }

  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.controls[fieldName];
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;

    if (errors['required']) return `${fieldName} is required`;
    if (errors['maxlength']) return `${fieldName} is too long (max ${errors['maxlength'].requiredLength} characters)`;
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['pattern']) return `${fieldName} contains invalid characters`;
    if (errors['futureDate']) return 'Date cannot be in the future';
    if (errors['emailTaken']) return 'This email is already registered';

    return 'Invalid input';
  }

  submitOnboarding(): void {
    this.logger.info('🚀 EmployeeOnboardingService: Form submission started');

    if (!this.isEmployeeFormValid() || (this.isDriverRole() && !this.isVehicleAssignmentValid())) {
      this.logger.warn('⚠️ Form is invalid, marking all fields as touched');
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.clearMessages();

    // Prepare employee data
    const employeeData: EmployeeFormData = {
      name: this.employeeForm.controls['name'].value.trim(),
      role: this.employeeForm.controls['role'].value,
      status: this.employeeForm.controls['status'].value,
      email: this.employeeForm.controls['email'].value.toLowerCase().trim(),
      hire_date: this.employeeForm.controls['hire_date'].value
    };

    // Prepare vehicle assignment data (if applicable)
    let vehicleAssignmentData: VehicleAssignmentFormData | undefined;
    if (this.isDriverRole() && this.vehicleAssignmentForm.valid) {
      vehicleAssignmentData = {
        vehicle_id: parseInt(this.vehicleAssignmentForm.controls['vehicle_id'].value),
        since_date: this.vehicleAssignmentForm.controls['since_date'].value,
        planned_leave_date: this.vehicleAssignmentForm.controls['planned_leave_date'].value || undefined,
        usage_notes: this.vehicleAssignmentForm.controls['usage_notes'].value?.trim() || '',
        is_primary: this.vehicleAssignmentForm.controls['is_primary'].value,
        last_inspection_date: this.vehicleAssignmentForm.controls['last_inspection_date'].value || undefined
      };
    }

    // Submit onboarding data
    this.employeeService.completeOnboarding(employeeData, vehicleAssignmentData)
      .pipe(takeUntil(this.destroy$),
        finalize(() => {
          this.isSubmitting.set(false);
        }))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.logger.info('✅ Onboarding completed successfully:', response);
            this.handleSubmissionSuccess(response.data);
          }
        },
        error: (error) => {
          this.logger.error('❌ Onboarding failed:', error);
          this.handleSubmissionError(error);
        }
      });
  }

  private handleSubmissionSuccess(data: OnboardingResponse): void {
    this.logger.info('🎉 Onboarding success handler called with:', data);

    let message = `Employee ${data.employee.name} has been successfully onboarded!`;

    if (data.vehicleAssignment) {
      message += ` Vehicle ${this.selectedVehicle()?.licensePlate} has been assigned.`;
    }

    this.showSuccess(message);

    setTimeout(() => {
      this.resetForms();
    }, 3000);
  }

  private handleSubmissionError(error: any): void {
    this.logger.error('💥 Onboarding error handler called with:', error);

    let message = 'An error occurred during onboarding. Please try again.';

    if (error.error?.message) {
      message = error.error.message;
    } else if (error.message) {
      message = error.message;
    }

    this.showError(message);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.employeeForm.controls).forEach(key => {
      this.employeeForm.controls[key].markAsTouched();
    });

    if (this.isDriverRole()) {
      Object.keys(this.vehicleAssignmentForm.controls).forEach(key => {
        this.vehicleAssignmentForm.controls[key].markAsTouched();
      });
    }
  }

  resetForms(): void {
    this.logger.info('🔄 Resetting forms to initial state');

    this.employeeForm.reset();
    this.vehicleAssignmentForm.reset();

    // Reset to default values
    const today = new Date().toISOString().split('T')[0];
    this.employeeForm.patchValue({
      status: 'active',
      hire_date: today
    });
    this.vehicleAssignmentForm.patchValue({
      is_primary: true,
      since_date: today
    });

    this.selectedVehicle.set(null);
    this.clearMessages();
  }

  private showSuccess(message: string): void {
    this.successMessage.set(message);
    this.showSuccessMessage.set(true);
    this.errorMessage.set('');
    this.logger.info('✅ Success message displayed:', message);
  }

  showError(message: string): void {
    this.errorMessage.set(message);
    this.showSuccessMessage.set(false);
    this.successMessage.set('');
    this.logger.error('❌ Error message displayed:', message);
  }

  clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
    this.showSuccessMessage.set(false);
  }

  cancelOnboarding(): void {
    this.logger.info('❌ Onboarding cancelled by user');
    this.resetForms();
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
