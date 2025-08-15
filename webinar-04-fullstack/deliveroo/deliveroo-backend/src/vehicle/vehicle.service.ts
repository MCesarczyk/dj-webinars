import pool from "../database/client";

export async function getAllVehicles() {
  const result = await pool.query('SELECT * FROM vehicles ORDER BY id');
  return result.rows;
}

export async function getAllVehiclesWithDriver() {
  const result = await pool.query(`
    SELECT
      v.*,
      e.name AS driver_name
    FROM vehicles v
    LEFT JOIN vehicle_employee ve ON v.id = ve.vehicle_id
    LEFT JOIN employees e ON ve.employee_id = e.id
    ORDER BY v.id;
  `);
  return result.rows;
}

export async function getAllAvailableVehiclesWithoutDriver() {
  const result = await pool.query(`
      SELECT
        v.*,
        NULL AS driver_name
      FROM vehicles v
      LEFT JOIN vehicle_employee ve ON v.id = ve.vehicle_id
      WHERE ve.vehicle_id IS NULL AND v.status = 'available'
      ORDER BY v.id;
    `);
  return result.rows;
}
