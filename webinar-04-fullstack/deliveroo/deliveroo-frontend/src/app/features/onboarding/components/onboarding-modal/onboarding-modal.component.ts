import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeOnboardingService } from '../employee-onboarding/employee-onboarding.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-onboarding-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" (click)="(this.hideOnboarding()?.())">
    <div class="bg-gray-50 py-8" (click)="$event.stopPropagation()">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-xl shadow-soft overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center">
              <svg role="img" class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
              Employee Onboarding
            </h2>
          </div>

          <!-- Content -->
          <div class="p-6">
            <!-- Loading State -->
            @if (onboardingService.isLoading()) {
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

            <!-- Success Message -->
            @if (onboardingService.showSuccessMessage()) {
              <div class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <svg class="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"/>
                </svg>
                <div class="flex-1">
                  <p class="text-green-800 font-medium">{{ onboardingService.successMessage() }}</p>
                  <button type="button" (click)="onboardingService.clearMessages()"
                          class="mt-2 text-green-600 hover:text-green-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Dismiss
                  </button>
                </div>
              </div>
            }

            <!-- Error Message -->
            @if (onboardingService.errorMessage()) {
              <div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <svg class="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd"/>
                </svg>
                <div class="flex-1">
                  <p class="text-red-800 font-medium">{{ onboardingService.errorMessage() }}</p>
                  <button type="button" (click)="onboardingService.clearMessages()"
                          class="mt-2 text-red-600 hover:text-red-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Dismiss
                  </button>
                </div>
              </div>
            }

            <!-- Forms -->
            @if (!onboardingService.isLoading() && !onboardingService.successMessage()) {
              <div class="space-y-8">
              <ng-content></ng-content>
                <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  @if (isFirstPage()) {
                    <button
                      type="button"
                      (click)="onCancel()"
                      [disabled]="onboardingService.isSubmitting()"
                      class="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Cancel
                    </button>
                  } @else {
                    <button
                      type="button"
                      (click)="onboardingService.decreasePage()"
                      [disabled]="onboardingService.isSubmitting()"
                      class="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Back
                    </button>
                  }
                  @if (isLastPage()) {
                    <button
                      type="button"
                      (click)="onSubmit()"
                      [disabled]="!ableToSend()"
                      class="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      <svg *ngIf="onboardingService.isSubmitting()"
                          class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <svg *ngIf="!onboardingService.isSubmitting()"
                          class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                      </svg>
                      {{ onboardingService.isSubmitting() ? 'Processing...' : 'Complete Onboarding' }}
                    </button>
                  } @else {
                    <button
                      type="button"
                      (click)="onboardingService.increasePage()"
                      [disabled]="!onboardingService.isEmployeeFormValid() || onboardingService.isSubmitting()"
                      class="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      Next
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})

export class OnboardingModalComponent {
  onboardingService = inject(EmployeeOnboardingService);
  loggerService = inject(LoggerService);

  hideOnboarding = input<() => void>();

  isFirstPage = computed(() => this.onboardingService.page() === 1);
  isLastPage = computed(() => {
    return this.onboardingService.page() === (this.onboardingService.isDriverRole() ? 2 : 1);
  });

  ableToSend = computed(() => {
    if (this.onboardingService.isSubmitting()) {
      return false;
    }

    if (this.onboardingService.isDriverRole()) {
      return this.onboardingService.isEmployeeFormValid() && this.onboardingService.isVehicleAssignmentValid();
    } else {
      return this.onboardingService.isEmployeeFormValid();
    }
  });

  ngOnInit(): void {
    this.loggerService.info('🚀 OnboardingModalComponent: Component initialized');
  }

  ngOnDestroy(): void {
    this.onboardingService.destroy();
  }

  onSubmit(): void {
    this.onboardingService.submitOnboarding();
  }

  onCancel(): void {
    this.onboardingService.cancelOnboarding();
  }
}
