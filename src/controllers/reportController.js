import { getReports } from '../services/reportService.js';
import config from '../../config.js';
import { API_DEFAULT_SCOPES, authConfig } from '../auth/authConfig.js';
import authProvider from '../auth/authProvider.js';

/**
 * Renders the homepage with a list of reports.
 */
export async function showReportsPage(req, res) {
    if (!req.session.isAuthenticated) {
        console.info("User is not logged in, starting authentication flow")
        res.redirect("/auth/signin")
    } else {

        try {
            //TODO can this be cached??

            //We are logged in, get the access token to call the API
            const tokenRequest = {
                scopes: API_DEFAULT_SCOPES,
                account: req.session.account,
            };

            const accessToken = await authProvider.getMsalInstance(authConfig).acquireTokenSilent(tokenRequest);

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