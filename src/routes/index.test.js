import request from "supertest"
import express from "express"
import router from "./index.js"

// Mock the controller
jest.mock("../controllers/reportController.js", () => ({
  showReportsPage: jest.fn((req, res) => res.send("Mocked Report Page")),
}))

import { showReportsPage } from "../controllers/reportController.js"

describe("GET /", () => {
  let app

  beforeEach(() => {
    jest.resetAllMocks()
    app = express()
    app.use("/", router)
  })

  it("should route GET / to showReportsPage", async () => {
    const response = await request(app).get("/").expect(200)
    expect(response.text).toContain("Mocked Report Page")
    expect(showReportsPage).toHaveBeenCalled()
  })
})
