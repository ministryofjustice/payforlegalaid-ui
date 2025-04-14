// Mock the controller
jest.resetModules()
jest.mock("../controllers/reportController.js", () => ({
  showReportsPage: jest.fn((req, res) => res.send("Mocked Report Page")),
}))

import request from "supertest"
import express from "express"
import router from "./index.js"

import { showReportsPage } from "../controllers/reportController.js"

describe("GET /", () => {
  let app

  beforeEach(() => {
    app = express()
    app.use((req, res, next) => {
      res.render = view => {
        res.send(`Rendered ${view}`)
      }
      next()
    })
    app.use("/", router)
  })

  it("should route GET / to showReportsPage", async () => {
    const response = await request(app).get("/").expect(200)
    expect(response.text).toContain("Mocked Report Page")
    expect(showReportsPage).toHaveBeenCalled()
  })
})
