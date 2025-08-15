import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, delay, map, of, tap } from 'rxjs';
import {
  EmployeeFormData,
  VehicleAssignmentFormData,
  ApiResponse,
  OnboardingResponse
} from '../interfaces/employee.interface';
import { LoggerService } from './logger.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = environment.apiUrl;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient, private logger: LoggerService) { }

  completeOnboarding(employeeData: EmployeeFormData, vehicleAssignmentData?: VehicleAssignmentFormData): Observable<ApiResponse<OnboardingResponse>> {
    this.logger.info('🚀 EmployeeService: Starting complete onboarding process...');
    this.logger.info('📋 Employee Data:', employeeData);
    this.logger.info('🚗 Vehicle Assignment Data:', vehicleAssignmentData);

    const payload = { employeeData, vehicleAssignmentData };

    // Replace with actual API call
    // return this.http.post<ApiResponse<OnboardingResponse>>(`${this.apiUrl}/onboarding/complete`, payload, this.httpOptions);

    // Mock response
    const mockResponse: OnboardingResponse = {
      employee: {
        id: Math.floor(Math.random() * 1000),
        ...employeeData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };

    if (vehicleAssignmentData) {
      mockResponse.vehicleAssignment = {
        id: Math.floor(Math.random() * 1000),
        employee_id: mockResponse.employee.id!,
        ...vehicleAssignmentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    this.logger.info('✅ EmployeeService: Onboarding completed successfully:', mockResponse);

    return of({
      success: true,
      data: mockResponse,
      message: 'Employee onboarding completed successfully'
    }).pipe(delay(2000));
  }

  checkEmailUniqueness(email: string): Observable<boolean> {
    this.logger.info('🔄 EmployeeService: Checking email uniqueness for:', email);

    // Replace with actual API call
    // return this.http.get<{ available: boolean }>(`${this.apiUrl}/employees/check-email?email=${email}`, this.httpOptions)
    //   .pipe(
    //     map(response => response.available),
    //     tap(isUnique => { this.logger.info('✅ EmployeeService: Email uniqueness check result:', { email, isUnique }) })
    //   );

    // Mock validation - simulate some emails being taken
    const takenEmails = ['john.doe@company.com', 'jane.smith@company.com', 'admin@company.com'];
    const isUnique = !takenEmails.includes(email.toLowerCase());

    this.logger.info('✅ EmployeeService: Email uniqueness check result:', { email, isUnique });

    return of(isUnique).pipe(delay(500));
  }
}
