import { Pool } from 'pg';

const connectionString = 'postgresql://zdbuser:FivsjMchmvLt5ZE1RmrfL2uiX2Yk364u@dpg-cuplf18gph6c73cq3k1g-a.frankfurt-postgres.render.com/dragonballrpg';
const pool = new Pool({
  connectionString, ssl: { rejectUnauthorized: false }
});
export function query(text: any, params?: any[]) {
  return pool.query(text, params);
}

export default pool;
