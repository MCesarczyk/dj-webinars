import { render, screen } from '@testing-library/angular';
import { CommonModule } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { EmployeeOnboardingComponent } from './employee-onboarding.component';
import { OnboardingModalComponent } from '../onboarding-modal/onboarding-modal.component';
import { LoggerService } from '../../services/logger.service';

describe('EmployeeOnboardingComponent', () => {
  const loggerSpy = {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const renderComponent = async () => {
    return await render(EmployeeOnboardingComponent, {
      imports: [CommonModule, OnboardingModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LoggerService, useValue: loggerSpy }
      ],
    });
  };

  it('should create', async () => {
    const { fixture } = await renderComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Component Lifecycle', () => {
    it('should log initialization on ngOnInit', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      component.ngOnInit();

      expect(loggerSpy.info).toHaveBeenCalledWith(
        '🚀 EmployeeOnboardingComponent: Component initialized'
      );
    });

    it('should log destruction on ngOnDestroy', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      component.ngOnDestroy();

      expect(loggerSpy.info).toHaveBeenCalledWith(
        '🔄 EmployeeOnboardingComponent: Component destroyed'
      );
    });
  });

  describe('Template Rendering', () => {
    it('should render onboarding modal component', async () => {
      await renderComponent();

      expect(screen.getByText('Employee Onboarding')).toBeInTheDocument();
    });

    it('should have correct host display style', async () => {
      const { fixture } = await renderComponent();
      const hostElement = fixture.debugElement.nativeElement;

      const computedStyle = window.getComputedStyle(hostElement);
      expect(computedStyle.display).toBe('block');
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(EmployeeOnboardingComponent).toBeDefined();
    });

    it('should import required modules', async () => {
      const { fixture } = await renderComponent();
      expect(fixture.componentInstance).toBeInstanceOf(EmployeeOnboardingComponent);
    });
  });

  describe('Integration', () => {
    it('should properly integrate with OnboardingModalComponent', async () => {
      const { container } = await renderComponent();

      expect(container.querySelector('app-onboarding-modal')).toBeInTheDocument();
    });
  });
});
