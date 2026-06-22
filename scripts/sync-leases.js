import { syncLeasesCatalog } from '../backend/db-pm.js';

const result = syncLeasesCatalog({ updateExisting: true });
console.log(`Synced ${result.total} catalog leases (${result.created} created, ${result.updated} updated, ${result.skipped} skipped).`);
