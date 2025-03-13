import { getReports } from '../services/reportService.js';
import config from '../../config.js';
import { getAccessToken } from '../services/getAccessTokenService.js';
import { isAuthEnabled } from '../auth/authUtils.js';
/**
 * Renders the homepage with a list of reports.
 */
export async function showReportsPage(req, res) {

    if (isAuthEnabled() && !req.session.isAuthenticated) {
        console.info("User is not logged in, starting authentication flow")
        res.redirect("/auth/signin")
    } else {

        try {
            let accessToken = {}
            if (isAuthEnabled()){
                accessToken = await getAccessToken(req.session.account)
            }
            const data = await getReports(accessToken);
            // Get the download URL for each report using the id
            const baseURL = `${config.API_PROTOCOL}://${config.API_HOST}`;
            const reports = data.reportList.map(report => ({
                ...report,
                // Construct the URL.
                reportDownloadUrl: `${baseURL}/csv/${report.id}`
            }));
            res.render('main/index', { reports });
        } catch (error) {
            console.error("Error fetching reports:", error);
            res.render('main/error', {
                status: "An error occurred",
                error: "An error occurred while loading the reports."
            });
        }
    }
}