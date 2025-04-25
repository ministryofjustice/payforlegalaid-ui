import { healthCheck } from "./healthController.js"
describe("healthCheck", () => {
  let mockRes
  let consoleErrorSpy

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it("should respond with 200 status and UP status", async () => {
    await healthCheck({}, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "UP",
      timestamp: expect.any(String),
    })

    const timestamp = mockRes.json.mock.calls[0][0].timestamp
    expect(new Date(timestamp).toISOString()).toBe(timestamp)
  })

  it("should handle errors and respond with 503 status", async () => {
    const realDate = Date
    global.Date = class extends Date {
      /**
       *
       */
      constructor() {
        super()
        throw new Error("Date creation failed")
      }
    }

    await healthCheck({}, mockRes)

    global.Date = realDate

    expect(consoleErrorSpy).toHaveBeenCalledWith("Health check failed:", expect.any(Error))
    expect(mockRes.status).toHaveBeenCalledWith(503)
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "DOWN",
      error: "Health check failed",
      details: "Date creation failed",
    })
  })
})
