import { PoolClient } from "pg";
import pool from "./client";
import logger from "../logger";

export async function startTransaction() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    logger.info('Transaction started');

    return client; // Use this client for all queries inside the transaction
  } catch (err) {
    client.release();
    throw err;
  }
}

export async function commitTransaction(client: PoolClient) {
  try {
    await client.query('COMMIT');
  } finally {
    logger.info('Transaction committed');
    client.release();
  }
}

export async function rollbackTransaction(client: PoolClient) {
  try {
    await client.query('ROLLBACK');
  } finally {
    logger.info('Transaction rolled back');
    client.release();
  }
}
