import crypto from "crypto"
import express from "express"
import helmet from "helmet"

/**
 * Sets up web security for the application.
 *
 * This middleware generates a unique nonce per request and configures Helmet
 * to set a dynamic Content Security Policy (CSP) using that nonce. The nonce is
 * attached to res.locals so that it can be used within Nunjucks templates (e.g.,
 * in inline script tags via nonce="{{ cspNonce }}").
 *
 * @returns {express.Router} An Express router with security middleware applied.
 */
export const setUpWebSecurity = () => {
  const router = express.Router()

  /**
   * Generate a nonce for every request and attach it to res.locals.
   * The generated nonce will be used both in inline scripts within the templates
   * and by Helmet to construct the Content Security Policy header.
   */
  router.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString("base64")
    res.locals.cspNonce = nonce
    next()
  })

  /**
   * Set up security headers using Helmet.
   *
   * This configuration applies a Content Security Policy that permits only scripts
   * and styles that carry the correct nonce (generated per request) and blocks any
   * unauthorized inline code. Other directives ensure that resources (images, fonts,
   * etc.) are only loaded from the same origin.
   */
  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
          styleSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
          imgSrc: ["'self'"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: true,
    }),
  )

  return router
}
