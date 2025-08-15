import { PoolClient } from 'pg';
import pool from '../database/client';
import logger from '../logger';

export async function checkEmailUniqueness(email: string, poolClient?: PoolClient) {
  logger.info('Checking email uniqueness for:', email);

  const result = await (poolClient || pool).query(
    `
    SELECT COUNT(*) AS count
    FROM employees
    WHERE contact_email = $1
    `,
    [email]
  );
  return Number(result.rows[0].count) === 0;
}

export async function createEmployee(employeeData: any, poolClient?: PoolClient) {
  logger.info('Creating employee with data:', employeeData);

  const result = await (poolClient || pool).query(
    `
    INSERT INTO employees (name, role, status, contact_email, hire_date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [employeeData.name, employeeData.role, employeeData.status, employeeData.email, employeeData.hire_date]
  );
  return result.rows[0];
}

export async function getAllEmployees() {
  const result = await pool.query('SELECT * FROM employees ORDER BY id');
  return result.rows;
}

export async function getDriversWithVehicles() {
  const result = await pool.query(`
    SELECT
      e.id AS driver_id,
      e.name AS driver_name,
      v.license_plate AS vehicle,
      v.last_maintenance_date,
      ve.since_date AS assigned_since,
      ve.planned_leave_date AS assigned_until
    FROM
      employees e
    JOIN vehicle_employee ve ON e.id = ve.employee_id
    JOIN vehicles v ON ve.vehicle_id = v.id
    WHERE
      e.role = 'driver'
      AND (ve.since_date <= CURRENT_DATE AND (ve.planned_leave_date IS NULL OR ve.planned_leave_date >= CURRENT_DATE))
    ORDER BY
      e.name, ve.since_date;
  `);
  return result.rows;
}

export async function getDriversWithoutVehicles() {
  const result = await pool.query(`
    SELECT
      e.id AS driver_id,
      e.name AS driver_name
    FROM
      employees e
    WHERE
      e.role = 'driver'
      AND NOT EXISTS (
        SELECT 1
        FROM vehicle_employee ve
        WHERE ve.employee_id = e.id
          AND (ve.since_date <= CURRENT_DATE AND (ve.planned_leave_date IS NULL OR ve.planned_leave_date >= CURRENT_DATE))
      )
    ORDER BY
      e.name;
  `);
  return result.rows;
}

export async function getTotalDrivers() {
  const result = await pool.query(`
    SELECT COUNT(*) AS total_drivers
    FROM employees
    WHERE role = 'driver';
  `);
  return Number(result.rows[0].total_drivers);
}

export async function getDriversWithVehiclesCount() {
  const result = await pool.query(`
    SELECT COUNT(DISTINCT e.id) AS drivers_with_vehicles
    FROM employees e
    JOIN vehicle_employee ve ON e.id = ve.employee_id
    WHERE e.role = 'driver'
      AND (ve.since_date <= CURRENT_DATE AND (ve.planned_leave_date IS NULL OR ve.planned_leave_date >= CURRENT_DATE));
  `);
  return Number(result.rows[0].drivers_with_vehicles);
}

export async function getDriversWithoutVehiclesCount() {
  const result = await pool.query(`
    SELECT COUNT(*) AS drivers_without_vehicles
    FROM employees e
    WHERE role = 'driver'
      AND NOT EXISTS (
        SELECT 1
        FROM vehicle_employee ve
        WHERE ve.employee_id = e.id
          AND (ve.since_date <= CURRENT_DATE AND (ve.planned_leave_date IS NULL OR ve.planned_leave_date >= CURRENT_DATE))
      );
  `);
  return Number(result.rows[0].drivers_without_vehicles);
}
