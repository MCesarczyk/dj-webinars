import express, { Request, Response } from 'express';
import { checkEmailUniqueness, createEmployee, getAllEmployees } from './employee.service';
import logger from '../logger';
import { invokeMemoryLeak } from '../memory-leak';
import redisClient from '../redis';

const router = express.Router();

router.get('/check-email', async (req: Request, res: Response): Promise<void> => {
  invokeMemoryLeak();
  const { email } = req.query;
  try {
    const isUnique = await checkEmailUniqueness(email as string);
    res.json({ available: isUnique });
  } catch (err) {
    logger.error('Error checking email uniqueness:', { err });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  invokeMemoryLeak();
  const { employeeData } = req.body;

  try {
    const newEmployee = await createEmployee(employeeData);
    await redisClient.del('employees');
    res.status(201).json(newEmployee);
  } catch (err) {
    logger.error('Error creating employee:', { err });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  invokeMemoryLeak();
  try {
    const cachedEmployees = await redisClient.get('employees');
    if (cachedEmployees) {
      logger.info('Returning employees from cache');
      res.json(JSON.parse(cachedEmployees));
      return;
    }
    const employees = await getAllEmployees();
    await redisClient.set('employees', JSON.stringify(employees), { EX: 60 });
    res.json(employees);
  } catch (err) {
    logger.error('Error fetching employees:', { err });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
