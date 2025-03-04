import { getReports } from '../services/reportService.js';

/**
 * Renders the homepage with a list of reports.
 * Uses dummy data that mimics the API response.
 */
export async function showReportsPage(req, res, next) {
    try {
        const data = await getReports();
        // Get the download URL for each report using the id
        const reports = data.reportList.map(report => ({
            ...report,
            // Construct the URL.
            reportDownloadUrl: `/csv/${report.id}`
        }));
        console.log("Reports: " + JSON.stringify(reports));
        res.render('main/index', { reports });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.render('main/error', {
            status: "An error occurred",
            error: "An error occurred while loading the reports."
        });
    }
}