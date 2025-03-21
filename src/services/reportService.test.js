import { getReports } from "./reportService.js"
import apiClient from "../api/apiClient.js"
import { getSampleForPath } from "../utils/contractDataHelper.js"

jest.mock("../api/apiClient.js")

describe("reportService.getReports", () => {
  it("should return reportList from API response", async () => {
    // Generate sample data from the Swagger contract.
    const sampleData = getSampleForPath("/reports", "get", "200")

    // Simulate a successful API call using the contract-driven sample data.
    apiClient.get.mockResolvedValue({ data: sampleData })

    const result = await getReports()
    expect(result).toEqual(sampleData)
  })

  it("should throw an error when the API call fails", async () => {
    const error = new Error("API connection issue")
    // Simulate an API call failure.
    apiClient.get.mockRejectedValue(error)

    await expect(getReports()).rejects.toThrow("API connection issue")
  })
})
