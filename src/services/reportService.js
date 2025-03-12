import apiClient from '../api/apiClient.js';

/**
 * Gets the list of reports from the API.
 */

export async function getReports(accessToken) {
    const response = await apiClient.get('/reports', {
        headers: {
            authorization: `Bearer ${accessToken.accessToken}`
        }
    }
    );
    return response.data;
}