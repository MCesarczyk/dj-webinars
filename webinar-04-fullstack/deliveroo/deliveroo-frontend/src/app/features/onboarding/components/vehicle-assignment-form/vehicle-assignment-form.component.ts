import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { EmployeeOnboardingService } from '../employee-onboarding/employee-onboarding.service';
import { LoggerService } from '../../services/logger.service';
import { Vehicle } from '../../interfaces/employee.interface';
import { Subject, takeUntil } from 'rxjs';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicle-assignment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Loading State -->
    @if (isLoading()) {
      <div class="text-center py-12">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <svg role="img" data-testid="loading-spinner" class="animate-spin w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        </div>
        <p class="text-gray-600 font-medium">Loading available vehicles...</p>
      </div>
    }

    <!-- Error Message -->
    @if (errorMessage()) {
      <div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
        <svg class="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"/>
        </svg>
        <div class="flex-1">
          <p class="text-red-800 font-medium">{{ errorMessage() }}</p>
          <button type="button" (click)="onboardingService.clearMessages()"
                  class="mt-2 text-red-600 hover:text-red-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Dismiss
          </button>
        </div>
      </div>
    }

    <!-- Form -->
    @if (!isLoading()) {
      <form [formGroup]="onboardingService.vehicleAssignmentForm" (ngSubmit)="onSubmit()" novalidate>
        <div class="space-y-6">
          <div class="border-b border-gray-200 pb-4">
            <h3 class="text-lg font-medium text-gray-900 flex items-center">
              <svg class="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Vehicle Assignment
            </h3>
            <p class="mt-1 text-sm text-gray-600">Assign a vehicle to this driver.</p>
          </div>

          <!-- Vehicle Selection -->
          <div>
            <label for="vehicleSelect" class="block text-sm font-medium text-gray-700 mb-2">
              Select Vehicle <span class="text-red-500">*</span>
            </label>
            <select
              id="vehicleSelect"
              formControlName="vehicle_id"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              [class.border-red-300]="isFieldInvalid('vehicle_id')"
              [class.border-green-300]="isFieldValid('vehicle_id')"
            >
              <option value="">Choose a vehicle</option>
              @for (vehicle of availableVehicles(); track vehicle.id) {
                <option [value]="vehicle.id">
                  {{ vehicle.type | titlecase }} - {{ vehicle.licensePlate }}
                </option>
              }
            </select>
            @if (isFieldInvalid('vehicle_id')) {
              <div class="mt-1 text-sm text-red-600">
                {{ getFieldError('vehicle_id') }}
              </div>
            }
          </div>

          <!-- Selected Vehicle Details -->
          @if (onboardingService.selectedVehicle()) {
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="text-sm font-medium text-blue-900 flex items-center mb-3">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"/>
                </svg>
                Selected Vehicle Details
              </h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium text-gray-700">Type:</span>
                  <span class="ml-2 text-gray-900">{{ onboardingService.selectedVehicle()!.type | titlecase }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700">License Plate:</span>
                  <span class="ml-2 text-gray-900">{{ onboardingService.selectedVehicle()!.licensePlate }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Status:</span>
                  <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {{ onboardingService.selectedVehicle()!.status | titlecase }}
                  </span>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Last Maintenance:</span>
                  <span class="ml-2 text-gray-900">{{ onboardingService.selectedVehicle()!.lastMaintenance | date:'short' }}</span>
                </div>
              </div>
            </div>
          }

          <!-- Assignment Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="sinceDate" class="block text-sm font-medium text-gray-700 mb-2">
                Assignment Start Date <span class="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="sinceDate"
                formControlName="since_date"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                [class.border-red-300]="isFieldInvalid('since_date')"
                [class.border-green-300]="isFieldValid('since_date')"
              />
              @if (isFieldInvalid('since_date')) {
                <div class="mt-1 text-sm text-red-600">
                  {{ getFieldError('since_date') }}
                </div>
              }
            </div>

            <div>
              <label for="plannedLeaveDate" class="block text-sm font-medium text-gray-700 mb-2">
                Planned Leave Date <span class="text-gray-400">(Optional)</span>
              </label>
              <input
                type="date"
                id="plannedLeaveDate"
                formControlName="planned_leave_date"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <!-- Last Inspection Date -->
          <div>
            <label for="lastInspectionDate" class="block text-sm font-medium text-gray-700 mb-2">
              Last Inspection Date <span class="text-gray-400">(Optional)</span>
            </label>
            <input
              type="date"
              id="lastInspectionDate"
              formControlName="last_inspection_date"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          <!-- Usage Notes -->
          <div>
            <label for="usageNotes" class="block text-sm font-medium text-gray-700 mb-2">
              Usage Notes <span class="text-gray-400">(Optional)</span>
            </label>
            <textarea
              id="usageNotes"
              formControlName="usage_notes"
              rows="3"
              placeholder="Special instructions, restrictions, or notes about vehicle usage..."
              maxlength="500"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none"
            ></textarea>
            <p class="mt-1 text-xs text-gray-500">Maximum 500 characters</p>
          </div>

          <!-- Primary Assignment Checkbox -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="isPrimary"
                formControlName="is_primary"
                type="checkbox"
                class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="isPrimary" class="font-medium text-gray-700">
                Primary vehicle assignment
              </label>
              <p class="text-gray-500">This will be the employee's main vehicle for daily operations.</p>
            </div>
          </div>
        </div>
      </form>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})

export class VehicleAssignmentFormComponent {
  onboardingService = inject(EmployeeOnboardingService);
  vehicleService = inject(VehicleService);
  loggerService = inject(LoggerService);
  fb = inject(FormBuilder);

  private destroy$ = new Subject<void>();

  isLoading = signal(false);
  isSubmitting = signal(false);
  showSuccessMessage = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  availableVehicles = signal<Vehicle[]>([]);

  ngOnInit(): void {
    this.initializeForm();
    this.loadAvailableVehicles();
    this.loggerService.info('🚗 VehicleAssignmentFormComponent: Component initialized');
    this.onboardingService.vehicleAssignmentForm.controls['vehicle_id'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(vehicleId => {
        this.handleVehicleSelection(typeof vehicleId === 'string' ? parseInt(vehicleId) : vehicleId);
        this.onboardingService.setIsVehicleAssignmentValid(this.onboardingService.vehicleAssignmentForm.valid);
      });
  }

  ngOnDestroy(): void {
    this.destroy();
    this.loggerService.info('🔄 VehicleAssignmentFormComponent: Component destroyed');
  }

  onSubmit(): void {
    this.loggerService.info('🚗 Vehicle assignment form submitted');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.onboardingService.vehicleAssignmentForm.controls[fieldName];
    return !!(field && field.invalid && field.touched);
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.onboardingService.vehicleAssignmentForm.controls[fieldName];
    return !!(field && field.valid && field.touched);
  }

  getFieldError(fieldName: string): string {
    return this.onboardingService.getFieldError(this.onboardingService.vehicleAssignmentForm, fieldName);
  }

  private initializeForm(): void {
    this.loggerService.info('🔧 VehicleAssignmentFormComponent: Initializing form...');

    this.onboardingService.vehicleAssignmentForm = this.fb.group({
      vehicle_id: ['', Validators.required],
      since_date: ['', Validators.required],
      planned_leave_date: [''],
      usage_notes: ['', Validators.maxLength(500)],
      is_primary: [true],
      last_inspection_date: ['']
    });

    this.setupFormValidation();
    this.loggerService.info('✅ VehicleAssignmentFormComponent: Form initialized successfully');
  }

  private setupFormValidation(): void {
    this.loggerService.info('🔧 VehicleAssignmentFormComponent: Setting up form validation...');

    this.onboardingService.vehicleAssignmentForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.onboardingService.setIsVehicleAssignmentValid(this.onboardingService.vehicleAssignmentForm.valid);
      });

    const today = new Date().toISOString().split('T')[0];
    this.onboardingService.vehicleAssignmentForm.patchValue({ since_date: today });
  }

  loadAvailableVehicles(): void {
    this.loggerService.info('🔄 VehicleAssignmentFormComponent: Loading available vehicles...');
    this.isLoading.set(true);

    this.vehicleService.getAvailableVehicles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.availableVehicles.set(response.data);
            this.loggerService.info('✅ Available vehicles loaded:', response.data);
          } else {
            this.loggerService.error('❌ Failed to load vehicles:', response.message);
            this.showError('Failed to load available vehicles');
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          this.loggerService.error('❌ Error loading vehicles:', error);
          this.showError('Error loading available vehicles');
          this.isLoading.set(false);
        }
      });
  }

  private handleVehicleSelection(vehicleId: number): void {
    if (vehicleId) {
      const vehicle = this.availableVehicles().find(v => v.id === vehicleId) || null;
      this.onboardingService.setSelectedVehicle(vehicle);
      this.loggerService.info('🚗 Vehicle selected:', vehicle);
    } else {
      this.onboardingService.setSelectedVehicle(null);
      this.loggerService.info('🚗 No vehicle selected');
    }
  }

  showError(message: string): void {
    this.errorMessage.set(message);
    this.showSuccessMessage.set(false);
    this.successMessage.set('');
    this.loggerService.error('❌ Error message displayed:', message);
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
