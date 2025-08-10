import { Component, inject } from '@angular/core';
import { FleetStore } from './fleet-store.service';
import { CommonModule } from '@angular/common';
import { VehicleType, VehicleStatus } from './vehicle.model';

@Component({
  selector: 'app-fleet-filters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-6 rounded-xl shadow-md mb-8 border border-neutral-100">
      <div class="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
        <div class="flex-1">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 pointer-events-none">
              <span class="material-icons text-lg">search</span>
            </span>
            <input 
              type="text" 
              placeholder="Search vehicles by license plate or driver..." 
              class="form-control pl-10 py-2 rounded-lg border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition w-full" 
              [value]="fleetStore.search().text"
              (input)="onTextChange($event)"
              style="padding-left: 2.5rem;" />
          </div>
        </div>
        <div class="flex flex-wrap gap-2 items-center">
          <select class="form-control rounded-lg border border-neutral-200 py-2 px-3" [value]="fleetStore.search().type ?? ''" (change)="onTypeChange($event)">
            <option value="">All Types</option>
            @for (type of vehicleTypes; track type) {
              <option [value]="type">{{ type | titlecase }}</option>
            }
          </select>
          <select class="form-control rounded-lg border border-neutral-200 py-2 px-3" [value]="fleetStore.search().status ?? ''" (change)="onStatusChange($event)">
            <option value="">All Statuses</option>
            @for (status of vehicleStatuses; track status) {
              <option [value]="status">{{ status }}</option>
            }
          </select>
        </div>
        <div class="flex flex-wrap gap-2 items-center">
          <input type="date" class="form-control rounded-lg border border-neutral-200 py-2 px-3 min-w-44" [value]="fleetStore.search().lastMaintenanceFrom ?? ''" (change)="onLastMaintenanceFromChange($event)" placeholder="From" />
          <span class="text-neutral-400">-</span>
          <input type="date" class="form-control rounded-lg border border-neutral-200 py-2 px-3 min-w-44" [value]="fleetStore.search().lastMaintenanceTo ?? ''" (change)="onLastMaintenanceToChange($event)" placeholder="To" />
        </div>
        <button type="button" class="clear-filters-btn ml-auto" (click)="clearFilters()">
          <span class="material-icons clear-icon">close</span>
          Clear Filters
        </button>
      </div>
    </div>
  `,
  styles: [
    `.form-control.pl-10, input[style*='padding-left: 2.5rem'] { padding-left: 2.5rem !important; }`,
    `.material-icons.text-base, .material-icons.text-lg { font-size: 1.25rem; }`,
    `.clear-filters-btn { display: flex; align-items: center; background: #f6f6f6; color: #666; border: none; border-radius: 6px; padding: 0.25rem 0.75rem; font-size: 0.95rem; transition: background 0.2s, color 0.2s; box-shadow: none; outline: none; cursor: pointer; }`,
    `.clear-filters-btn:hover, .clear-filters-btn:focus { background: #ececec; color: #222; }`,
    `.clear-icon { font-size: 1.1rem; margin-right: 0.3em; opacity: 0.7; }`,
    `.border-neutral-100 { border-color: #f3f4f6; }`,
    `.rounded-xl { border-radius: 1rem; }`,
    `.shadow-md { box-shadow: 0 4px 24px 0 rgba(0,0,0,0.04); }`
  ]
})
export class FleetFiltersComponent {
  fleetStore = inject(FleetStore);
  vehicleTypes = ['truck', 'van', 'car'] as VehicleType[];
  vehicleStatuses = ['Available', 'On Delivery', 'Maintenance', 'Offline'] as VehicleStatus[];

  onTextChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.fleetStore.setSearchText(value);
  }
  onTypeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.fleetStore.setSearchType(value === '' ? null : value as VehicleType);
  }
  onStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.fleetStore.setSearchStatus(value === '' ? null : value as VehicleStatus);
  }
  onLastMaintenanceFromChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.fleetStore.setSearchLastMaintenanceFrom(value === '' ? null : value);
  }
  onLastMaintenanceToChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.fleetStore.setSearchLastMaintenanceTo(value === '' ? null : value);
  }
  clearFilters() {
    this.fleetStore.setSearchText('');
    this.fleetStore.setSearchType(null);
    this.fleetStore.setSearchStatus(null);
    this.fleetStore.setSearchLastMaintenanceFrom(null);
    this.fleetStore.setSearchLastMaintenanceTo(null);
  }
}
