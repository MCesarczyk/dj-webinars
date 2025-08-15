import express, { Request, Response } from 'express';
import { startTransaction, commitTransaction, rollbackTransaction } from '../database/handlers';
import { assignVehicleToEmployee } from './onboarding.service';
import { createEmployee } from '../employee/employee.service';
import { invokeMemoryLeak } from '../memory-leak';

const router = express.Router();

router.post('/complete', async (req: Request, res: Response) => {
  invokeMemoryLeak();
  const { employeeData, vehicleAssignmentData } = req.body;

  if (!employeeData) {
    return res.status(400).json({ error: 'employeeData is required' });
  }

  const transaction = await startTransaction();

  try {
    const employee = await createEmployee(employeeData, transaction);

    if (vehicleAssignmentData) {
      await assignVehicleToEmployee(employee.id, vehicleAssignmentData, transaction);
    }

    await commitTransaction(transaction);

    return res.status(201).json({
      message: 'Onboarding complete',
      data: {
        employee,
        assignedVehicle: vehicleAssignmentData ?? null
      },
    });
  } catch (error) {
    await rollbackTransaction(transaction);

    return res.status(500).json({
      error: 'Onboarding failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
