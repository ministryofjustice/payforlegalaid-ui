import axios from 'axios';
import config from '../../config.js';

/**
 * Gets the list of reports from the API.
 * The API endpoint is built using config.API_PROTOCOL and config.API_HOST.
 */
export async function getReports() {
    // Construct the base URL using your config
    const baseURL = `${config.API_PROTOCOL}://${config.API_HOST}`;

    // Make the HTTP GET request to the /reports endpoint
    const response = await axios.get(`${baseURL}/reports`);

    // Return the response data (which should be in the form { reportList: [...] })
    return response.data;
}