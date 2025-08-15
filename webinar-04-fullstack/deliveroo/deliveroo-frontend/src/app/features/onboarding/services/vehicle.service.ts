import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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

    return this.http.get<ApiResponse<Vehicle[]>>(`${this.apiUrl}/vehicles?status=available&unassigned=true`, this.httpOptions).pipe(tap(response => {
      this.logger.info('✅ VehicleService: Available vehicles fetched:', response.data);
    }));
  }
}
