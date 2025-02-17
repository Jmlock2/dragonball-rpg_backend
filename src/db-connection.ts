import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/* const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432, // default Postgres port
  database: 'dragonball'
});

export function query(text: string, params?: any[]): Promise<any> {
  return pool.query(text, params);
} */

/* const connectionString = 'postgresql://zdbuser:FivsjMchmvLt5ZE1RmrfL2uiX2Yk364u@dpg-cuplf18gph6c73cq3k1g-a:5432/dragonballrpg';
const pool = new Pool({ connectionString });
export function query(text: any, params?: any[]) {
  return pool.query(text, params);
} */



const pool = new Pool({
  connectionString: 'postgresql://zdbuser:FivsjMchmvLt5ZE1RmrfL2uiX2Yk364u@dpg-cuplf18gph6c73cq3k1g-a:5432/dragonballrpg', // Usamos la variable de entorno
  ssl: { rejectUnauthorized: false }, // Necesario para Render.com
});

export function query(text: any, params?: any[]) {
  return pool.query(text, params);
}
