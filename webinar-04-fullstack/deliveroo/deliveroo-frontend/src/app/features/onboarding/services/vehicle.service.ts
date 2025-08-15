import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { delay, Observable, of, tap } from 'rxjs';
import {
  Vehicle,
  ApiResponse,
} from '../interfaces/employee.interface';
import { LoggerService } from './logger.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = environment.apiUrl;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient, private logger: LoggerService) { }

  getAvailableVehicles(): Observable<ApiResponse<Vehicle[]>> {
    this.logger.info('🔄 VehicleService: Fetching available vehicles...');

    // Replace with actual API call
    //   return this.http.get<ApiResponse<Vehicle[]>>(`${this.apiUrl}/vehicles?status=available&unassigned=true`, this.httpOptions).pipe(tap(response => {
    //     this.logger.info('✅ VehicleService: Available vehicles fetched:', response.data);
    //   }));
    // }

    // Mock data for development
    const mockVehicles: Vehicle[] = [
      {
        id: 1,
        type: 'truck',
        licensePlate: 'ABC-123',
        status: 'available',
        lastMaintenance: '2024-01-15',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 2,
        type: 'van',
        licensePlate: 'DEF-456',
        status: 'available',
        lastMaintenance: '2024-01-10',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z'
      },
      {
        id: 3,
        type: 'car',
        licensePlate: 'GHI-789',
        status: 'available',
        lastMaintenance: '2024-01-20',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      }
    ];

    this.logger.info('✅ VehicleService: Available vehicles fetched:', mockVehicles);

    return of({
      success: true,
      data: mockVehicles,
      message: 'Available vehicles fetched successfully'
    }).pipe(delay(800));
  }
}
