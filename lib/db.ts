/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number.parseInt(process.env.DB_PORT!),
});

export const query = (text: any, params: any) => pool.query(text, params);
