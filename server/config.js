/**
 * Server configuration settings
 * 
 * This file centralizes server configuration to make it easily modifiable
 * Change the SERVER_PORT if needed (e.g., use 5001 on macOS if port 5000 is reserved)
 */

// Server port configuration (uses PORT env variable on cloud platforms, defaults to 5000)
const SERVER_PORT = process.env.PORT || 5000;

module.exports = {
  SERVER_PORT
};
