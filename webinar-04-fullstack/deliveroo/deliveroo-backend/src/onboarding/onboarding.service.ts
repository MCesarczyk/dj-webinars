import { PoolClient } from "pg";
import logger from "../logger";

export interface VehicleAssignmentData {
  vehicle_id: number;
  since_date: string;
  planned_leave_date?: string;
  usage_notes?: string;
  is_primary: boolean;
  last_inspection_date?: string;
}

export async function assignVehicleToEmployee(
  employee_id: number,
  assignmentData: VehicleAssignmentData, pool: PoolClient
) {
  const {
    vehicle_id,
    since_date,
    planned_leave_date,
    usage_notes,
    is_primary,
    last_inspection_date
  } = assignmentData;

  logger.info('Assigning vehicle to employee:', { employee_id, assignmentData });

  const result = await pool.query(
    `
    INSERT INTO vehicle_employee (
      vehicle_id,
      employee_id,
      since_date,
      planned_leave_date,
      usage_notes,
      is_primary,
      last_inspection_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [
      vehicle_id,
      employee_id,
      since_date,
      planned_leave_date ?? null,
      usage_notes ?? null,
      is_primary ?? false,
      last_inspection_date ?? null
    ]
  );
  return result.rows[0];
}
