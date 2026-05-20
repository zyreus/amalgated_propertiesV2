# Deployment Notes

## Production Runtime

- Run the backend on Node.js with `PORT=8000` or the port provided by the host.
- Build the frontend with `npm run build` from `frontend/`; the backend serves `frontend/dist` in production.
- Use a process manager or platform service to keep the backend running and restart on failure.

## Data Services

- Use PostgreSQL for production property management data instead of local development storage.
- Use Redis for shared rate limiting, sessions, queues, or Socket.io scaling when running multiple backend instances.

## Environment Variables

- `NODE_ENV=production`
- `PORT`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `DATABASE_URL`
- `REDIS_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `CLIENT_USERNAME`
- `CLIENT_PASSWORD_HASH`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `CONTACT_TO_EMAIL`
- `GROQ_API_KEY`
