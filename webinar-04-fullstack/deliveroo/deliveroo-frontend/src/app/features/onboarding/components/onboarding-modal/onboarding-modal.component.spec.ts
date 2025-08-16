import { render, screen, waitFor } from '@testing-library/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import userEvent from '@testing-library/user-event';
import { OnboardingModalComponent } from './onboarding-modal.component';
import { EmployeeOnboardingService } from '../employee-onboarding/employee-onboarding.service';
import { EmployeeInformationFormComponent } from '../employee-information-form/employee-information-form.component';
import { VehicleAssignmentFormComponent } from '../vehicle-assignment-form/vehicle-assignment-form.component';
import { LoggerService } from '../../services/logger.service';

describe('OnboardingModalComponent', () => {
  const loggerSpy = {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockOnboardingService = {
    loadAvailableVehicles: jest.fn(),
    submitOnboarding: jest.fn(),
    cancelOnboarding: jest.fn(),
    clearMessages: jest.fn(),
    destroy: jest.fn(),
    isLoading: jest.fn().mockReturnValue(false),
    isSubmitting: jest.fn().mockReturnValue(false),
    showSuccessMessage: jest.fn().mockReturnValue(false),
    errorMessage: jest.fn().mockReturnValue(''),
    successMessage: jest.fn().mockReturnValue(''),
    isDriverRole: jest.fn().mockReturnValue(false),
    isEmployeeFormValid: jest.fn().mockReturnValue(false),
    isVehicleAssignmentValid: jest.fn().mockReturnValue(true),
    page: jest.fn().mockReturnValue(1)
  };

  const renderComponent = async () => {
    return await render(OnboardingModalComponent, {
      imports: [
        CommonModule,
        ReactiveFormsModule,
        EmployeeInformationFormComponent,
        VehicleAssignmentFormComponent
      ],
      providers: [
        { provide: EmployeeOnboardingService, useValue: mockOnboardingService },
        { provide: LoggerService, useValue: loggerSpy }
      ]
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create', async () => {
    const { fixture } = await renderComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should log initialization message', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      component.ngOnInit();

      expect(loggerSpy.info).toHaveBeenCalledWith('🚀 OnboardingModalComponent: Component initialized');
    });

    it('should call destroy on service when component is destroyed', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      component.ngOnDestroy();
      expect(mockOnboardingService.destroy).toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    it('should render modal header', async () => {
      await renderComponent();
      expect(screen.getByText('Employee Onboarding')).toBeInTheDocument();
    });

    it('should render header icon', async () => {
      await renderComponent();
      const headerIcon = screen.getByRole('img', { hidden: true });
      expect(headerIcon).toBeInTheDocument();
    });

    it('should render action buttons', async () => {
      await renderComponent();

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /complete onboarding/i })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state when isLoading is true', async () => {
      mockOnboardingService.isLoading.mockReturnValue(true);

      await renderComponent();

      expect(screen.getByText('Loading available vehicles...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toHaveClass('animate-spin');
    });

    it('should hide forms when loading', async () => {
      mockOnboardingService.isLoading.mockReturnValue(true);

      await renderComponent();

      expect(screen.queryByText('Employee Information')).not.toBeInTheDocument();
    });
  });

  describe('Success Message Display', () => {
    it('should show success message when showSuccessMessage is true', async () => {
      mockOnboardingService.showSuccessMessage.mockReturnValue(true);
      mockOnboardingService.successMessage.mockReturnValue('Employee created successfully!');

      await renderComponent();

      expect(screen.getByText('Employee created successfully!')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('should call clearMessages when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      mockOnboardingService.showSuccessMessage.mockReturnValue(true);
      mockOnboardingService.successMessage.mockReturnValue('Success!');

      await renderComponent();

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);

      expect(mockOnboardingService.clearMessages).toHaveBeenCalled();
    });
  });

  describe('Error Message Display', () => {
    it('should show error message when errorMessage is not empty', async () => {
      mockOnboardingService.errorMessage.mockReturnValue('Something went wrong!');

      await renderComponent();

      expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /dismiss/i })?.[0]).toBeInTheDocument();
    });

    it('should call clearMessages when error dismiss button is clicked', async () => {
      const user = userEvent.setup();
      mockOnboardingService.errorMessage.mockReturnValue('Error!');

      await renderComponent();

      const dismissButtons = screen.getAllByRole('button', { name: /dismiss/i });
      await user.click(dismissButtons[0]);

      expect(mockOnboardingService.clearMessages).toHaveBeenCalled();
    });
  });

  describe('Form Actions', () => {
    describe('Cancel Button', () => {
      it('should be enabled when not submitting', async () => {
        mockOnboardingService.isSubmitting.mockReturnValue(false);
        mockOnboardingService.isLoading.mockReturnValue(false);

        await renderComponent();

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        expect(cancelButton).not.toBeDisabled();
      });

      it('should be disabled when submitting', async () => {
        mockOnboardingService.isSubmitting.mockReturnValue(true);

        await renderComponent();

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        expect(cancelButton).toBeDisabled();
      });

      it('should call onCancel when clicked', async () => {
        mockOnboardingService.isSubmitting.mockReturnValue(false);
        const user = userEvent.setup();

        const { fixture } = await renderComponent();
        const component = fixture.componentInstance;
        const onCancelSpy = jest.spyOn(component, 'onCancel');

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fixture.detectChanges();

        await waitFor(() => {
          expect(cancelButton).not.toBeDisabled();
        });

        await user.click(cancelButton);
        fixture.detectChanges();
        expect(onCancelSpy).toHaveBeenCalled();
      });
    });

    describe('Submit Button', () => {
      it('should be disabled when employee form is invalid', async () => {
        mockOnboardingService.isEmployeeFormValid.mockReturnValue(false);

        await renderComponent();

        const submitButton = screen.getByRole('button', { name: /complete onboarding/i });
        expect(submitButton).toBeDisabled();
      });

      it('should be disabled when driver role and vehicle assignment is invalid', async () => {
        mockOnboardingService.isEmployeeFormValid.mockReturnValue(true);
        mockOnboardingService.isDriverRole.mockReturnValue(true);
        mockOnboardingService.isVehicleAssignmentValid.mockReturnValue(false);
        mockOnboardingService.page.mockReturnValue(2);

        await renderComponent();

        const submitButton = screen.getByRole('button', { name: /complete onboarding/i });
        expect(submitButton).toBeDisabled();
      });

      it('should be enabled when all forms are valid', async () => {
        mockOnboardingService.isEmployeeFormValid.mockReturnValue(true);
        mockOnboardingService.isDriverRole.mockReturnValue(true);
        mockOnboardingService.isVehicleAssignmentValid.mockReturnValue(true);
        mockOnboardingService.isSubmitting.mockReturnValue(false);
        mockOnboardingService.page.mockReturnValue(2);

        await renderComponent();

        const submitButton = screen.getByRole('button', { name: /complete onboarding/i });
        expect(submitButton).not.toBeDisabled();
      });

      it('should show processing state when submitting', async () => {
        mockOnboardingService.isSubmitting.mockReturnValue(true);

        await renderComponent();

        expect(screen.getByRole('button', { name: /processing/i })).toBeInTheDocument();
      });

      it('should call onSubmit when clicked', async () => {
        const user = userEvent.setup();
        mockOnboardingService.isDriverRole.mockReturnValue(false);
        mockOnboardingService.isEmployeeFormValid.mockReturnValue(true);
        mockOnboardingService.isSubmitting.mockReturnValue(false);
        mockOnboardingService.page.mockReturnValue(1);

        const { fixture } = await renderComponent();
        const component = fixture.componentInstance;
        const onSubmitSpy = jest.spyOn(component, 'onSubmit');

        const submitButton = screen.getByRole('button', { name: /complete onboarding/i });
        await user.click(submitButton);

        expect(onSubmitSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Component Methods', () => {
    it('should call submitOnboarding on service when onSubmit is called', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      component.onSubmit();
      expect(mockOnboardingService.submitOnboarding).toHaveBeenCalled();
    });

    it('should call cancelOnboarding on service when onCancel is called', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      component.onCancel();
      expect(mockOnboardingService.cancelOnboarding).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive container classes', async () => {
      const { container } = await renderComponent();

      expect(container.querySelector('.max-w-2xl')).toBeInTheDocument();
    });

    it('should have responsive padding classes', async () => {
      const { container } = await renderComponent();

      expect(container.querySelector('.px-4')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      await renderComponent();

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should have proper button roles and states', async () => {
      await renderComponent();

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('should have proper focus management', async () => {
      const { container } = await renderComponent();

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('focus:outline-none');
        expect(button).toHaveClass('focus:ring-2');
      });
    });
  });
});
