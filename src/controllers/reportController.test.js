import { showReportsPage } from "./reportController.js"
import * as reportService from "../services/reportService.js"
import apiClient from "../api/apiClient.js"
import config from "../../config.js"
import { getSampleForPath } from "../utils/contractDataHelper.js"

jest.mock("../services/reportService.js")
jest.mock("../api/apiClient.js", () => ({ get: jest.fn() }))

describe("showReportsPage", () => {
  let req, res, next

  const listSample = getSampleForPath("/reports", "get", "200")
  const firstId = listSample.reportList[0].id
  const detailSample = {
    ...listSample.reportList[0],
    reportDownloadUrl: `${config.API_PROTOCOL}://${config.API_HOST}/csv/${firstId}`,
  }

  beforeEach(() => {
    req = {}
    res = { render: jest.fn() }
    next = jest.fn()
    jest.clearAllMocks()
  })

  it("renders index page with resolved download URLs", async () => {
    // 1. top‑level list succeeds
    reportService.getReports.mockResolvedValue(listSample)
    // 2. detail call for first ID succeeds
    apiClient.get.mockResolvedValueOnce({ data: detailSample })

    await showReportsPage(req, res, next)

    expect(apiClient.get).toHaveBeenCalledWith(`/reports/${firstId}`)
    expect(res.render).toHaveBeenCalledWith("main/index", {
      reports: [
        expect.objectContaining({
          id: firstId,
          reportDownloadUrl: expect.stringContaining(firstId),
        }),
      ],
    })
  })

  it("falls back to blank downloadUrl when a detail call fails", async () => {
    reportService.getReports.mockResolvedValue(listSample)
    // Simulate a failure on the detail request
    apiClient.get.mockRejectedValueOnce(new Error("boom"))

    await showReportsPage(req, res, next)

    expect(res.render).toHaveBeenCalledWith("main/index", {
      reports: [
        expect.objectContaining({
          id: firstId,
          reportDownloadUrl: "",
        }),
      ],
    })
  })

  it("renders error page if the top‑level list call throws", async () => {
    reportService.getReports.mockRejectedValue(new Error("API error"))

    await showReportsPage(req, res, next)

    expect(res.render).toHaveBeenCalledWith("main/error", {
      status: "An error occurred",
      error: "An error occurred while loading the reports.",
    })
  })
})