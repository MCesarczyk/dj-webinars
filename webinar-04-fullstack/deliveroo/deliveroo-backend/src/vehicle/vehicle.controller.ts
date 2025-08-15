import express, { Request, Response } from 'express';
import { getAllAvailableVehiclesWithoutDriver, getAllVehicles } from './vehicle.service';
import { mapVehicleRowsToDTOs } from './vehicle.model';
import logger from '../logger';
import { invokeMemoryLeak } from '../memory-leak';
import redisClient from '../redis';

const router = express.Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  invokeMemoryLeak();
  const { status, unassigned } = req.query;
  try {
    if (status === 'available' && unassigned === 'true') {
      const cachedVehicles = await redisClient.get('vehicles');
      if (cachedVehicles) {
        logger.info('Returning vehicles from cache');
        res.json(JSON.parse(cachedVehicles));
        return;
      }
      const vehiclesRaw = await getAllAvailableVehiclesWithoutDriver();
      const vehicles = mapVehicleRowsToDTOs(vehiclesRaw);
      await redisClient.set('vehicles', JSON.stringify(vehicles), { EX: 60 });
      res.json({
        success: true,
        data: vehicles,
        message: 'Available unassigned vehicles fetched successfully'
      });
      return;
    }
    const vehiclesRaw = await getAllVehicles();
    const vehicles = mapVehicleRowsToDTOs(vehiclesRaw);
    res.json({
      success: true,
      data: vehicles,
      message: 'Available vehicles fetched successfully'
    });
  } catch (err) {
    logger.error('Error fetching vehicles:', { err });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/unassigned', async (req: Request, res: Response): Promise<void> => {
  invokeMemoryLeak();
  try {
    const cachedVehicles = await redisClient.get('vehicles-unassigned');
    if (cachedVehicles) {
      logger.info('Returning unassigned vehicles from cache');
      res.json(JSON.parse(cachedVehicles));
      return;
    }
    const vehiclesRaw = await getAllAvailableVehiclesWithoutDriver();
    const vehicles = mapVehicleRowsToDTOs(vehiclesRaw);
    await redisClient.set('vehicles-unassigned', JSON.stringify(vehicles), { EX: 60 });
    res.json({
      success: true,
      data: vehicles,
      message: 'Unassigned vehicles fetched successfully'
    });
  } catch (err) {
    logger.error('Error fetching unassigned vehicles:', { err });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
