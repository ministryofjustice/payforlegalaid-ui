import apiClient from "../api/apiClient.js";
import { isAuthEnabled } from '../auth/authUtils.js';
/**
 * Gets the list of reports from the API.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of reports.
 */
export async function getReports(accessToken) {

    let requestHeaders = {}
    if (isAuthEnabled()) {
        requestHeaders = {
            authorization: `Bearer ${accessToken}`
        }
    }

  const response = await apiClient.get("/reports", {
        headers: requestHeaders
    }
    
    );
    
  return response.data;
}
