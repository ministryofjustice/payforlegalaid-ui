import express from "express"
import morgan from "morgan"
import compression from "compression"
import { setupCsrf, helmetSetup, setupConfig, setupMiddlewares } from "./middleware"
import session from "express-session"
import { nunjucksSetup, rateLimitSetUp } from "./utils"
import config from "../config"
import indexRouter from "./routes/index"
import livereload from "connect-livereload"
import crypto from "crypto"

const app = express()

app.use(express.static("public"))

/**
 * Generate a nonce for every request and attach it to res.locals
 * We use 16 bytes which is common in cryptographic contexts.
 * It provides 128 bits of entropy which is considered secure enough for generating nonces.
 * It’s long enough to make the nonce unpredictable while still being efficient to generate.
 */
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("base64")
  next()
})

/**
 * Sets up common middleware for handling cookies, body parsing, etc.
 * @param {import('express').Application} app - The Express application instance.
 */
setupMiddlewares(app)

/**
 * Response compression setup. Compresses responses unless the 'x-no-compression' header is present.
 * Improves the performance of your app by reducing the size of responses.
 */
app.use(
  compression({
    /**
     * Custom filter for compression.
     * Prevents compression if the 'x-no-compression' header is set in the request.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {boolean} - Returns true if compression should be applied, false otherwise.
     */
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        // Don't compress responses with this request header
        return false
      }
      // Fallback to the standard filter function
      return compression.filter(req, res)
    },
  }),
)

/**
 * Sets up security headers using Helmet to protect the app from well-known web vulnerabilities.
 *
 * @param {import('express').Application} app - The Express application instance.
 */
helmetSetup(app)

// Reducing fingerprinting by removing the 'x-powered-by' header
app.disable("x-powered-by")

/**
 * Set up cookie security for sessions.
 * Configures session management with secure cookie settings and session IDs.
 */
app.set("trust proxy", 1) // trust first proxy
app.use(
  session({
    secret: config.COOKIE_SECRET, // Secret for session encryption
    name: "sessionId", // Custom session ID cookie name
    resave: false, // Prevents resaving unchanged sessions
    saveUninitialized: false, // Only save sessions that are modified
  }),
)

// set up csrf
setupCsrf(app)

/**
 * Sets up Nunjucks as the template engine for the Express app.
 * Configures the view engine and template paths.
 *
 * @param {import('express').Application} app - The Express application instance.
 */
nunjucksSetup(app)

/**
 * Applies a general rate limiter to all requests to prevent abuse.
 *
 * @param {import('express').Application} app - The Express application instance.
 * @param {object} config - Configuration object containing rate limit settings.
 */
rateLimitSetUp(app, config)

/**
 * Sets up application-specific configurations that are made available in templates.
 *
 * @param {import('express').Application} app - The Express application instance.
 */
setupConfig(app)

/**
 * Sets up request logging using Morgan for better debugging and analysis.
 */
app.use(morgan("dev"))

/**
 * Registers the main router for the application.
 * Serves routes defined in the 'indexRouter' module.
 */
app.use("/", indexRouter)

/**
 * Enables live-reload middleware in development mode to automatically reload
 * the server when changes are detected.
 */
if (process.env.NODE_ENV === "development") {
  app.use(livereload())
}

/**
 * Starts the Express server on the specified port.
 * Logs the port number to the console upon successful startup.
 */
app.listen(config.app.port, () => {
  console.log(`Server running on port ${config.app.port}`)
})
