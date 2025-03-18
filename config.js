import dotenv from 'dotenv'
dotenv.config()

// Get environment variables
const config = {
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100,
  RATE_WINDOW_MS: parseInt(process.env.RATE_WINDOW_MS, 10) || 15 * 60 * 1000,
  SERVICE_NAME: process.env.SERVICE_NAME,
  SERVICE_PHASE: process.env.SERVICE_PHASE,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  API_PROTOCOL: process.env.API_PROTOCOL,
  API_HOST: process.env.API_HOST,
  app: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
  },
  csrf: {
    cookieName: '_csrf',
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    httpOnly: true, // Restrict client-side access
  },
  paths: {
    static: 'public', // Path for serving static files
    views: 'src/views', // Path for Nunjucks views
  },
}

export default config
