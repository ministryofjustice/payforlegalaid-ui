import apiClient from "../api/apiClient.js";

/**
 * Gets the list of reports from the API.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of reports.
 */
export async function getReports() {
  const response = await apiClient.get("/reports");
  return response.data;
}
