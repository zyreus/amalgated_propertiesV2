import authRoutes from './routes/auth.js';
import propertiesRoutes from './routes/properties.js';
import dashboardRoutes from './routes/dashboard.js';
import leasesRoutes from './routes/leases.js';
import paymentsRoutes from './routes/payments.js';
import maintenanceRoutes from './routes/maintenance.js';
import announcementsRoutes from './routes/announcements.js';

export function mountRoutes(app, io) {
  app.locals.io = io;

  app.use('/api/pm/auth', authRoutes);
  app.use('/api/pm/properties', propertiesRoutes);
  app.use('/api/pm/dashboard', dashboardRoutes);
  app.use('/api/pm/leases', leasesRoutes);
  app.use('/api/pm/payments', paymentsRoutes);
  app.use('/api/pm/maintenance', maintenanceRoutes);
  app.use('/api/pm/announcements', announcementsRoutes);
}

export default mountRoutes;
