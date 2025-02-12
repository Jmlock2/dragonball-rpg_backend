import { Pool } from 'pg';

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

const connectionString = 'postgresql://dbuser:pXcMlGV6Q2mAXTTzTH91HIFOvEyHhw0w@dpg-cumd0r1u0jms73bo2vt0-a/dragonball_jjzi';
const pool = new Pool({ connectionString });
export function query(text: any, params?: any[]) {
  return pool.query(text, params);
}
