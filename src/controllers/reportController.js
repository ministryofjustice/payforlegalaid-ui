import { getReports } from "../services/reportService.js"
import config from "../../config.js"

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

    const baseURL = `${config.API_PROTOCOL}://${config.API_HOST}`
    console.log(`Constructing base URL: ${baseURL}`)

    const reports = data.reportList.map(report => {
      const downloadUrl = `${baseURL}/csv/${report.id}`
      console.log(`Generated download URL for report ${report.id}: ${downloadUrl}`)
      return {
        ...report,
        reportDownloadUrl: downloadUrl,
      }
    })

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
