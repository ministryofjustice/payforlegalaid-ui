import request from "supertest"
import express from "express"
import router from "../routes/index"
import * as reportController from "../controllers/reportController"
import * as healthController from "../controllers/healthController"

jest.mock("../controllers/reportController")
jest.mock("../controllers/healthController")

describe("Router Tests", () => {
  let app

  beforeEach(() => {
    app = express()
    app.use(router)

    jest.clearAllMocks()
  })

  describe("GET /", () => {
    it("should call showReportsPage controller", async () => {
      reportController.showReportsPage.mockImplementation((req, res) => res.status(200).send("Reports Page"))

      const response = await request(app).get("/")

      expect(reportController.showReportsPage).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.text).toBe("Reports Page")
    })

    it("should handle errors from showReportsPage", async () => {
      reportController.showReportsPage.mockImplementation((req, res) => {
        throw new Error("Test error")
      })

      const response = await request(app).get("/")

      expect(response.status).toBe(500)
    })
  })

  describe("GET /health", () => {
    it("should return health status", async () => {
      healthController.healthCheck.mockImplementation((req, res) => res.status(200).json({ status: "OK" }))

      const response = await request(app).get("/health")

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK" })
    })

    it("should handle errors in health check", async () => {
      healthController.healthCheck.mockImplementation((req, res) => {
        throw new Error("Health check failed")
      })

      const response = await request(app).get("/health")

      expect(response.status).toBe(500)
    })
  })

  describe("404 Handling", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await request(app).get("/nonexistent-route")

      expect(response.status).toBe(404)
    })
  })
})
