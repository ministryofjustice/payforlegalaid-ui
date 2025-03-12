import apiClient from '../api/apiClient.js';
import config from '../../config.js';
/**
 * Gets the list of reports from the API.
 */

export async function getReports(accessToken) {

    let requestHeaders = {}

    if (config.auth.isEnabled) {
        requestHeaders = {
            authorization: `Bearer ${accessToken}`
        }
    }
    const response = await apiClient.get('/reports', {
        headers: requestHeaders
    }
    );
    return response.data;
}