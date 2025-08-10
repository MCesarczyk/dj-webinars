I've got Angular app with Employees list. There is "Add personel" button:
```
          <button class="btn btn-primary">
            <span class="material-icons mr-1">person_add</span>
            Add Personnel
          </button>
```
without action so far. Please generate creator for onboarding process of a new employee which will be activated by this button. 

Please also check for vehicles not used by any driver yet and list a few in order to new employee choose one and associate chosen vehicle with employee afterwards.

Data should be retrieved from user and send to backend via "/employees" and "/vehicles" POST endpoints and should send new employee data and data associating new driver with his future vehicle. At this stage please log output to console and leave proper comment in code for future api integration implementation. 

Employees table looks like:
```
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role employee_role NOT NULL,
    status employee_status NOT NULL,
    contact_email VARCHAR(255) UNIQUE NOT NULL,
    hire_date DATE NOT NULL
);
```
Vehicle table:
```
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    type vehicle_type NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    status vehicle_status NOT NULL,
    last_maintenance_date DATE
);
```
Vehicle-Employee association table with additional columns:
```
CREATE TABLE vehicle_employee (
    vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    since_date DATE NOT NULL,
    planned_leave_date DATE,
    usage_notes TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    last_inspection_date DATE,
    PRIMARY KEY (vehicle_id, employee_id, since_date)
);
```
Used enums:
```
CREATE TYPE employee_role AS ENUM ('driver', 'dispatcher', 'manager');
CREATE TYPE employee_status AS ENUM ('active', 'on leave', 'inactive');
CREATE TYPE vehicle_type AS ENUM ('truck', 'van', 'car');
CREATE TYPE vehicle_status AS ENUM ('available', 'on delivery', 'maintenance', 'offline');
```
