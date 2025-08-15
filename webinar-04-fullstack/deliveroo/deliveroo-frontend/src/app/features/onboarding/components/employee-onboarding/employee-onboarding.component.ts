import { Component, inject, OnInit, OnDestroy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OnboardingModalComponent } from '../onboarding-modal/onboarding-modal.component';
import { EmployeeOnboardingService } from './employee-onboarding.service';
import { EmployeeInformationFormComponent } from "../employee-information-form/employee-information-form.component";
import { VehicleAssignmentFormComponent } from "../vehicle-assignment-form/vehicle-assignment-form.component";
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-employee-onboarding',
  standalone: true,
  imports: [CommonModule, OnboardingModalComponent, EmployeeInformationFormComponent, VehicleAssignmentFormComponent],
  template: `
    <app-onboarding-modal [hideOnboarding]="hideOnboarding()">
      <app-employee-information-form></app-employee-information-form>
      @if (onboardingService.isDriverRole()) {
        <app-vehicle-assignment-form></app-vehicle-assignment-form>
      }
    </app-onboarding-modal>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})

export class EmployeeOnboardingComponent implements OnInit, OnDestroy {
  hideOnboarding = input<() => void>();

  onboardingService = inject(EmployeeOnboardingService);
  loggerService = inject(LoggerService);

  ngOnInit(): void {
    this.loggerService.info('🚀 EmployeeOnboardingComponent: Component initialized');
  }

  ngOnDestroy(): void {
    this.loggerService.info('🔄 EmployeeOnboardingComponent: Component destroyed');
  }
}
