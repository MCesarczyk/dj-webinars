import express, { Request, Response } from 'express';
import cors from 'cors';
import { assertEnvVars } from './env';
import pool from './database/client';
import redisClient from './redis';
import logger from './logger';
import router from './router';

const app = express();
const port = process.env.NODE_APP_PORT;

assertEnvVars(
  'NODE_APP_PORT',
  'NODE_ENV',
  'SERVICE_NAME',
  'LOKI_HOST',
  'SIMULATE_MEMORY_LEAK',
  'FRONTEND_URL',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD_FILE',
  'DB_NAME',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD_FILE'
);

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

app.use('/', router);

process.on('SIGINT', async () => {
  await redisClient.quit();
  await pool.end();
  process.exit(0);
});

app.listen(port, () => {
  logger.info(`Backend listening at http://localhost:${port}`);
});
