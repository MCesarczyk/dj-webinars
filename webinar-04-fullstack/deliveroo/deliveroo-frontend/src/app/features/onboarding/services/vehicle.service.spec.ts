import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoggerService } from './logger.service';
import {
  Vehicle,
} from '../interfaces/employee.interface';
import { VehicleService } from './vehicle.service';
import { environment } from '../../../../environments/environment';

describe('VehicleService', () => {
  let service: VehicleService;
  let httpMock: HttpTestingController;
  let loggerService: LoggerService;

  const loggerSpy = {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockVehicles: Vehicle[] = [
    {
      id: 1,
      type: 'truck',
      licensePlate: 'ABC-123',
      status: 'available',
      lastMaintenance: '2024-01-10',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 2,
      type: 'van',
      licensePlate: 'DEF-456',
      status: 'available',
      lastMaintenance: '2024-01-05',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        VehicleService,
        { provide: LoggerService, useValue: loggerSpy }
      ]
    });
    service = TestBed.inject(VehicleService);
    httpMock = TestBed.inject(HttpTestingController);
    loggerService = TestBed.inject(LoggerService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAvailableVehicles', () => {
    it('should fetch available vehicles successfully', (done) => {
      service.getAvailableVehicles().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(response.data!.length).toBeGreaterThan(0);
        expect(response.data![0].status).toBe('available');
        expect(response.message).toBe('Available vehicles fetched successfully');
        done();
      });
    });


    it('should return vehicles with correct structure', (done) => {
      service.getAvailableVehicles().subscribe(response => {
        const vehicle = response.data![0];
        expect(vehicle).toHaveProperty('id');
        expect(vehicle).toHaveProperty('type');
        expect(vehicle).toHaveProperty('licensePlate');
        expect(vehicle).toHaveProperty('status');
        expect(vehicle).toHaveProperty('lastMaintenance');
        done();
      });
    });

    it('should log the fetching process', (done) => {
      service.getAvailableVehicles().subscribe(() => {
        expect(loggerService.info).toHaveBeenCalledWith(
          '🔄 VehicleService: Fetching available vehicles...'
        );
        expect(loggerService.info).toHaveBeenCalledWith(
          expect.stringMatching('✅ VehicleService: Available vehicles fetched:'),
          expect.any(Array)
        );
        done();
      });
    });
  });
});
