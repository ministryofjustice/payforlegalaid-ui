import request from "supertest"
import express from "express"
import { setUpWebSecurity } from "./setUpWebSecurity.js"
import helmet from "helmet"

// Mock Helmet so we can inspect what configuration it receives.
// In this mock, Helmet simply calls next() for every request.
jest.mock("helmet", () => jest.fn(() => (req, res, next) => next()))

describe("setUpWebSecurity", () => {
  let app

  beforeEach(() => {
    app = express()
    // Attach our setUpWebSecurity middleware to the app.
    app.use(setUpWebSecurity())

    // Add a simple route to expose the generated nonce for testing purposes.
    app.get("/nonce", (req, res) => {
      res.send({ nonce: res.locals.cspNonce })
    })
  })

  it("should generate a nonce and attach it to res.locals", async () => {
    const response = await request(app).get("/nonce")
    expect(response.status).toBe(200)
    // The nonce should be defined and non-empty.
    expect(response.body.nonce).toBeDefined()
    expect(response.body.nonce).not.toBe("")
  })

  it("should call helmet with a CSP configuration that uses the nonce", () => {
    // Ensure that helmet was called in our setUpWebSecurity middleware.
    expect(helmet).toHaveBeenCalled()

    // Grab the argument (the configuration object) from the first call to helmet.
    const helmetConfig = helmet.mock.calls[0][0]
    expect(helmetConfig).toHaveProperty("contentSecurityPolicy")

    // Simulate a request/response scenario.
    // Create fake objects with a sample nonce.
    const fakeReq = {}
    const fakeRes = { locals: { cspNonce: "testnonce" } }

    // The scriptSrc directive is an array; we expect that one element is a function returning the nonce.
    // Our configuration had:
    // scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
    const scriptSrcDirective = helmetConfig.contentSecurityPolicy.directives.scriptSrc
    expect(Array.isArray(scriptSrcDirective)).toBe(true)
    expect(scriptSrcDirective.length).toBeGreaterThan(1)

    // Test the function that should inject the nonce.
    const nonceFunction = scriptSrcDirective[1]
    expect(typeof nonceFunction).toBe("function")
    expect(nonceFunction(fakeReq, fakeRes)).toEqual(`'nonce-testnonce'`)
  })
})
