import { render, screen } from '@testing-library/angular';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import userEvent from '@testing-library/user-event';
import { EmployeeInformationFormComponent } from './employee-information-form.component';
import { EmployeeOnboardingService } from '../employee-onboarding/employee-onboarding.service';
import { EmployeeService } from '../../services/employee.service';
import { LoggerService } from '../../services/logger.service';

describe('EmployeeInformationFormComponent', () => {
  const loggerSpy = {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockOnboardingService = {
    employeeForm: new FormGroup({
      name: new FormControl(''),
      role: new FormControl(''),
      status: new FormControl('active'),
      email: new FormControl(''),
      hire_date: new FormControl('')
    }),
    employeeRoles: ['driver', 'dispatcher', 'manager'],
    employeeStatuses: ['active', 'on leave', 'inactive'],
    isEmailChecking: jest.fn().mockReturnValue(false),
    emailValidationMessage: jest.fn().mockReturnValue(''),
    getFieldError: jest.fn().mockReturnValue('')
  };

  const mockEmployeeService = {
    checkEmailUniqueness: jest.fn()
  };

  const renderComponent = async () => {
    return await render(EmployeeInformationFormComponent, {
      imports: [CommonModule, ReactiveFormsModule],
      providers: [
        { provide: EmployeeOnboardingService, useValue: mockOnboardingService },
        { provide: EmployeeService, useValue: mockEmployeeService },
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

  describe('Template Rendering', () => {
    it('should render employee information form', async () => {
      await renderComponent();
      expect(screen.getByText('Employee Information')).toBeInTheDocument();
    });


    it('should render all form fields', async () => {
      await renderComponent();

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hire date/i)).toBeInTheDocument();
    });

    it('should render required field indicators', async () => {
      await renderComponent();

      const requiredFields = screen.getAllByText('*');
      expect(requiredFields.length).toBeGreaterThan(0);
    });

    it('should render role options', async () => {
      await renderComponent();

      const roleSelect = screen.getByLabelText(/role/i);
      expect(roleSelect).toBeInTheDocument();

      // Check for role options
      expect(screen.getByText('Select a role')).toBeInTheDocument();
      expect(screen.getByText('Driver')).toBeInTheDocument();
      expect(screen.getByText('Dispatcher')).toBeInTheDocument();
      expect(screen.getByText('Manager')).toBeInTheDocument();
    });

    it('should render status options', async () => {
      await renderComponent();

      const statusSelect = screen.getByLabelText(/status/i);
      expect(statusSelect).toBeInTheDocument();

      // Check for status options
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('On Leave')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  describe('Form Validation Display', () => {
    it('should show error styling for invalid touched fields', async () => {
      mockOnboardingService.employeeForm.get('name')?.setErrors({ invalid: true });
      mockOnboardingService.employeeForm.get('name')?.markAsTouched();

      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;
      jest.spyOn(component, 'isFieldInvalid').mockReturnValue(true);

      fixture.detectChanges();

      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveClass('border-red-300');
    });

    it('should show success styling for valid touched fields', async () => {
      mockOnboardingService.employeeForm.get('name')?.setErrors(null);
      mockOnboardingService.employeeForm.get('name')?.markAsTouched();

      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;
      jest.spyOn(component, 'isFieldValid').mockReturnValue(true);

      fixture.detectChanges();

      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveClass('border-green-300');
    });

    it('should display field error messages', async () => {
      mockOnboardingService.getFieldError.mockReturnValue('Name is required');

      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;
      jest.spyOn(component, 'isFieldInvalid').mockReturnValue(true);

      fixture.detectChanges();

      expect(screen.getAllByText('Name is required').length).toBeGreaterThan(0);
    });
  });

  describe('Email Validation Display', () => {
    it('should show email checking spinner', async () => {
      mockOnboardingService.isEmailChecking.mockReturnValue(true);

      await renderComponent();

      const spinner = screen.getByRole('img', { hidden: true }); // SVG spinner
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should show email validation message', async () => {
      mockOnboardingService.emailValidationMessage.mockReturnValue('Email is available');

      await renderComponent();

      expect(screen.getByText('Email is available')).toBeInTheDocument();
    });

    it('should show error styling for taken email', async () => {
      mockOnboardingService.emailValidationMessage.mockReturnValue('Email is already taken');
      const emailControl = mockOnboardingService.employeeForm.get('email');
      jest.spyOn(emailControl!, 'hasError').mockImplementation((errorKey) => errorKey === 'emailTaken');

      await renderComponent();

      const errorMessage = screen.getByText('Email is already taken');
      expect(errorMessage).toHaveClass('text-red-600');
    });
  });

  describe('User Interactions', () => {
    it('should handle name input', async () => {
      const user = userEvent.setup();
      await renderComponent();

      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'John Doe');

      expect(nameInput).toHaveValue('John Doe');
    });

    it('should handle role selection', async () => {
      const user = userEvent.setup();
      await renderComponent();

      const roleSelect = screen.getByLabelText(/role/i);
      await user.selectOptions(roleSelect, 'driver');

      expect(roleSelect).toHaveValue('driver');
    });

    it('should handle email input', async () => {
      const user = userEvent.setup();
      await renderComponent();

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'john@test.com');

      expect(emailInput).toHaveValue('john@test.com');
    });

    it('should handle date input', async () => {
      const user = userEvent.setup();
      await renderComponent();

      const dateInput = screen.getByLabelText(/hire date/i);
      await user.type(dateInput, '2024-01-15');

      expect(dateInput).toHaveValue('2024-01-15');
    });
  });

  describe('Component Methods', () => {
    it('should validate field invalid state correctly', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      mockOnboardingService.employeeForm.get('name')?.setErrors({ invalid: true });
      mockOnboardingService.employeeForm.get('name')?.markAsTouched();

      const result = component.isFieldInvalid('name');
      expect(result).toBe(true);
    });

    it('should validate field valid state correctly', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      mockOnboardingService.employeeForm.get('name')?.setErrors(null);
      mockOnboardingService.employeeForm.get('name')?.markAsTouched();

      const result = component.isFieldValid('name');
      expect(result).toBe(true);
    });

    it('should get field error correctly', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      const expectedError = 'Field is required';
      mockOnboardingService.getFieldError.mockReturnValue(expectedError);

      const result = component.getFieldError('name');

      expect(mockOnboardingService.getFieldError).toHaveBeenCalledWith(
        mockOnboardingService.employeeForm,
        'name'
      );
      expect(result).toBe(expectedError);
    });

    it('should log form submission', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      component.onSubmit();

      expect(loggerSpy.info).toHaveBeenCalledWith('📋 Employee form submitted');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form fields', async () => {
      await renderComponent();

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hire date/i)).toBeInTheDocument();
    });

    it('should have proper input attributes', async () => {
      await renderComponent();

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);

      expect(nameInput).toHaveAttribute('maxlength', '100');
      expect(nameInput).toHaveAttribute('placeholder', 'Enter full name');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'employee@company.com');
    });
  });

  describe('Form Integration', () => {
    it('should be connected to onboarding service form', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      expect(component.onboardingService).toBe(mockOnboardingService);
      expect(component.onboardingService.employeeForm).toBeDefined();
    });

    it('should display employee roles from service', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      expect(component.onboardingService.employeeRoles).toEqual(['driver', 'dispatcher', 'manager']);
    });

    it('should display employee statuses from service', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      expect(component.onboardingService.employeeStatuses).toEqual(['active', 'on leave', 'inactive']);
    });
  });
});
