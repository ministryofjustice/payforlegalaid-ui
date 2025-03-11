import apiClient from '../api/apiClient.js';

/**
 * Gets the list of reports from the API.
 */

export async function getReports() {
    const response = await apiClient.get('/reports');
    return response.data;
}