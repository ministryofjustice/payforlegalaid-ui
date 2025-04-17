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
import { httpRequestsTotal, register } from "./utils/metrics.js"

const app = express()

app.use(express.static("public"))

/**
 * Middleware to capture HTTP requests for Prometheus metrics.
 *
 * This middleware listens for both "finish" (normal completion) and "close" (aborted connection) events on the response object and then increments
 * the `httpRequestsTotal` counter. The counter is updated with labels for the HTTP method, the
 * request path, and the response status code. This helps to differentiate between successful
 * responses (2xx), client errors (4xx), and server errors (5xx).
 */

app.use((req, res, next) => {
  // Determine the report type from the request (defaults to "unknown")
  const reportType = req.query.report_type || "unknown"

  /**
   * Increments the httpRequestsTotal counter with metrics.
   *
   * This function uses the HTTP method, request path, response status code, and report type to
   * update the Prometheus counter for HTTP requests.
   *
   * @returns {void}
   */
  const logMetrics = statusOverride => {
    httpRequestsTotal.inc({
      method: req.method,
      path: req.path,
      status: String(statusOverride ?? res.statusCode),
      report_type: reportType,
    })
  }

  /**
   * Handler for the "finish" event on the response.
   *
   * When the response finishes normally, this handler calls logMetrics to record the metrics
   * and then removes the "close" listener to prevent duplicate cleanup.
   *
   * @returns {void}
   */
  const finishHandler = () => {
    logMetrics()
    // Remove the "close" listener so that it won't be called later.
    res.off("close", closeHandler)
  }

  /**
   * Handler for the "close" event on the response.
   *
   * If the connection is aborted before the response finishes, this handler removes the "finish"
   * listener to prevent it from firing later.
   *
   * @returns {void}
   */
  const closeHandler = () => {
    logMetrics(499)
    // Remove the "finish" listener if the response did not complete normally.
    res.off("finish", finishHandler)
  }

  // Use `once` to ensure each handler only fires one time per request.
  res.once("finish", finishHandler)
  res.once("close", closeHandler)

  next()
})

/**
 * Generate a nonce for every request and attach it to res.locals
 * We use 16 bytes which is common in cryptographic contexts.
 * It provides 128 bits of entropy which is considered secure enough for generating nonce's.
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
 * Expose Prometheus metrics at the '/metrics' endpoint.
 * Prometheus will scrape this endpoint to gather performance and usage data.
 */
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType)
    res.end(await register.metrics())
  } catch (err) {
    console.error("Metrics endpoint error:", err)
    if (process.env.NODE_ENV === "production") {
      res.status(500).end("Internal Server Error")
    } else {
      res.status(500).end(err.toString())
    }
  }
})

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

export default app
