/**
 * Configuration for API endpoints
 * 
 * This file centralizes API configuration to make it easily modifiable
 * Change the SERVER_PORT if needed (e.g., use 5001 on macOS if port 5000 is reserved)
 */

// Use VITE_API_URL environment variable if present, otherwise default to relative '/api'
export const API_URL = import.meta.env.VITE_API_URL || '/api';
