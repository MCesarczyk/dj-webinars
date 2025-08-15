import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
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
    return this.http.post<ApiResponse<OnboardingResponse>>(`${this.apiUrl}/onboarding/complete`, payload, this.httpOptions);
  }

  checkEmailUniqueness(email: string): Observable<boolean> {
    this.logger.info('🔄 EmployeeService: Checking email uniqueness for:', email);

    return this.http.get<{ available: boolean }>(`${this.apiUrl}/employees/check-email?email=${email}`, this.httpOptions)
      .pipe(
        map(response => response.available),
        tap(isUnique => { this.logger.info('✅ EmployeeService: Email uniqueness check result:', { email, isUnique }) })
      );
  }
}
