import { syncPropertiesCatalog } from '../backend/db-pm.js';

const result = syncPropertiesCatalog({ updateExisting: true });
console.log(`Synced ${result.total} catalog properties (${result.created} created, ${result.updated} updated, ${result.skipped} skipped).`);
