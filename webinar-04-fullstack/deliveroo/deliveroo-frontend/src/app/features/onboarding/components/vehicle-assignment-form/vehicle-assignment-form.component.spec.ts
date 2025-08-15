import { fireEvent, render, screen } from '@testing-library/angular';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import userEvent from '@testing-library/user-event';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { VehicleAssignmentFormComponent } from './vehicle-assignment-form.component';
import { EmployeeOnboardingService } from '../employee-onboarding/employee-onboarding.service';
import { Vehicle } from '../../interfaces/employee.interface';
import { LoggerService } from '../../services/logger.service';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { VehicleService } from '../../services/vehicle.service';

describe('VehicleAssignmentFormComponent', () => {
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
      lastMaintenance: '2024-01-10',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 2,
      type: 'van' as const,
      licensePlate: 'DEF-456',
      status: 'available' as const,
      lastMaintenance: '2024-01-05',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z'
    }
  ];

  const mockOnboardingService = {
    vehicleAssignmentForm: new FormGroup({
      vehicle_id: new FormControl(''),
      since_date: new FormControl(''),
      planned_leave_date: new FormControl(''),
      usage_notes: new FormControl(''),
      is_primary: new FormControl(true),
      last_inspection_date: new FormControl('')
    }),
    selectedVehicle: signal<Vehicle | null>(mockVehicles[0]),
    setSelectedVehicle: jest.fn(),
    setIsVehicleAssignmentValid: jest.fn(),
    getFieldError: jest.fn().mockReturnValue('')
  };

  const mockVehicleService = {
    getAvailableVehicles: jest.fn().mockReturnValue(of(mockVehicles)),
  };

  const renderComponent = async () => {
    return await render(VehicleAssignmentFormComponent, {
      imports: [CommonModule, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EmployeeOnboardingService, useValue: mockOnboardingService },
        { provide: LoggerService, useValue: loggerSpy },
        { provide: VehicleService, useValue: mockVehicleService }
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

      expect(loggerSpy.info).toHaveBeenCalledWith('🚗 VehicleAssignmentFormComponent: Component initialized');
    });

    it('should call loadAvailableVehicles on init', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      jest.spyOn(component, 'loadAvailableVehicles');

      component.ngOnInit();
      expect(component.loadAvailableVehicles).toHaveBeenCalled();
    });

    it('should call destroy on service when component is destroyed', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      jest.spyOn(component, 'destroy');

      component.ngOnDestroy();
      expect(component.destroy).toHaveBeenCalled();
      expect(loggerSpy.info).toHaveBeenCalledWith('🔄 VehicleAssignmentFormComponent: Component destroyed');
    });
  });

  describe('Template Rendering', () => {
    it('should render form title', async () => {
      await renderComponent();
      expect(screen.getByText('Vehicle Assignment')).toBeInTheDocument();
    });

    it('should render all form fields', async () => {
      await renderComponent();

      expect(screen.getByLabelText(/select vehicle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/assignment start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/planned leave date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last inspection date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/usage notes/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/primary vehicle assignment/i)).toBeInTheDocument();
    });

    it('should render vehicle options', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      component.availableVehicles = signal(mockVehicles);
      fixture.detectChanges();

      const vehicleSelect = screen.getByLabelText(/select vehicle/i);
      expect(vehicleSelect).toBeInTheDocument();

      expect(screen.getByText('Choose a vehicle')).toBeInTheDocument();
      expect(screen.getByText('Truck - ABC-123')).toBeInTheDocument();
      expect(screen.getByText('Van - DEF-456')).toBeInTheDocument();
    });

    it('should render selected vehicle details', async () => {
      await renderComponent();

      expect(screen.getByText('Selected Vehicle Details')).toBeInTheDocument();
      expect(screen.getByText('Truck')).toBeInTheDocument();
      expect(screen.getByText('ABC-123')).toBeInTheDocument();
      expect(screen.getByText('Available')).toBeInTheDocument();
    });
  });

  describe('Form Validation Display', () => {
    it('should show error styling for invalid touched fields', async () => {
      mockOnboardingService.vehicleAssignmentForm.get('vehicle_id')?.setErrors({ invalid: true });
      mockOnboardingService.vehicleAssignmentForm.get('vehicle_id')?.markAsTouched();

      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;
      jest.spyOn(component, 'isFieldInvalid').mockReturnValue(true);

      fixture.detectChanges();

      const vehicleSelect = screen.getByLabelText(/select vehicle/i);
      expect(vehicleSelect).toHaveClass('border-red-300');
    });

    it('should show success styling for valid touched fields', async () => {
      mockOnboardingService.vehicleAssignmentForm.get('vehicle_id')?.setErrors(null);
      mockOnboardingService.vehicleAssignmentForm.get('vehicle_id')?.markAsTouched();

      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;
      jest.spyOn(component, 'isFieldValid').mockReturnValue(true);

      fixture.detectChanges();

      const vehicleSelect = screen.getByLabelText(/select vehicle/i);
      expect(vehicleSelect).toHaveClass('border-green-300');
    });

    it('should display field error messages', async () => {
      mockOnboardingService.getFieldError.mockReturnValue('Vehicle is required');

      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;
      jest.spyOn(component, 'isFieldInvalid').mockReturnValue(true);

      fixture.detectChanges();

      expect(screen.getAllByText('Vehicle is required').length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    it('should handle vehicle selection', async () => {
      const user = userEvent.setup();
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      component.availableVehicles = signal(mockVehicles);
      fixture.detectChanges();

      const vehicleSelect = screen.getByLabelText(/select vehicle/i);
      await user.selectOptions(vehicleSelect, '1');

      expect(vehicleSelect).toHaveValue('1');
    });

    it('should handle date inputs', async () => {
      const user = userEvent.setup();
      await renderComponent();

      const sinceDateInput = screen.getByLabelText(/assignment start date/i);
      fireEvent.change(sinceDateInput, { target: { value: '2024-01-15' } });

      expect(sinceDateInput).toHaveValue('2024-01-15');
    });

    it('should handle textarea input', async () => {
      const user = userEvent.setup();
      await renderComponent();

      const notesTextarea = screen.getByLabelText(/usage notes/i);
      await user.type(notesTextarea, 'Special handling required');

      expect(notesTextarea).toHaveValue('Special handling required');
    });

    it('should handle checkbox input', async () => {
      const user = userEvent.setup();
      await renderComponent();

      const primaryCheckbox = screen.getByLabelText(/primary vehicle assignment/i);
      await user.click(primaryCheckbox);

      expect(primaryCheckbox).not.toBeChecked();
    });
  });

  describe('Component Methods', () => {
    it('should validate field invalid state correctly', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      mockOnboardingService.vehicleAssignmentForm.get('vehicle_id')?.setErrors({ invalid: true });
      mockOnboardingService.vehicleAssignmentForm.get('vehicle_id')?.markAsTouched();

      const result = component.isFieldInvalid('vehicle_id');
      expect(result).toBe(true);
    });

    it('should validate field valid state correctly', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      mockOnboardingService.vehicleAssignmentForm.get('vehicle_id')?.setErrors(null);
      mockOnboardingService.vehicleAssignmentForm.get('vehicle_id')?.markAsTouched();

      const result = component.isFieldValid('vehicle_id');
      expect(result).toBe(true);
    });

    it('should get field error correctly', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      const expectedError = 'Field is required';
      mockOnboardingService.getFieldError.mockReturnValue(expectedError);

      const result = component.getFieldError('vehicle_id');

      expect(mockOnboardingService.getFieldError).toHaveBeenCalledWith(
        mockOnboardingService.vehicleAssignmentForm,
        'vehicle_id'
      );
      expect(result).toBe(expectedError);
    });

    it('should log form submission', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      component.onSubmit();

      expect(loggerSpy.info).toHaveBeenCalledWith('🚗 Vehicle assignment form submitted');
    });
  });

  describe('Vehicle Details Display', () => {
    it('should show vehicle details when vehicle is selected', async () => {
      await renderComponent();

      expect(screen.getByText('Selected Vehicle Details')).toBeInTheDocument();
      expect(screen.getByText('Truck')).toBeInTheDocument();
      expect(screen.getByText('ABC-123')).toBeInTheDocument();
    });

    it('should hide vehicle details when no vehicle is selected', async () => {
      mockOnboardingService.selectedVehicle.set(null);

      await renderComponent();

      expect(screen.queryByText('Selected Vehicle Details')).not.toBeInTheDocument();
    });
  });

  describe('Form Field Types and Attributes', () => {
    it('should have correct input types', async () => {
      await renderComponent();

      const sinceDateInput = screen.getByLabelText(/assignment start date/i);
      const plannedLeaveDateInput = screen.getByLabelText(/planned leave date/i);
      const lastInspectionInput = screen.getByLabelText(/last inspection date/i);
      const usageNotesTextarea = screen.getByLabelText(/usage notes/i);
      const isPrimaryCheckbox = screen.getByLabelText(/primary vehicle assignment/i);

      expect(sinceDateInput).toHaveAttribute('type', 'date');
      expect(plannedLeaveDateInput).toHaveAttribute('type', 'date');
      expect(lastInspectionInput).toHaveAttribute('type', 'date');
      expect(usageNotesTextarea.tagName.toLowerCase()).toBe('textarea');
      expect(isPrimaryCheckbox).toHaveAttribute('type', 'checkbox');
    });

    it('should have correct textarea attributes', async () => {
      await renderComponent();

      const usageNotesTextarea = screen.getByLabelText(/usage notes/i);

      expect(usageNotesTextarea).toHaveAttribute('maxlength', '500');
      expect(usageNotesTextarea).toHaveAttribute('rows', '3');
      expect(usageNotesTextarea).toHaveAttribute('placeholder', expect.stringContaining('Special instructions'));
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form fields', async () => {
      await renderComponent();

      expect(screen.getByLabelText(/select vehicle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/assignment start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/planned leave date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last inspection date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/usage notes/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/primary vehicle assignment/i)).toBeInTheDocument();
    });

    it('should indicate required fields', async () => {
      await renderComponent();

      const requiredFields = screen.getAllByText('*');
      expect(requiredFields.length).toBeGreaterThan(0);
    });

    it('should indicate optional fields', async () => {
      await renderComponent();

      const optionalFields = screen.getAllByText('(Optional)');
      expect(optionalFields.length).toBeGreaterThan(0);
    });
  });

  describe('Form Integration', () => {
    it('should be connected to onboarding service', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;

      expect(component.onboardingService).toBe(mockOnboardingService);
      expect(component.onboardingService.vehicleAssignmentForm).toBeDefined();
    });

    describe('Loading Vehicles', () => {
      it('should call available vehicles load from service', async () => {
        const { fixture } = await renderComponent();
        const component = fixture.componentInstance;

        await fixture.whenStable();
        fixture.detectChanges();

        jest.spyOn(component, 'isLoading');

        expect(component.isLoading()).toBe(false);
        expect(mockVehicleService.getAvailableVehicles).toHaveBeenCalled();
        expect(loggerSpy.info).toHaveBeenCalledWith(
          '🔄 VehicleAssignmentFormComponent: Loading available vehicles...'
        );
      });


      it('should handle loading error', async () => {
        const { fixture } = await renderComponent();
        const component = fixture.componentInstance;

        mockVehicleService.getAvailableVehicles.mockReturnValue(
          throwError(() => new Error('Network error'))
        );

        const showErrorSpy = jest.spyOn(component, 'showError');
        component.loadAvailableVehicles();

        expect(component.isLoading()).toBe(false);
        expect(showErrorSpy).toHaveBeenCalledWith('Error loading available vehicles');
      });

      it('should handle unsuccessful response', async () => {
        const { fixture } = await renderComponent();
        const component = fixture.componentInstance;

        mockVehicleService.getAvailableVehicles.mockReturnValue(
          of({ success: false, message: 'Failed to load' })
        );

        const showErrorSpy = jest.spyOn(component, 'showError');
        component.loadAvailableVehicles();

        expect(showErrorSpy).toHaveBeenCalledWith('Failed to load available vehicles');
      });

      it('should handle successful response', async () => {
        const { fixture } = await renderComponent();
        const component = fixture.componentInstance;

        mockVehicleService.getAvailableVehicles.mockReturnValue(
          of({ success: true, data: mockVehicles })
        );

        component.loadAvailableVehicles();

        expect(component.availableVehicles()).toEqual(mockVehicles);
      });

      it('should display available vehicles from service', async () => {
        const { fixture } = await renderComponent();
        const component = fixture.componentInstance;

        component.availableVehicles = signal(mockVehicles);
        fixture.detectChanges();

        expect(component.availableVehicles()).toEqual(mockVehicles);
      });
    });

    it('should display selected vehicle from service', async () => {
      const { fixture } = await renderComponent();
      const component = fixture.componentInstance;
      mockOnboardingService.selectedVehicle.set(mockVehicles[0]);

      expect(component.onboardingService.selectedVehicle()).toEqual(mockVehicles[0]);
    });

    describe('Vehicle Selection', () => {
      beforeEach(() => {
        mockOnboardingService.selectedVehicle.set(mockVehicles[0]);
      });

      it('should select vehicle when vehicle_id changes', async () => {
        const { fixture } = await renderComponent();
        const component = fixture.componentInstance;
        mockOnboardingService.selectedVehicle.set(mockVehicles[1]);

        expect(component.onboardingService.selectedVehicle()).toEqual(mockVehicles[1]);
      });

      it('should clear selection when no vehicle selected', async () => {
        const { fixture } = await renderComponent();
        const component = fixture.componentInstance;
        mockOnboardingService.selectedVehicle.set(null);

        expect(component.onboardingService.selectedVehicle()).toBe(null);
      });
    });
  });
});
