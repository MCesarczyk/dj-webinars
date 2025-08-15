import express, { Request, Response } from 'express';

import vehicles from './vehicle/vehicle.controller';
import employees from './employee/employee.controller';
import onboarding from './onboarding/onboarding.controller';

const router = express.Router();

router.use('/vehicles', vehicles);
router.use('/employees', employees);
router.use('/onboarding', onboarding);

router.get('/', (req: Request, res: Response): void => {
  res.json({ status: 'Deliveroo backend is running!', timestamp: new Date() });
});

export default router;