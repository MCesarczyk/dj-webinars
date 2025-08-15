import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { EmployeeOnboardingService } from '../employee-onboarding/employee-onboarding.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-employee-information-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="onboardingService.employeeForm" (ngSubmit)="onSubmit()" novalidate>
      <div class="space-y-6">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-medium text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Employee Information
          </h3>
          <p class="mt-1 text-sm text-gray-600">Basic information about the new employee.</p>
        </div>

        <!-- Employee Name -->
        <div>
          <label for="employeeName" class="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="employeeName"
            formControlName="name"
            placeholder="Enter full name"
            maxlength="100"
            class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            [class.border-red-300]="isFieldInvalid('name')"
            [class.border-green-300]="isFieldValid('name')"
          />
          <div *ngIf="isFieldInvalid('name')" class="mt-1 text-sm text-red-600">
            {{ getFieldError('name') }}
          </div>
          <p class="mt-1 text-xs text-gray-500">Maximum 100 characters</p>
        </div>

        <!-- Employee Role -->
        <div>
          <label for="employeeRole" class="block text-sm font-medium text-gray-700 mb-2">
            Role <span class="text-red-500">*</span>
          </label>
          <select
            id="employeeRole"
            formControlName="role"
            class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            [class.border-red-300]="isFieldInvalid('role')"
            [class.border-green-300]="isFieldValid('role')"
          >
            <option value="">Select a role</option>
            @for (role of onboardingService.employeeRoles; track role) {
              <option [value]="role">{{ role | titlecase }}</option>
            }
          </select>
          @if (isFieldInvalid('role')) {
            <div class="mt-1 text-sm text-red-600">
              {{ getFieldError('role') }}
            </div>
          }
        </div>

        <!-- Employee Status -->
        <div>
          <label for="employeeStatus" class="block text-sm font-medium text-gray-700 mb-2">
            Status <span class="text-red-500">*</span>
          </label>
          <select
            id="employeeStatus"
            formControlName="status"
            class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            [class.border-red-300]="isFieldInvalid('status')"
            [class.border-green-300]="isFieldValid('status')"
          >
          @for (status of onboardingService.employeeStatuses; track status) {
            <option [value]="status">{{ status | titlecase }}</option>
          }
          </select>
          @if (isFieldInvalid('status')) {
            <div class="mt-1 text-sm text-red-600">
              {{ getFieldError('status') }}
            </div>
          }
        </div>

        <!-- Employee Email -->
        <div>
          <label for="employeeEmail" class="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
              </svg>
            </div>
            <input
              type="email"
              id="employeeEmail"
              formControlName="email"
              placeholder="employee@company.com"
              class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              [class.border-red-300]="isFieldInvalid('email')"
              [class.border-green-300]="isFieldValid('email')"
            />
            @if (onboardingService.isEmailChecking()) {
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg role="img" class="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </div>
            }
          </div>
          @if (isFieldInvalid('email')) {
            <div class="mt-1 text-sm text-red-600">
              {{ getFieldError('email') }}
            </div>
          }
          @if (onboardingService.emailValidationMessage()) {
            <div class="mt-1 text-sm"
                [class.text-green-600]="!onboardingService.employeeForm.controls['email'].hasError('emailTaken')"
                [class.text-red-600]="onboardingService.employeeForm.controls['email'].hasError('emailTaken')">
              {{ onboardingService.emailValidationMessage() }}
            </div>
          }
        </div>

        <!-- Hire Date -->
        <div>
          <label for="hireDate" class="block text-sm font-medium text-gray-700 mb-2">
            Hire Date <span class="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="hireDate"
            formControlName="hire_date"
            class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            [class.border-red-300]="isFieldInvalid('hire_date')"
            [class.border-green-300]="isFieldValid('hire_date')"
          />
          @if (isFieldInvalid('hire_date')) {
            <div class="mt-1 text-sm text-red-600">
              {{ getFieldError('hire_date') }}
            </div>
          }
        </div>
      </div>
    </form>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})

export class EmployeeInformationFormComponent {
  onboardingService = inject(EmployeeOnboardingService);
  loggerService = inject(LoggerService);

  onSubmit(): void {
    this.loggerService.info('📋 Employee form submitted');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.onboardingService.employeeForm.controls[fieldName];
    return !!(field && field.invalid && field.touched);
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.onboardingService.employeeForm.controls[fieldName];
    return !!(field && field.valid && field.touched);
  }

  getFieldError(fieldName: string): string {
    return this.onboardingService.getFieldError(this.onboardingService.employeeForm, fieldName);
  }
}
