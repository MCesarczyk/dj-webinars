You are an Angular developer tasked with creating a comprehensive employee onboarding component for a logistics/transportation company. Create a complete solution that includes:

**Requirements:**

1. **Component Structure**: Create an Angular component called `EmployeeOnboardingComponent` that will be triggered by the existing "Add Personnel" button

2. **Form Implementation**: Design a reactive form that captures:
   - Employee name (required, max 100 characters)
   - Role selection (dropdown: 'driver', 'dispatcher', 'manager')
   - Status selection (dropdown: 'active', 'on leave', 'inactive') 
   - Contact email (required, unique, valid email format)
   - Hire date (required, date picker)

3. **Vehicle Assignment Logic**: 
   - Fetch and display available vehicles (status = 'available') that are not currently assigned to any employee
   - Show vehicle details: type, license plate, last maintenance date
   - Allow new employee to select one vehicle (only for 'driver' role)
   - Capture vehicle assignment details: since_date, planned_leave_date, usage_notes, is_primary flag, last_inspection_date

4. **Data Handling**: 
   - Use Angular services to handle HTTP requests
   - Prepare data for two POST endpoints: `/employees` and `/vehicles` (for vehicle assignment)
   - Include comprehensive console logging with clear labels for debugging
   - Add detailed comments indicating where actual API integration should be implemented

5. **User Experience**:
   - Include form validation with appropriate error messages
   - Show loading states during form submission
   - Provide success/error feedback to user
   - Make the vehicle selection conditional (only show for drivers)

6. **Code Quality**:
   - Follow Angular best practices and naming conventions
   - Include proper TypeScript interfaces matching the database schema
   - Add comprehensive error handling
   - Structure code for maintainability and future API integration

**Database Schema Context**: Use the provided table structures (employees, vehicles, vehicle_employee) and enums (employee_role, employee_status, vehicle_type, vehicle_status) to ensure data consistency.

**Deliverables**: Provide the complete Angular component code including:
- Component TypeScript file with reactive forms and business logic
- Component HTML template with Bootstrap styling
- Service file for API communication
- TypeScript interfaces for type safety
- Clear integration points for future backend connectivity