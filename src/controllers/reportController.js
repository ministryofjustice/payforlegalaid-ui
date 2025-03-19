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
  try {
    const data = await getReports()
    // Get the download URL for each report using the id
    const baseURL = `${config.API_PROTOCOL}://${config.API_HOST}`
    const reports = data.reportList.map(report => ({
      ...report,
      // Construct the URL.
      reportDownloadUrl: `${baseURL}/csv/${report.id}`,
    }))
    res.render("main/index", { reports })
  } catch (error) {
    console.error("Error fetching reports:", error)
    res.render("main/error", {
      status: "An error occurred",
      error: "An error occurred while loading the reports.",
    })
  }
}
