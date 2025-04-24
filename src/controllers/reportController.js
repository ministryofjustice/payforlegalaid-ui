import { getReports } from "../services/reportService.js"
import apiClient from "../api/apiClient.js"

/**
 * Renders the homepage with a list of reports.
 *
 * @param {object} req - The request object, containing information about the HTTP request.
 * @param {object} res - The response object, used to send back the desired HTTP response.
 * @returns {void}
 */
export async function showReportsPage(req, res) {
  console.log("Starting showReportsPage function")

  try {
    console.log("Attempting to fetch reports...")
    const data = await getReports()
    console.log("Successfully fetched reports data , {}", data)

    // Fetch detail for each report to obtain its correct download URL
    const reports = data.reportList
      ? await Promise.all(
          data.reportList.map(async report => {
            try {
              const { data: detail } = await apiClient.get(`/reports/${report.id}`)
              // detail is expected to contain `reportDownloadUrl`
              return {
                ...report,
                reportDownloadUrl: detail.reportDownloadUrl,
              }
            } catch (err) {
              console.error(`Failed to fetch detail for report ${report.id}:`, err.message)

              return { ...report, reportDownloadUrl: "" }
            }
          }),
        )
      : []

    console.log("Rendering reports page with", reports.length, "reports")
    res.render("main/index", { reports })
  } catch (error) {
    console.error("Error in showReportsPage:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })

    res.render("main/error", {
      status: "An error occurred",
      error: "An error occurred while loading the reports.",
    })
  }
}
