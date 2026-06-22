import 'dotenv/config';
import { seedDatabase } from '../backend/db-pm.js';

const dbClient = process.env.DB_CLIENT || 'sqlite';
const dbTarget = dbClient === 'mysql'
  ? `${process.env.MYSQL_DATABASE || 'amalgated_properties'} (MySQL)`
  : 'chat.db (SQLite)';

console.log(`Seeding database: ${dbTarget}`);

const results = seedDatabase({ updateProperties: true, updateLeases: true });

console.log('Database seed complete.');
console.log(JSON.stringify(results, null, 2));
