/**
 * Production server entry file
 */
import app from './app.js';

/**
 * Start server with port
 */
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Production server ready on port ${PORT}`);
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export default server;