import 'dotenv/config';
import mysql from 'mysql2/promise';

const MYSQL_PORT = Number(process.env.MYSQL_PORT || 3306);

export const mysqlConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: MYSQL_PORT,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'amalgated_properties',
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
  namedPlaceholders: true,
};

let pool;

export function isMysqlEnabled() {
  return process.env.DB_CLIENT === 'mysql';
}

export function getMysqlPool() {
  if (!pool) {
    pool = mysql.createPool(mysqlConfig);
  }

  return pool;
}

export async function testMysqlConnection() {
  const connection = await getMysqlPool().getConnection();

  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}

export default getMysqlPool;
